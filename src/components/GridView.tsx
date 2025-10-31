// GridView.tsx
import React, { ReactElement, useMemo } from "react"; // <-- Changed import
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, ColumnPinnedEvent } from "ag-grid-community"; // <-- Removed 'Theme'
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";
import { renderStatusBadge, renderLink, applyFormatter } from "../utils/formatters";
import { evaluateTemplate } from "../utils/renderers";
import { CustomFormatterRegistry } from "../utils/customFormatters";

interface GridViewProps {
    rowData: any[];
    columns: ColumnsType[];
    themeClassName: string; // <-- Changed: from theme: Theme
    height: number;
    pagination: boolean;
    pageSize: number;
    onGridReady: (params: GridReadyEvent) => void;
    onRowClicked: (event: any) => void;
    onSortChanged?: () => void;
    onFilterChanged?: () => void;
    onColumnMoved?: () => void;
    onColumnPinned?: (event: ColumnPinnedEvent) => void;
    columnVisibility?: Record<string, boolean>;
    columnOrder?: string[];
    customFormatterRegistry?: CustomFormatterRegistry;
    enableContextMenu: boolean;
    enableSideBar: boolean;
    enableStatusBar: boolean;
}

// --- Helper function moved outside the component for memoization ---
/**
 * Helper function to determine cell alignment
 */
const getCellAlignment = (col: ColumnsType): string => {
    // If explicit alignment is set and not auto, use it
    if (col.alignment && col.alignment !== "auto") {
        return col.alignment;
    }

    const explicitDataType = col.dataType && col.dataType !== "auto" ? col.dataType : null;

    if (explicitDataType === "number" || explicitDataType === "date") {
        return "right";
    }
    if (explicitDataType === "boolean") {
        return "center";
    }

    // Auto alignment logic based on data type and formatter
    const formatter = col.formatter || "none";
    const attributeType = col.attribute?.type || "String";

    // Links, status badges, and actions are centered
    if (formatter === "link" || formatter === "statusBadge") {
        return "center";
    }

    // Numbers and dates are right-aligned
    if (
        attributeType === "Integer" ||
        attributeType === "Long" ||
        attributeType === "Decimal" ||
        attributeType === "DateTime" ||
        formatter === "currency" ||
        formatter === "currencyEUR" ||
        formatter === "currencyGBP" ||
        formatter === "percentage" ||
        formatter === "number" ||
        formatter === "decimal2" ||
        formatter.startsWith("date") ||
        formatter === "time"
    ) {
        return "right";
    }

    // Text and everything else is left-aligned (default)
    return "left";
};

/**
 * Maps a single Mendix column configuration to an AG Grid ColDef.
 * This is split into a helper for readability and use in useMemo.
 */
function mapMendixColumnToColDef(
    col: ColumnsType,
    columns: ColumnsType[],
    customFormatterRegistry?: CustomFormatterRegistry
): ColDef {
    const isFilterEnabled = col.filter !== false;
    const explicitDataType = col.dataType && col.dataType !== "auto" ? col.dataType : null;
    const colDef: ColDef = {
        headerName: col.header?.value || "",
        field: col.attribute?.id || "",
        sortable: col.sortable,
        resizable: col.resizable,
        suppressMovable: col.draggable === false, // AG Grid uses suppressMovable (inverted logic)
        valueGetter: (params) => {
            try {
                const item = params.data;
                if (!item) return "";

                if (col.template) {
                    return evaluateTemplate(col.template, item, columns);
                }

                if (!col.attribute) return "";
                const value = col.attribute.get(item);
                if (value.status !== ValueStatus.Available) return "";
                return value.value;
            } catch (e) {
                console.error("Error in valueGetter:", e);
                return "";
            }
        }
    };

    if (explicitDataType) {
        if (explicitDataType === "string") {
            colDef.cellDataType = "text";
        } else {
            colDef.cellDataType = explicitDataType;
        }
    }

    const usesDateLikeFilter = Boolean(
        isFilterEnabled && (col.useDateRange || col.useRelativeRange || explicitDataType === "date")
    );

    if (usesDateLikeFilter) {
        colDef.filter = "agDateColumnFilter";
    } else {
        colDef.filter = isFilterEnabled;
    }

    // Apply width settings
    if (col.widthType === "flex") {
        colDef.flex = col.flex || 1;
        colDef.minWidth = col.minWidth || 50;
        if (col.maxWidth && col.maxWidth > 0) {
            colDef.maxWidth = col.maxWidth;
        }
    } else if (col.widthType === "auto") {
        colDef.minWidth = col.minWidth || 50;
        if (col.maxWidth && col.maxWidth > 0) {
            colDef.maxWidth = col.maxWidth;
        }
    } else {
        colDef.width = col.width || 150;
    }

    if (col.pinned && col.pinned !== "none") {
        colDef.pinned = col.pinned;
    }

    if (!col.pinnable) {
        colDef.lockPinned = true; // Prevent end users from changing the pin state when disabled
    }

    if (col.floatingFilter && isFilterEnabled) {
        colDef.floatingFilter = true;
    }

    if (usesDateLikeFilter) {
        colDef.filter = "agDateColumnFilter";
        colDef.filterParams = {
            ...(colDef.filterParams || {}),
            comparator: (filterLocalDateAtMidnight: Date, cellValue: any) => {
                if (!cellValue) {
                    return -1;
                }

                let cellDate: Date;
                if (cellValue instanceof Date) {
                    cellDate = cellValue;
                } else {
                    const parsed = new Date(cellValue);
                    if (isNaN(parsed.getTime())) {
                        return -1;
                    }
                    cellDate = parsed;
                }

                const cellComparable = Date.UTC(
                    cellDate.getFullYear(),
                    cellDate.getMonth(),
                    cellDate.getDate()
                );
                const filterComparable = Date.UTC(
                    filterLocalDateAtMidnight.getFullYear(),
                    filterLocalDateAtMidnight.getMonth(),
                    filterLocalDateAtMidnight.getDate()
                );

                if (cellComparable === filterComparable) {
                    return 0;
                }

                return cellComparable < filterComparable ? -1 : 1;
            }
        };
    }

    // Apply text alignment
    const alignment = getCellAlignment(col);
    colDef.cellStyle = { textAlign: alignment };
    colDef.headerClass = `ag-header-cell-${alignment}`;

    // Handle hidden columns
    if (col.hidden) {
        colDef.hide = true;
    }

    // Handle template columns
    if (col.template) {
        colDef.sortable = false;
        colDef.filter = false;
    }

    // --- Apply Cell Renderers (using JSX) or Value Formatters ---
    const effectiveFormatter = col.customFormatterName || col.formatter;
    const customFormatterNameTrimmed = col.customFormatterName?.trim();

    if (customFormatterNameTrimmed && customFormatterNameTrimmed.length > 0) {
        // --- Custom Formatter ---
        if (customFormatterRegistry && customFormatterRegistry.has(customFormatterNameTrimmed)) {
            colDef.cellRenderer = (params: any) => {
                try {
                    const htmlString = customFormatterRegistry.execute(customFormatterNameTrimmed, {
                        value: params.value,
                        item: params.data,
                        column: col
                    });
                    // Use JSX for dangerouslySetInnerHTML
                    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
                } catch (e) {
                    console.error(
                        `Error rendering custom formatter "${customFormatterNameTrimmed}":`,
                        e
                    );
                    return String(params.value || "");
                }
            };
        } else {
            // Custom formatter not found - show error
            console.error(
                `[AG Grid] Custom formatter "${customFormatterNameTrimmed}" not found for column "${col.header?.value}". ` +
                    `Available formatters: ${
                        customFormatterRegistry
                            ? customFormatterRegistry.getFormatterNames().join(", ")
                            : "none"
                    }`
            );
            // Render error message in cell using JSX
            colDef.cellRenderer = () => (
                <span
                    style={{ color: "red", fontStyle: "italic" }}
                    title={`Custom formatter "${customFormatterNameTrimmed}" not found`}
                >
                    ⚠️ Formatter not found: {customFormatterNameTrimmed}
                </span>
            );
        }
    } else if (effectiveFormatter === "statusBadge") {
        // --- Status Badge Renderer ---
        colDef.cellRenderer = (params: any) => {
            try {
                const mappingValue = col.statusMapping || "";
                const htmlString = renderStatusBadge(params.value, mappingValue);
                return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
            } catch (e) {
                console.error("Error rendering status badge:", e);
                return String(params.value || "");
            }
        };
    } else if (effectiveFormatter === "link") {
        // --- Link/Action Renderer ---
        colDef.cellRenderer = (params: any) => {
            try {
                // 1. Mendix Action (Preferred)
                if (col.linkAction && params.data) {
                    const rowAction = col.linkAction.get(params.data);

                    if (rowAction && rowAction.canExecute) {
                        const rawValue = params.value;
                        const displayText = col.linkText
                            ? col.linkText.replace(/\$\{value\}/g, String(rawValue ?? ""))
                            : String(rawValue ?? "");

                        const handleAction = (e: React.MouseEvent | React.KeyboardEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTimeout(() => {
                                rowAction.execute();
                            }, 0);
                        };

                        // Render as accessible button using JSX
                        return (
                            <button
                                type="button"
                                className="aggrid-link-button"
                                onClick={handleAction}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleAction(e);
                                    }
                                }}
                            >
                                {displayText || <span className="fas fa-eye" />}
                            </button>
                        );
                    }
                }

                // 2. Legacy URL Pattern (Fallback)
                if (col.linkUrlPattern) {
                    const htmlString = renderLink(params.value, col.linkUrlPattern, col.linkText);
                    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
                }

                return String(params.value || "");
            } catch (e) {
                console.error("Error rendering link:", e);
                return String(params.value || "");
            }
        };
    } else {
        // --- Default Value Formatter (for text, numbers, dates) ---
        colDef.valueFormatter = (params) => {
            try {
                if (params.value === null || params.value === undefined) return "";
                return applyFormatter(
                    params.value,
                    col.formatter || "none",
                    (col.attribute?.type || "String") as any,
                    col.customPrefix,
                    col.customSuffix
                );
            } catch (e) {
                console.error("Error in formatter:", e);
                return String(params.value || "");
            }
        };
    }

    return colDef;
}

// --- The Main GridView Component ---

export function GridView(props: GridViewProps): ReactElement {
    const {
        rowData,
        columns,
        themeClassName, // <-- Changed
        height,
        pagination,
        pageSize,
        onGridReady,
        onRowClicked,
        onSortChanged,
        onFilterChanged,
        onColumnMoved,
        onColumnPinned,
        columnVisibility,
        columnOrder,
        customFormatterRegistry,
        enableContextMenu,
        enableSideBar,
        enableStatusBar
    } = props;

    const statusBarConfig = useMemo(() => {
        if (!enableStatusBar) {
            return undefined;
        }

        return {
            statusPanels: [
                { statusPanel: "agTotalRowCountComponent", align: "left" },
                { statusPanel: "agFilteredRowCountComponent" },
                { statusPanel: "agSelectedRowCountComponent" },
                { statusPanel: "agAggregationComponent" }
            ]
        };
    }, [enableStatusBar]);

    // --- IMPROVEMENT: Memoize column definitions ---
    // This expensive calculation will only run when these specific props change.
    const columnDefs = useMemo(() => {
        const visibleColumns = columns.filter((col) => {
            if (!col.attribute?.id) return true; // Show columns without attributes
            return columnVisibility?.[col.attribute.id] !== false;
        });

        // Apply column order if provided
        let orderedColumns = visibleColumns;
        if (columnOrder && columnOrder.length > 0) {
            const orderMap = new Map(columnOrder.map((id, index) => [id, index]));
            orderedColumns = visibleColumns.sort((a, b) => {
                const aId = a.attribute?.id || "";
                const bId = b.attribute?.id || "";
                const aIndex = orderMap.get(aId) ?? 999;
                const bIndex = orderMap.get(bId) ?? 999;
                return aIndex - bIndex;
            });
        }

        // Map to AG Grid ColDef using the helper
        return orderedColumns.map((col) =>
            mapMendixColumnToColDef(col, columns, customFormatterRegistry)
        );
    }, [columns, columnVisibility, columnOrder, customFormatterRegistry]);

    return (
        // --- THEME FIX: Apply theme class to the wrapper div ---
        <div className={themeClassName} style={{ height: `${height}px`, width: "100%" }}>
            <AgGridReact
                // theme={theme} // <-- Removed: Theme is now on the wrapper
                columnDefs={columnDefs} // <-- Removed 'as any'
                rowData={rowData}
                pagination={pagination}
                paginationPageSize={pageSize}
                onGridReady={onGridReady} // <-- Removed 'as any'
                onRowClicked={onRowClicked}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                onColumnPinned={onColumnPinned}
                animateRows={true}
                suppressCellFocus={false}
                enableCellTextSelection={true}
                ensureDomOrder={true}
                suppressContextMenu={!enableContextMenu}
                sideBar={enableSideBar ? true : undefined}
                statusBar={statusBarConfig}
                defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                    suppressKeyboardEvent: (params) => {
                        // Allow keyboard navigation in cells with buttons
                        const key = params.event.key;
                        const isEditing = params.editing;

                        // Don't suppress if we're in an editable cell
                        if (isEditing) return false;

                        // For cells with buttons, allow Enter/Space to activate them
                        if ((key === "Enter" || key === " ") && params.node.data) {
                            const element = params.event.target as HTMLElement;
                            if (element.tagName === "BUTTON") {
                                return false; // Don't suppress, let button handle it
                            }
                        }

                        // Don't suppress other keys (this is default, but explicit)
                        return false;
                    }
                }}
            />
        </div>
    );
}
