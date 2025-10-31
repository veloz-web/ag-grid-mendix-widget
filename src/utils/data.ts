// src/utils/data.js
import { ValueStatus } from "mendix";
import { compareValuesForSort } from "./formatters";
import {
    DateRangeValue,
    isDateRangeValue,
    normalizeDateRangeValue,
    toComparableDate,
    isRelativeDateRangeKey,
    resolveRelativeDateRange
} from "./dateRange";

/**
 * Safely extracts row data from the Mendix data source.
 * @param {object} dataSource - The Mendix dataSource prop.
 * @returns {Array} The array of data items.
 */
export const getRowData = (dataSource) => {
    if (!dataSource || dataSource.status !== ValueStatus.Available) {
        return [];
    }
    return dataSource.items || [];
};

/**
 * Get filterable columns (for the filter drawer).
 * @param {Array} columns - The widget's column props.
 * @param {Record<string, any>} activeFilters - The current active filters.
 * @returns {Array} The filterable columns.
 */
export const getFilterableColumns = (columns = [], activeFilters = {}) => {
    return columns
        .filter((col: any) => {
            // Support both legacy includeInFilters (boolean) and new filterLocation (enum)
            if (col.filterLocation) {
                return col.filterLocation === "drawer";
            }
            return col.includeInFilters === true;
        })
        .slice()
        .sort((a, b) => {
            const aId = a.attribute?.id;
            const bId = b.attribute?.id;
            const aActive = aId ? activeFilters[aId] !== undefined : false;
            const bActive = bId ? activeFilters[bId] !== undefined : false;

            if (aActive !== bActive) {
                return aActive ? -1 : 1;
            }

            const aLabel = a.header?.value || "";
            const bLabel = b.header?.value || "";
            return aLabel.localeCompare(bLabel);
        });
};

/**
 * Get distinct values for a specific column (useful for filters).
 * @param {Array} rowData - The raw row data.
 * @param {Array} columns - The widget's column props.
 * @param {string} columnId - The ID of the column to scan.
 * @returns {string[]} An array of distinct values.
 */
export const getDistinctValuesForColumn = (
    rowData: any[] = [],
    columns: any[] = [],
    columnId: string
): string[] => {
    const column = columns.find((col) => col.attribute?.id === columnId);
    if (!column || !column.attribute) return [];

    const values = new Set<string>();
    rowData.forEach((item) => {
        const value = column.attribute.get(item);
        if (value.status === ValueStatus.Available && value.value != null) {
            values.add(String(value.value));
        }
    });

    return Array.from(values).sort();
};

/**
 * Performs manual filtering and sorting for non-grid views (Cards, List).
 * @param {Array} rowData - The raw row data.
 * @param {Array} columns - The widget's column props.
 * @param {object} state - The component's state (activeFilters, globalSearch, sortModel).
 * @returns {Array} The filtered and sorted data.
 */
export const getFilteredData = (rowData = [], columns = [], state) => {
    const { activeFilters, globalSearch, sortModel } = state;

    const hasGlobalSearch = Boolean(globalSearch && globalSearch.trim() !== "");
    const hasActiveFilters = Object.keys(activeFilters).some((key) => {
        const value = activeFilters[key];
        if (isDateRangeValue(value)) {
            return Boolean(normalizeDateRangeValue(value as DateRangeValue));
        }
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return value !== undefined && value !== null && value !== "";
    });

    let filteredData = rowData;

    if (hasGlobalSearch || hasActiveFilters) {
        filteredData = rowData.filter((item) => {
            if (hasGlobalSearch) {
                const searchLower = globalSearch.toLowerCase();
                const matchesGlobalSearch = columns.some((col) => {
                    if (!col.attribute) return false;
                    const value = col.attribute.get(item);
                    if (value.status !== ValueStatus.Available) return false;
                    const itemValue = String(value.value || "").toLowerCase();
                    return itemValue.includes(searchLower);
                });
                if (!matchesGlobalSearch) return false;
            }

            return Object.entries(activeFilters).every(([columnId, filterValue]) => {
                if (filterValue === undefined || filterValue === null) return true;
                if (filterValue === "") return true;
                if (Array.isArray(filterValue) && filterValue.length === 0) return true;
                const normalizedRange = (() => {
                    if (typeof filterValue === "string" && isRelativeDateRangeKey(filterValue)) {
                        const resolved = resolveRelativeDateRange(filterValue);
                        return normalizeDateRangeValue(resolved);
                    }
                    if (isDateRangeValue(filterValue)) {
                        return normalizeDateRangeValue(filterValue as DateRangeValue);
                    }
                    return null;
                })();

                if (normalizedRange) {
                    const column = columns.find((col) => col.attribute?.id === columnId);
                    if (!column || !column.attribute) return true;
                    const value = column.attribute.get(item);
                    if (value.status !== ValueStatus.Available) return false;
                    const itemComparable = toComparableDate(value.value as any);
                    if (itemComparable === null) {
                        return false;
                    }
                    const fromComparable = normalizedRange.from
                        ? toComparableDate(normalizedRange.from)
                        : null;
                    const toComparableValue = normalizedRange.to
                        ? toComparableDate(normalizedRange.to)
                        : null;
                    if (fromComparable !== null && itemComparable < fromComparable) {
                        return false;
                    }
                    if (toComparableValue !== null && itemComparable > toComparableValue) {
                        return false;
                    }
                    return true;
                }

                const column = columns.find((col) => col.attribute?.id === columnId);
                if (!column || !column.attribute) return true;
                const value = column.attribute.get(item);
                if (value.status !== ValueStatus.Available) return false;
                const itemValue = String(value.value || "");

                if (Array.isArray(filterValue)) {
                    return filterValue.map(String).includes(itemValue);
                }

                const filter = String(filterValue);
                return itemValue === filter;
            });
        });
    }

    if (!sortModel || sortModel.length === 0) {
        return filteredData;
    }

    const currentSort = sortModel[0];
    if (!currentSort || !currentSort.colId || !currentSort.sort) {
        return filteredData;
    }

    const sortColumn = columns.find((col) => col.attribute?.id === currentSort.colId);
    if (!sortColumn || !sortColumn.attribute) {
        return filteredData;
    }

    const directionMultiplier = currentSort.sort === "desc" ? -1 : 1;

    return [...filteredData].sort((a, b) => {
        const aValue = sortColumn.attribute.get(a);
        const bValue = sortColumn.attribute.get(b);
        const aComparable = aValue && aValue.status === ValueStatus.Available ? aValue.value : null;
        const bComparable = bValue && bValue.status === ValueStatus.Available ? bValue.value : null;

        if (aComparable === null && bComparable === null) return 0;
        if (aComparable === null) return 1;
        if (bComparable === null) return -1;

        return compareValuesForSort(aComparable, bComparable) * directionMultiplier;
    });
};
