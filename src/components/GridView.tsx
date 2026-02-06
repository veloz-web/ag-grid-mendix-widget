// GridView.tsx
import React, { ReactElement, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridReadyEvent, ColumnPinnedEvent } from "ag-grid-community";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";
import { CustomFormatterRegistry } from "../utils/customFormatters";
import { buildColumnDefs } from "../utils/column/mapping";
import { calculatePinnedBottomRow } from "../utils/aggregation/calculator";

interface GridViewProps {
    rowData: any[];
    columns: ColumnsType[];
    themeClassName: string;
    height: number;
    pagination: boolean;
    pageSize: number;
    /** Row height mode: fixed, auto, or custom */
    rowHeightMode?: "fixed" | "auto" | "custom";
    /** Row height in pixels */
    rowHeight?: number;
    /** JavaScript expression for custom row height */
    rowHeightExpression?: string;
    /** Maximum row height in pixels (0 = unlimited) */
    maxRowHeight?: number;
    /** Row class mode: none, mapping, or expression */
    rowClassMode?: "none" | "mapping" | "expression";
    /** Attribute used for row class mapping */
    rowClassAttribute?: ColumnsType["attribute"];
    /** JSON mapping of value -> class name */
    rowClassMapping?: string;
    /** Default row class when mapping/expression returns nothing */
    rowClassDefault?: string;
    /** JavaScript expression for row class */
    rowClassExpression?: string;
    /** Extra rows rendered above/below viewport (default: 10) */
    rowBuffer?: number;
    /** Disable row virtualisation — render ALL rows in DOM (default: false) */
    suppressRowVirtualisation?: boolean;
    /** Rows per server-side fetch block (default: 100) */
    cacheBlockSize?: number;
    /** Max server-side blocks in memory (0 = unlimited) */
    maxBlocksInCache?: number;
    /** Max concurrent server-side requests (default: 2) */
    maxConcurrentRequests?: number;
    onGridReady: (params: GridReadyEvent) => void;
    onRowClicked: (event: any) => void;
    onRowDoubleClicked?: (event: any) => void;
    onSortChanged?: (event: any) => void;
    onFilterChanged?: (event: any) => void;
    onColumnMoved?: (event: any) => void;
    onColumnPinned?: (event: ColumnPinnedEvent) => void;
    /** Called when the 'Show/Hide Columns' header menu item is selected */
    onOpenColumnVisibility?: () => void;
    onOpenHiddenDrawer?: () => void;
    columnVisibility?: Record<string, boolean>;
    columnOrder?: string[];
    customFormatterRegistry?: CustomFormatterRegistry;
    enableContextMenu: boolean;
    enableSideBar: boolean;
    enableStatusBar: boolean;
    enableAggregationFooter: boolean;
    enableRowGrouping: boolean;
    groupDefaultExpanded: number;
    showGroupRowsOnSeparateLine: boolean;
    suppressAggregationOnGroupRows: boolean;
    enableColumnMenus: boolean;
    enableHeaderFilterButtons: boolean;
    enableFloatingFilters: boolean;
    rowModelType?: "clientSide" | "serverSide";
}

// --- The Main GridView Component ---

export function GridView(props: GridViewProps): ReactElement {
    const {
        rowData,
        columns,
        themeClassName,
        height,
        pagination,
        pageSize,
        rowHeightMode = "fixed",
        rowHeight = 40,
        rowHeightExpression,
        maxRowHeight = 0,
    rowClassMode = "none",
    rowClassAttribute,
    rowClassMapping = "",
    rowClassDefault = "",
    rowClassExpression = "",
        rowBuffer = 10,
        suppressRowVirtualisation = false,
        cacheBlockSize = 100,
        maxBlocksInCache = 0,
        maxConcurrentRequests = 2,
        onGridReady,
        onRowClicked,
        onRowDoubleClicked,
        onSortChanged,
        onFilterChanged,
        onColumnMoved,
        onColumnPinned,
        columnVisibility,
        columnOrder,
        customFormatterRegistry,
        enableContextMenu,
        enableSideBar,
        enableStatusBar,
        enableAggregationFooter,
        enableRowGrouping,
        groupDefaultExpanded,
        showGroupRowsOnSeparateLine,
        suppressAggregationOnGroupRows,
        enableColumnMenus,
        enableHeaderFilterButtons,
        enableFloatingFilters
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

    // --- Calculate aggregation footer row ---
    const pinnedBottomRowData = useMemo(() => {
        return calculatePinnedBottomRow({
            enableAggregationFooter,
            columns,
            rowData
        });
    }, [enableAggregationFooter, rowData, columns]);

    // --- Column definitions with visibility and ordering applied ---
    const columnDefs = useMemo(() => {
        return buildColumnDefs(
            columns,
            columnVisibility || {},
            columnOrder || [],
            customFormatterRegistry
        );
    }, [columns, columnVisibility, columnOrder, customFormatterRegistry]);

    // --- Row height configuration ---
    // Compile the custom expression once (if provided) for performance
    const compiledRowHeightFn = useMemo(() => {
        if (rowHeightMode !== "custom" || !rowHeightExpression || !rowHeightExpression.trim()) {
            return undefined;
        }
        try {
            // Compile the expression into a function: (data, rowIndex) => number
            // The expression should return a number (height in px)
            return new Function("data", "rowIndex", `return (${rowHeightExpression});`) as (
                data: any,
                rowIndex: number
            ) => number;
        } catch (e) {
            console.error("[AG Grid] Invalid row height expression:", rowHeightExpression, e);
            return undefined;
        }
    }, [rowHeightMode, rowHeightExpression]);

    // Build the getRowHeight callback for custom mode
    const getRowHeight = useCallback(
        (params: any): number | undefined => {
            if (rowHeightMode === "custom" && compiledRowHeightFn && params.data) {
                try {
                    let height = compiledRowHeightFn(params.data, params.rowIndex);
                    // Apply max row height cap if configured
                    if (maxRowHeight > 0 && height > maxRowHeight) {
                        height = maxRowHeight;
                    }
                    return height;
                } catch (e) {
                    console.error("[AG Grid] Error in getRowHeight:", e);
                    return rowHeight; // Fallback to default
                }
            }
            return undefined;
        },
        [rowHeightMode, compiledRowHeightFn, maxRowHeight, rowHeight]
    );

    // Warn if auto height is used with server-side row model
    if (rowHeightMode === "auto" && props.rowModelType === "serverSide") {
        console.warn(
            "[AG Grid] Auto row height is not supported with the Server-Side row model. " +
                "Falling back to fixed row height. Use Fixed or Custom mode instead."
        );
    }

    // Determine effective row height mode (fallback for server-side)
    const effectiveRowHeightMode =
        rowHeightMode === "auto" && props.rowModelType === "serverSide" ? "fixed" : rowHeightMode;

    // --- Row class configuration ---
    const attributeMap = useMemo(() => {
        const map = new Map<string, any>();
        columns.forEach((col) => {
            if (col.attribute?.id) {
                map.set(col.attribute.id, col.attribute);
            }
        });
        return map;
    }, [columns]);

    const getValueById = useCallback(
        (item: any, attributeId?: string) => {
            if (!item || !attributeId) return undefined;
            const attribute = attributeMap.get(attributeId);
            if (!attribute) return undefined;
            const value = attribute.get(item);
            if (value && value.status === ValueStatus.Available) {
                return value.value;
            }
            return undefined;
        },
        [attributeMap]
    );

    const parsedRowClassMapping = useMemo(() => {
        if (rowClassMode !== "mapping" || !rowClassMapping || !rowClassMapping.trim()) {
            return undefined;
        }
        try {
            const parsed = JSON.parse(rowClassMapping);
            if (parsed && typeof parsed === "object") {
                return parsed as Record<string, string>;
            }
            console.warn("[AG Grid] Row class mapping must be a JSON object.");
        } catch (e) {
            console.error("[AG Grid] Invalid row class mapping JSON:", rowClassMapping, e);
        }
        return undefined;
    }, [rowClassMode, rowClassMapping]);

    const compiledRowClassFn = useMemo(() => {
        if (rowClassMode !== "expression" || !rowClassExpression || !rowClassExpression.trim()) {
            return undefined;
        }
        try {
            return new Function(
                "data",
                "rowIndex",
                "getValue",
                "columnValue",
                `return (${rowClassExpression});`
            ) as (data: any, rowIndex: number, getValue: (id: string) => any, columnValue: any) => any;
        } catch (e) {
            console.error("[AG Grid] Invalid row class expression:", rowClassExpression, e);
            return undefined;
        }
    }, [rowClassMode, rowClassExpression]);

    const getRowClass = useCallback(
        (params: any) => {
            if (rowClassMode === "none" || !params?.data) {
                return undefined;
            }

            const columnValue = rowClassAttribute?.id
                ? getValueById(params.data, rowClassAttribute.id)
                : undefined;

            if (rowClassMode === "mapping") {
                const key = columnValue !== undefined && columnValue !== null ? String(columnValue) : "";
                const mapped = parsedRowClassMapping ? parsedRowClassMapping[key] : undefined;
                return mapped || rowClassDefault || undefined;
            }

            if (rowClassMode === "expression" && compiledRowClassFn) {
                try {
                    const result = compiledRowClassFn(
                        params.data,
                        params.rowIndex,
                        (id: string) => getValueById(params.data, id),
                        columnValue
                    );
                    if (result === null || result === undefined || result === false) {
                        return rowClassDefault || undefined;
                    }
                    if (Array.isArray(result) || typeof result === "string") {
                        return result;
                    }
                    return String(result);
                } catch (e) {
                    console.error("[AG Grid] Error in row class expression:", e);
                    return rowClassDefault || undefined;
                }
            }

            return rowClassDefault || undefined;
        },
        [
            rowClassMode,
            rowClassAttribute,
            parsedRowClassMapping,
            rowClassDefault,
            compiledRowClassFn,
            getValueById
        ]
    );

    // Build wrapper class name
    const wrapperClassName = [
        themeClassName,
        effectiveRowHeightMode === "auto" && maxRowHeight > 0 ? "aggrid-max-row-height" : ""
    ]
        .filter(Boolean)
        .join(" ");

    // Build wrapper style with optional CSS variable for max row height
    const wrapperStyle: React.CSSProperties = {
        height: `${height}px`,
        width: "100%",
        ...(effectiveRowHeightMode === "auto" && maxRowHeight > 0
            ? ({ "--ag-max-row-height": `${maxRowHeight}px` } as any)
            : {})
    };

    return (
        <div className={wrapperClassName} style={wrapperStyle} data-testid="ag-grid">
            <AgGridReact
                columnDefs={columnDefs}
                rowData={rowData}
                pinnedBottomRowData={pinnedBottomRowData}
                pagination={pagination}
                paginationPageSize={pageSize}
                // Virtual Scrolling Configuration
                rowBuffer={rowBuffer}
                suppressRowVirtualisation={suppressRowVirtualisation}
                // Server-Side Cache Configuration (only effective when rowModelType is serverSide)
                cacheBlockSize={props.rowModelType === "serverSide" ? cacheBlockSize : undefined}
                maxBlocksInCache={
                    props.rowModelType === "serverSide" && maxBlocksInCache > 0
                        ? maxBlocksInCache
                        : undefined
                }
                maxConcurrentDatasourceRequests={
                    props.rowModelType === "serverSide" ? maxConcurrentRequests : undefined
                }
                // Row Height Configuration
                rowHeight={effectiveRowHeightMode === "fixed" ? rowHeight : undefined}
                getRowHeight={effectiveRowHeightMode === "custom" ? getRowHeight : undefined}
                getRowClass={rowClassMode !== "none" ? getRowClass : undefined}
                onGridReady={onGridReady}
                onRowClicked={onRowClicked}
                onRowDoubleClicked={onRowDoubleClicked}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                onColumnPinned={onColumnPinned}
                rowModelType={props.rowModelType}
                // Row Grouping Configuration
                groupDisplayType={
                    enableRowGrouping && showGroupRowsOnSeparateLine ? "singleColumn" : "groupRows"
                }
                groupDefaultExpanded={enableRowGrouping ? groupDefaultExpanded : undefined}
                suppressAggFuncInHeader={suppressAggregationOnGroupRows}
                autoGroupColumnDef={
                    enableRowGrouping
                        ? {
                              headerName: "Group",
                              minWidth: 200,
                              cellRendererParams: {
                                  suppressCount: false
                              }
                          }
                        : undefined
                }
                animateRows={true}
                suppressCellFocus={false}
                enableCellTextSelection={true}
                ensureDomOrder={true}
                suppressContextMenu={!enableContextMenu}
                getMainMenuItems={(params) => {
                    const defaultItems = params.defaultItems || [];

                    // Add our custom entry for column visibility. It will open the drawer
                    const showHideColumnsItem = {
                        name: "Show/Hide Columns",
                        action: () => {
                            if (typeof props.onOpenHiddenDrawer === "function") {
                                props.onOpenHiddenDrawer();
                                return;
                            }

                            if (typeof props.onOpenColumnVisibility === "function") {
                                props.onOpenColumnVisibility();
                            }
                        }
                    } as any;

                    // Remove AG Grid's native 'columns' entry if present — we want to use our custom drawer
                    const filteredDefaults = (defaultItems || []).filter((it: any) => {
                        if (!it) return false;
                        // Strings may represent built-in entries; filter known column selectors
                        if (typeof it === "string") {
                            const s = it.toLowerCase();
                            return !(s === "columns" || s.includes("column"));
                        }
                        // Items can be objects; if they have a name that includes 'column', filter them
                        if (it.name && typeof it.name === "string") {
                            return !it.name.toLowerCase().includes("column");
                        }
                        return true;
                    });

                    // Prepend our item and preserve filtered default items
                    return [showHideColumnsItem, "separator", ...filteredDefaults];
                }}
                suppressMenuHide={false}
                sideBar={enableSideBar ? true : undefined}
                statusBar={statusBarConfig}
                defaultColDef={{
                    sortable: true,
                    filter: true, // Always enable filtering capability for programmatic use
                    resizable: true,
                    suppressHeaderMenuButton: !enableColumnMenus,
                    suppressHeaderFilterButton: !enableHeaderFilterButtons, // Control filter icon visibility
                    floatingFilter: enableFloatingFilters, // Global floating filter default
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
