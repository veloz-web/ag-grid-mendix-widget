import { ReactElement, useState, useEffect, useRef } from "react";
import { ColumnsType } from "../../typings/AGGridProps";
import {
    DateRangeValue,
    isDateRangeValue,
    normalizeDateRangeValue,
    isRelativeDateRangeKey,
    relativeDateRangeOptions
} from "../utils/dateRange";

interface FilterDrawerProps {
    isOpen: boolean;
    filterableColumns: ColumnsType[];
    sortableColumns: ColumnsType[];
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    getDistinctValues: (columnId: string) => string[];
    onClose: () => void;
    onApplyFilters: (
        filters: Record<string, any>,
        search: string,
        sort: Array<{ colId: string; sort: "asc" | "desc" | null }>
    ) => void;
    onClearFilters: () => void;
    useLocalStorage?: boolean;
    onResetSettings?: () => void;
}

/**
 * Get the data type of a column based on its attribute type
 */
function getColumnDataType(column: ColumnsType): "date" | "number" | "boolean" | "string" {
    const explicitType = column.dataType && column.dataType !== "auto" ? column.dataType : null;
    if (explicitType === "date" || explicitType === "number" || explicitType === "boolean") {
        return explicitType;
    }
    if (explicitType === "string") {
        return "string";
    }

    if (!column.attribute) return "string";

    // Check the formatter enum for date-related formatters
    if (column.formatter) {
        const dateFormatters = [
            "dateShort",
            "dateLong",
            "dateISO",
            "dateDMY",
            "dateMDY",
            "dateYMD",
            "dateTime",
            "time"
        ];
        if (dateFormatters.includes(column.formatter)) {
            return "date";
        }

        const numberFormatters = [
            "currency",
            "currencyEUR",
            "currencyGBP",
            "percentage",
            "number",
            "decimal2"
        ];
        if (numberFormatters.includes(column.formatter)) {
            return "number";
        }

        const booleanFormatters = ["yesNo", "trueFalse"];
        if (booleanFormatters.includes(column.formatter)) {
            return "boolean";
        }
    }

    // Try to infer from the attribute type at runtime
    const attrType = (column.attribute as any).type;
    if (attrType === "DateTime") return "date";
    if (attrType === "Integer" || attrType === "Long" || attrType === "Decimal") return "number";
    if (attrType === "Boolean") return "boolean";

    return "string";
}

/**
 * Infer data type from actual values when column metadata isn't conclusive
 */
function inferTypeFromValues(values: string[]): "date" | "number" | "boolean" | "string" {
    if (values.length === 0) return "string";

    // Check first few values
    const samples = values.slice(0, Math.min(5, values.length));

    // Check if all samples are dates
    const allDates = samples.every((v) => {
        const date = new Date(v);
        return !isNaN(date.getTime()) && v.match(/\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{2,4}/);
    });
    if (allDates) return "date";

    // Check if all samples are numbers
    const allNumbers = samples.every((v) => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    if (allNumbers) return "number";

    // Check if all samples are booleans
    const allBooleans = samples.every(
        (v) =>
            v.toLowerCase() === "true" ||
            v.toLowerCase() === "false" ||
            v.toLowerCase() === "yes" ||
            v.toLowerCase() === "no"
    );
    if (allBooleans) return "boolean";

    return "string";
}

/**
 * Format a date value for display
 */
function formatDateValue(value: string): string {
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOfWeek = days[date.getDay()];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        return `${dayOfWeek} ${month}/${day}/${year}`;
    } catch {
        return value;
    }
}

/**
 * Parse a value to its appropriate type for sorting
 */
function parseValueForSorting(
    value: string,
    dataType: "date" | "number" | "boolean" | "string"
): any {
    if (!value) return value;

    switch (dataType) {
        case "date":
            const dateVal = new Date(value);
            return isNaN(dateVal.getTime()) ? value : dateVal.getTime();
        case "number":
            const numVal = parseFloat(value);
            return isNaN(numVal) ? value : numVal;
        case "boolean":
            return value.toLowerCase() === "true" ? 1 : 0;
        default:
            return value;
    }
}

/**
 * Sort distinct values based on their data type
 */
function sortDistinctValues(
    values: string[],
    dataType: "date" | "number" | "boolean" | "string"
): string[] {
    return [...values].sort((a, b) => {
        const parsedA = parseValueForSorting(a, dataType);
        const parsedB = parseValueForSorting(b, dataType);

        if (parsedA < parsedB) return -1;
        if (parsedA > parsedB) return 1;
        return 0;
    });
}

export function FilterDrawer(props: FilterDrawerProps): ReactElement | null {
    const {
        isOpen,
        filterableColumns,
        sortableColumns,
        activeFilters,
        globalSearch,
        sortModel,
        getDistinctValues,
        onClose,
        onApplyFilters,
        onClearFilters,
        useLocalStorage = false,
        onResetSettings
    } = props;

    // Local state for pending changes
    const [localFilters, setLocalFilters] = useState(activeFilters);
    const [localSearch, setLocalSearch] = useState(globalSearch);
    const [localSort, setLocalSort] = useState(sortModel);
    const drawerRef = useRef<HTMLDivElement>(null);

    // Sync with props when drawer opens or props change
    useEffect(() => {
        setLocalFilters(activeFilters);
        setLocalSearch(globalSearch);
        setLocalSort(sortModel);
    }, [isOpen, activeFilters, globalSearch, sortModel]);

    // Focus management
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            drawerRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleApply = () => {
        onApplyFilters(localFilters, localSearch, localSort);
        onClose();
    };

    const handleClear = () => {
        setLocalFilters({});
        setLocalSearch("");
        setLocalSort([]);
        onClearFilters();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={drawerRef}
            className="aggrid-filter-drawer"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className="filter-drawer-overlay" onClick={onClose}></div>
            <div
                className="filter-drawer-content"
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
            >
                <div className="filter-drawer-header">
                    <h3>Filters</h3>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
                <div className="filter-drawer-body">
                    {/* Column-specific Filters */}
                    {filterableColumns.length > 0 && (
                        <div className="filter-section">
                            <h4 className="filter-section-title">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    style={{ marginRight: "8px", verticalAlign: "middle" }}
                                >
                                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                                </svg>
                                Column Filters
                            </h4>
                            {filterableColumns.map((col, idx) => {
                                const columnId = col.attribute?.id || "";
                                const distinctValues = getDistinctValues(columnId);
                                const dataTypeOverride = col.dataType && col.dataType !== "auto";
                                let dataType = getColumnDataType(col);

                                if (!dataTypeOverride && dataType === "string" && distinctValues.length > 0) {
                                    dataType = inferTypeFromValues(distinctValues);
                                }

                                const filterValue = localFilters[columnId];
                                const useDateRangeControl = Boolean(col.useDateRange && dataType === "date");
                                const useRelativeRangeControl = Boolean(
                                    col.useRelativeRange && dataType === "date"
                                );

                                if (useRelativeRangeControl) {
                                    const currentValue =
                                        typeof filterValue === "string" &&
                                        isRelativeDateRangeKey(filterValue)
                                            ? filterValue
                                            : "";

                                    return (
                                        <div key={idx} className="filter-item">
                                            <label>{col.header?.value || "Field"}</label>
                                            <div className="filter-select-wrapper">
                                                <select
                                                    className="filter-select"
                                                    value={currentValue}
                                                    onChange={(e) => {
                                                        const { value } = e.target;
                                                        setLocalFilters((prev) => {
                                                            const next = { ...prev };
                                                            if (!value) {
                                                                delete next[columnId];
                                                            } else {
                                                                next[columnId] = value;
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    <option value="">All dates</option>
                                                    {relativeDateRangeOptions.map((option) => (
                                                        <option key={option.key} value={option.key}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {currentValue && (
                                                    <button
                                                        className="clear-filter-btn"
                                                        onClick={() => {
                                                            setLocalFilters((prev) => {
                                                                const next = { ...prev };
                                                                delete next[columnId];
                                                                return next;
                                                            });
                                                        }}
                                                        title="Clear filter"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                if (useDateRangeControl) {
                                    const normalizedRange =
                                        normalizeDateRangeValue(
                                            isDateRangeValue(filterValue)
                                                ? (filterValue as DateRangeValue)
                                                : undefined
                                        ) || {};
                                    const fromValue = normalizedRange.from ?? "";
                                    const toValue = normalizedRange.to ?? "";
                                    const hasRangeValue = Boolean(fromValue || toValue);

                                    const updateRange = (key: "from" | "to", value: string) => {
                                        setLocalFilters((prev) => {
                                            const next = { ...prev };
                                            const existing =
                                                normalizeDateRangeValue(
                                                    isDateRangeValue(next[columnId])
                                                        ? (next[columnId] as DateRangeValue)
                                                        : undefined
                                                ) || {};
                                            const candidate: DateRangeValue = {
                                                ...existing,
                                                [key]: value ? value : undefined
                                            };
                                            const normalizedCandidate = normalizeDateRangeValue(candidate);
                                            if (normalizedCandidate) {
                                                next[columnId] = normalizedCandidate;
                                            } else {
                                                delete next[columnId];
                                            }
                                            return next;
                                        });
                                    };

                                    const clearRange = () => {
                                        setLocalFilters((prev) => {
                                            if (!(columnId in prev)) {
                                                return prev;
                                            }
                                            const next = { ...prev };
                                            delete next[columnId];
                                            return next;
                                        });
                                    };

                                    return (
                                        <div key={idx} className="filter-item">
                                            <label>{col.header?.value || "Field"}</label>
                                            <div className="filter-date-range">
                                                <div className="filter-date-field">
                                                    <span>From</span>
                                                    <input
                                                        type="date"
                                                        value={fromValue}
                                                        onChange={(e) => updateRange("from", e.target.value)}
                                                    />
                                                </div>
                                                <div className="filter-date-field">
                                                    <span>To</span>
                                                    <input
                                                        type="date"
                                                        value={toValue}
                                                        onChange={(e) => updateRange("to", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            {hasRangeValue && (
                                                <button
                                                    type="button"
                                                    className="clear-filter-link"
                                                    onClick={clearRange}
                                                >
                                                    Clear range
                                                </button>
                                            )}
                                        </div>
                                    );
                                }

                                const sortedValues = sortDistinctValues(distinctValues, dataType);
                                const currentValue = typeof filterValue === "string" ? filterValue : "";

                                return (
                                    <div key={idx} className="filter-item">
                                        <label>{col.header?.value || "Field"}</label>
                                        <div className="filter-select-wrapper">
                                            <select
                                                className="filter-select"
                                                value={currentValue}
                                                onChange={(e) =>
                                                    setLocalFilters({
                                                        ...localFilters,
                                                        [columnId]: e.target.value
                                                    })
                                                }
                                            >
                                                <option value="">All values</option>
                                                {sortedValues.map((value, vidx) => (
                                                    <option key={vidx} value={value}>
                                                        {dataType === "date"
                                                            ? formatDateValue(value)
                                                            : value}
                                                    </option>
                                                ))}
                                            </select>
                                            {currentValue && (
                                                <button
                                                    className="clear-filter-btn"
                                                    onClick={() => {
                                                        const newFilters = { ...localFilters };
                                                        delete newFilters[columnId];
                                                        setLocalFilters(newFilters);
                                                    }}
                                                    title="Clear filter"
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Global Search */}
                    <div className="filter-section">
                        <h4 className="filter-section-title">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                style={{ marginRight: "8px", verticalAlign: "middle" }}
                            >
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                            Search
                        </h4>
                        <div className="filter-item global-search">
                            <input
                                type="text"
                                className="global-search-input"
                                placeholder="Search across all columns..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                            />
                            {localSearch && (
                                <button
                                    className="clear-search-btn"
                                    onClick={() => setLocalSearch("")}
                                    title="Clear search"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sorting */}
                    {sortableColumns.length > 0 && (
                        <div className="filter-section">
                            <h4 className="filter-section-title">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    style={{ marginRight: "8px", verticalAlign: "middle" }}
                                >
                                    <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                                </svg>
                                Sort
                            </h4>
                            <div className="filter-item sort-item">
                                <label>Sort By Column</label>
                                <div className="filter-select-wrapper">
                                    <select
                                        className="filter-select"
                                        value={localSort.length > 0 ? localSort[0].colId : ""}
                                        onChange={(e) => {
                                            const columnId = e.target.value;
                                            if (columnId) {
                                                // Keep existing direction or default to asc
                                                const existingDirection =
                                                    localSort.length > 0 &&
                                                    localSort[0].colId === columnId
                                                        ? localSort[0].sort
                                                        : "asc";
                                                setLocalSort([
                                                    { colId: columnId, sort: existingDirection }
                                                ]);
                                            } else {
                                                setLocalSort([]);
                                            }
                                        }}
                                    >
                                        <option value="">No sorting</option>
                                        {sortableColumns.map((col, idx) => (
                                            <option key={idx} value={col.attribute?.id || ""}>
                                                {col.header?.value || "Field"}
                                            </option>
                                        ))}
                                    </select>
                                    {localSort.length > 0 && (
                                        <button
                                            className="clear-filter-btn"
                                            onClick={() => setLocalSort([])}
                                            title="Clear sort"
                                        >
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {localSort.length > 0 && (
                                <div className="filter-item">
                                    <label>Sort Direction</label>
                                    <div className="sort-direction-buttons">
                                        <button
                                            className={`sort-direction-btn ${
                                                localSort[0].sort === "asc" ? "active" : ""
                                            }`}
                                            onClick={() =>
                                                setLocalSort([
                                                    { colId: localSort[0].colId, sort: "asc" }
                                                ])
                                            }
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M7 14l5-5 5 5z" />
                                            </svg>
                                            <span>Ascending</span>
                                        </button>
                                        <button
                                            className={`sort-direction-btn ${
                                                localSort[0].sort === "desc" ? "active" : ""
                                            }`}
                                            onClick={() =>
                                                setLocalSort([
                                                    { colId: localSort[0].colId, sort: "desc" }
                                                ])
                                            }
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M7 10l5 5 5-5z" />
                                            </svg>
                                            <span>Descending</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {filterableColumns.length === 0 && !localSearch && (
                        <p className="no-filters">No filterable columns configured.</p>
                    )}
                </div>
                <div className="filter-drawer-footer">
                    <button className="clear-filters-btn" onClick={handleClear}>
                        Clear All
                    </button>
                    <button className="apply-filters-btn" onClick={handleApply}>
                        Apply Changes
                    </button>
                </div>
                {useLocalStorage && onResetSettings && (
                    <div className="filter-drawer-footer-secondary">
                        <button className="reset-settings-btn" onClick={onResetSettings}>
                            Reset System Grid Settings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
