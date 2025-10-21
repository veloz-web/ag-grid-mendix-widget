import { ReactElement, createElement } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, Theme } from "ag-grid-community";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";
import { renderStatusBadge, renderLink, applyFormatter } from "../utils/formatters";
import { evaluateTemplate } from "../utils/renderers";

interface GridViewProps {
    rowData: any[];
    columns: ColumnsType[];
    theme: Theme;
    height: number;
    pagination: boolean;
    pageSize: number;
    onGridReady: (params: GridReadyEvent) => void;
    onRowClicked: (event: any) => void;
    onSortChanged?: () => void;
    onFilterChanged?: () => void;
    onColumnMoved?: () => void;
    columnVisibility?: Record<string, boolean>;
    columnOrder?: string[];
}

export function GridView(props: GridViewProps): ReactElement {
    const {
        rowData,
        columns,
        theme,
        height,
        pagination,
        pageSize,
        onGridReady,
        onRowClicked,
        onSortChanged,
        onFilterChanged,
        onColumnMoved,
        columnVisibility,
        columnOrder
    } = props;

    // Helper function to determine cell alignment
    const getCellAlignment = (col: ColumnsType): string => {
        // If explicit alignment is set and not auto, use it
        if (col.alignment && col.alignment !== "auto") {
            return col.alignment;
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

    const getColumnDefs = (): ColDef[] => {
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

        const colDefs = orderedColumns.map((col) => {
            const colDef: ColDef = {
                headerName: col.header?.value || "",
                field: col.attribute?.id || "",
                sortable: col.sortable,
                filter: col.filter,
                resizable: col.resizable,
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

            // Apply width settings based on widthType
            if (col.widthType === "flex") {
                // Flexible width (like CSS fr units)
                colDef.flex = col.flex || 1;
                colDef.minWidth = col.minWidth || 50;
                if (col.maxWidth && col.maxWidth > 0) {
                    colDef.maxWidth = col.maxWidth;
                }
            } else if (col.widthType === "auto") {
                // Auto width (fit content)
                colDef.minWidth = col.minWidth || 50;
                if (col.maxWidth && col.maxWidth > 0) {
                    colDef.maxWidth = col.maxWidth;
                }
                // Don't set width or flex for auto
            } else {
                // Fixed width (default, pixels)
                colDef.width = col.width || 150;
            }

            // Apply text alignment
            const alignment = getCellAlignment(col);
            colDef.cellStyle = { textAlign: alignment };
            // Also align the header
            colDef.headerClass = `ag-header-cell-${alignment}`;

            // Handle hidden columns
            if (col.hidden) {
                colDef.hide = true;
            }

            // Handle template columns (virtual concatenated)
            if (col.template) {
                colDef.sortable = false;
                colDef.filter = false;
            }

            // Use cellRenderer for statusBadge and link, valueFormatter for others
            if (col.formatter === "statusBadge") {
                colDef.cellRenderer = (params: any) => {
                    try {
                        const mappingValue = col.statusMapping || "";
                        const htmlString = renderStatusBadge(params.value, mappingValue);

                        // Use React.createElement to create a span with dangerouslySetInnerHTML
                        return createElement("span", {
                            dangerouslySetInnerHTML: { __html: htmlString }
                        });
                    } catch (e) {
                        console.error("Error rendering status badge:", e);
                        return String(params.value || "");
                    }
                };
            } else if (col.formatter === "link") {
                colDef.cellRenderer = (params: any) => {
                    try {
                        // If there's a linkAction, create an accessible button with per-row context
                        if (col.linkAction && params.data) {
                            const rowAction = col.linkAction.get(params.data);

                            if (rowAction && rowAction.canExecute) {
                                const rawValue = params.value;
                                const displayText = col.linkText
                                    ? col.linkText.replace(/\$\{value\}/g, String(rawValue ?? ""))
                                    : String(rawValue ?? "");

                                return createElement(
                                    "button",
                                    {
                                        type: "button",
                                        className: "aggrid-link-button",
                                        onClick: (e: any) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // Defer execution to next tick for React-only mode compatibility
                                            setTimeout(() => {
                                                rowAction.execute();
                                            }, 0);
                                        },
                                        onKeyDown: (e: any) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Defer execution to next tick for React-only mode compatibility
                                                setTimeout(() => {
                                                    rowAction.execute();
                                                }, 0);
                                            }
                                        }
                                    },
                                    displayText ||
                                        createElement("span", { className: "fas fa-eye" })
                                );
                            }
                        }

                        // Fallback to legacy URL pattern - create accessible button that triggers row click
                        if (col.linkUrlPattern) {
                            const htmlString = renderLink(
                                params.value,
                                col.linkUrlPattern,
                                col.linkText
                            );

                            return createElement("span", {
                                dangerouslySetInnerHTML: { __html: htmlString }
                            });
                        }

                        return String(params.value || "");
                    } catch (e) {
                        console.error("Error rendering link:", e);
                        return String(params.value || "");
                    }
                };
            } else {
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
        });

        return colDefs;
    };

    const columnDefs = getColumnDefs();

    return (
        <div style={{ height: `${height}px`, width: "100%" }}>
            <AgGridReact
                theme={theme}
                columnDefs={columnDefs as any}
                rowData={rowData}
                pagination={pagination}
                paginationPageSize={pageSize}
                onGridReady={onGridReady as any}
                onRowClicked={onRowClicked}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                animateRows={true}
                suppressCellFocus={false}
                enableCellTextSelection={true}
                ensureDomOrder={true}
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

                        return false;
                    }
                }}
            />
        </div>
    );
}
