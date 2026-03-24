// GridView.tsx
import React, { ReactElement, useMemo, useCallback, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridReadyEvent, ColumnPinnedEvent, ColumnResizedEvent } from "ag-grid-community";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../columnTypes";
import { CustomFormatterRegistry } from "../utils/customFormatters";
import { buildColumnDefs } from "../utils/column/mapping";
import { calculatePinnedBottomRow } from "../utils/aggregation/calculator";
import type { GridDeleteConfig } from "../types/gridConfig";

interface GridViewProps {
    rowData: any[];
    columns: ColumnsType[];
    themeClassName: string;
    height: number;
    pagination: boolean;
    pageSize: number;
    /** Where to render pagination: bottom (default) or top */
    paginationPosition?: "bottom" | "top";
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
    /** JSON rules mapping class name -> expression */
    rowClassRules?: string;
    /** Default row class when mapping/expression returns nothing */
    rowClassDefault?: string;
    /** JavaScript expression for row class */
    rowClassExpression?: string;
    /** Edit mode: cell or row */
    editMode?: "cell" | "row";
    /** Stop editing when focus leaves the cell */
    stopEditingWhenCellsLoseFocus?: boolean;
    /** Enable undo/redo for cell edits */
    undoRedoCellEditing?: boolean;
    /** Extra rows rendered above/below viewport (default: 10) */
    rowBuffer?: number;
    /** Disable row virtualisation — render ALL rows in DOM (default: false) */
    suppressRowVirtualisation?: boolean;
    /** DOM Layout mode: normal, autoHeight, or print */
    domLayout?: "normal" | "autoHeight" | "print";
    /** Auto-size strategy for initial column sizing */
    autoSizeStrategy?: "none" | "fitGridWidth" | "fitCellContents";
    /** Skip header text width when auto-sizing to fit cell contents */
    skipHeaderOnAutoSize?: boolean;
    /** Whether to persist user-resized column widths to localStorage */
    persistColumnWidths?: boolean;
    /** Rows per server-side fetch block (default: 100) */
    cacheBlockSize?: number;
    /** Max server-side blocks in memory (0 = unlimited) */
    maxBlocksInCache?: number;
    /** Max concurrent server-side requests (default: 2) */
    maxConcurrentRequests?: number;
    onGridReady: (params: GridReadyEvent) => void;
    onRowClicked: (event: any) => void;
    onRowDoubleClicked?: (event: any) => void;
    onCellEditCommit?: any;
    onDataRefresh?: () => void;
    onSortChanged?: (event: any) => void;
    onFilterChanged?: (event: any) => void;
    onColumnMoved?: (event: any) => void;
    onColumnPinned?: (event: ColumnPinnedEvent) => void;
    /** Called when column is resized by user */
    onColumnResized?: (event: ColumnResizedEvent) => void;
    /** Called when the 'Show/Hide Columns' header menu item is selected */
    onOpenColumnVisibility?: () => void;
    onOpenHiddenDrawer?: () => void;
    onSelectionChanged?: (event: any) => void;
    onDeleteRows?: (rows: any[], source?: "toolbar" | "context") => void;
    columnVisibility?: Record<string, boolean>;
    columnOrder?: string[];
    customFormatterRegistry?: CustomFormatterRegistry;
    enableContextMenu: boolean;
    enableSideBar: boolean;
    enableStatusBar: boolean;
    enableAggregationFooter: boolean;
    deleteConfig?: GridDeleteConfig;
    rowSelectionMode?: "none" | "single" | "multiple";
    showSelectionCheckboxes?: boolean;
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
        paginationPosition = "bottom",
        rowHeightMode = "fixed",
        rowHeight,
        rowHeightExpression,
        maxRowHeight = 0,
        rowClassMode = "none",
        rowClassAttribute,
        rowClassMapping = "",
        rowClassRules = "",
        rowClassDefault = "",
        rowClassExpression = "",
        editMode = "cell",
        stopEditingWhenCellsLoseFocus = true,
        undoRedoCellEditing = false,
        rowBuffer = 10,
        suppressRowVirtualisation = false,
        domLayout = "normal",
        autoSizeStrategy = "none",
        skipHeaderOnAutoSize = false,
        persistColumnWidths = true,
        cacheBlockSize = 100,
        maxBlocksInCache = 0,
        maxConcurrentRequests = 2,
        onGridReady,
        onRowClicked,
        onRowDoubleClicked,
        onCellEditCommit,
        onDataRefresh,
        onSortChanged,
        onFilterChanged,
        onColumnMoved,
        onColumnPinned,
        onColumnResized,
        onSelectionChanged,
        onDeleteRows,
        columnVisibility,
        columnOrder,
        customFormatterRegistry,
        enableContextMenu,
        enableSideBar,
        enableStatusBar,
        enableAggregationFooter,
        deleteConfig,
        rowSelectionMode: selectionModeProp = "none",
        showSelectionCheckboxes = true,
        enableRowGrouping,
        groupDefaultExpanded,
        showGroupRowsOnSeparateLine,
        suppressAggregationOnGroupRows,
        enableColumnMenus,
        enableHeaderFilterButtons,
        enableFloatingFilters
    } = props;

    // Row selection is now driven by the dedicated rowSelectionMode prop (decoupled from delete)
    const rowSelectionConfig =
        selectionModeProp === "multiple"
            ? {
                  mode: "multiRow" as const,
                  checkboxes: showSelectionCheckboxes,
                  headerCheckbox: showSelectionCheckboxes,
                  enableClickSelection: true
              }
            : selectionModeProp === "single"
            ? { mode: "singleRow" as const, checkboxes: false, enableClickSelection: true }
            : undefined;

    // --- DOM-based pagination position ---
    // We use a ref to the wrapper div so we can move the built-in .ag-paging-panel
    const wrapperRef = useRef<HTMLDivElement>(null);

    // After grid mounts, move the built-in .ag-paging-panel to top if needed
    useEffect(() => {
        if (!pagination || paginationPosition !== "top" || !wrapperRef.current) {
            return;
        }

        // AG Grid renders the paging panel asynchronously; poll briefly until it appears
        let attempts = 0;
        const maxAttempts = 20;
        const intervalId = setInterval(() => {
            attempts++;
            const wrapper = wrapperRef.current;
            if (!wrapper) {
                clearInterval(intervalId);
                return;
            }

            const pagingPanel = wrapper.querySelector<HTMLElement>(".ag-paging-panel");
            if (!pagingPanel) {
                if (attempts >= maxAttempts) {
                    clearInterval(intervalId);
                }
                return;
            }

            // Found the panel — stop polling
            clearInterval(intervalId);

            const agRootWrapper = wrapper.querySelector<HTMLElement>(".ag-root-wrapper");
            if (!agRootWrapper) {
                return;
            }

            // Move the native panel above the grid
            agRootWrapper.parentElement?.insertBefore(pagingPanel, agRootWrapper);
        }, 50);

        // Cleanup
        return () => {
            clearInterval(intervalId);
        };
    }, [pagination, paginationPosition]);

    const getContextMenuItems = useCallback(
        (params: any) => {
            const defaultItems = params.defaultItems || [];
            if (!deleteConfig?.enableRowDelete || !deleteConfig.deleteButton.showInContextMenu) {
                return defaultItems;
            }

            const rowData = params.node?.data;
            const deleteLabel = deleteConfig.deleteButton.label || "Delete";
            const deleteItem = {
                name: deleteLabel,
                action: () => {
                    if (!onDeleteRows) {
                        return;
                    }
                    onDeleteRows(rowData ? [rowData] : [], "context");
                },
                disabled: !rowData
            } as any;

            return [...defaultItems, "separator", deleteItem];
        },
        [deleteConfig, onDeleteRows]
    );

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

    const resolvedRowHeight = rowHeight ?? 40;

    // --- Row height configuration ---
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

    console.log("[AGGrid] Row height configuration:", {
        rowHeightMode,
        effectiveRowHeightMode,
        rowModelType: props.rowModelType,
        rowHeight: resolvedRowHeight
    });

    // Wrap onGridReady to handle auto-height recalculation
    const handleGridReady = useCallback(
        (params: GridReadyEvent) => {
            onGridReady(params);

            // For auto row height mode, force AG Grid to recalculate row heights
            // after initial render to ensure wrapText/autoHeight take effect
            if (effectiveRowHeightMode === "auto") {
                console.log("[AGGrid] Auto-height mode detected - scheduling resetRowHeights()");
                // Use setTimeout to let AG Grid finish initial render
                setTimeout(() => {
                    console.log("[AGGrid] Calling resetRowHeights() on grid ready");
                    params.api?.resetRowHeights();
                }, 200); // Increased delay to ensure content is fully rendered
            }
        },
        [onGridReady, effectiveRowHeightMode]
    );

    // Also reset row heights when data is first rendered (for auto mode)
    const handleFirstDataRendered = useCallback(
        (params: any) => {
            if (effectiveRowHeightMode === "auto") {
                console.log("[AGGrid] Data rendered - scheduling resetRowHeights()");
                setTimeout(() => {
                    console.log("[AGGrid] Calling resetRowHeights() after data render");
                    params.api?.resetRowHeights();
                }, 100);
            }
        },
        [effectiveRowHeightMode]
    );

    // --- Column definitions with visibility and ordering applied ---
    const columnDefs = useMemo(() => {
        return buildColumnDefs(
            columns,
            columnVisibility || {},
            columnOrder || [],
            customFormatterRegistry,
            effectiveRowHeightMode // Pass row height mode for auto-height
        );
    }, [columns, columnVisibility, columnOrder, customFormatterRegistry, effectiveRowHeightMode]);

    // Compile the custom expression once (if provided) for performance
    const compiledRowHeightFn = useMemo(() => {
        if (rowHeightMode !== "custom" || !rowHeightExpression || !rowHeightExpression.trim()) {
            return undefined;
        }
        try {
            // Compile the expression into a function: (data, rowIndex) => number
            // The expression should return a number (height in px)
            // eslint-disable-next-line no-new-func
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
                    return resolvedRowHeight; // Fallback to default
                }
            }
            return undefined;
        },
        [rowHeightMode, compiledRowHeightFn, maxRowHeight, resolvedRowHeight]
    );

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

    type RowClassRule = { className: string; expression: string };

    const parsedRowClassRules = useMemo(() => {
        if (!rowClassRules || !rowClassRules.trim()) {
            return undefined;
        }
        try {
            const parsed = JSON.parse(rowClassRules);
            if (Array.isArray(parsed)) {
                return parsed
                    .filter((rule) => rule && rule.className && rule.expression)
                    .map((rule) => ({
                        className: String(rule.className),
                        expression: String(rule.expression)
                    })) as RowClassRule[];
            }
            if (parsed && typeof parsed === "object") {
                return Object.entries(parsed).map(([className, expression]) => ({
                    className: String(className),
                    expression: String(expression)
                })) as RowClassRule[];
            }
            console.warn("[AG Grid] Row class rules must be a JSON object or array.");
        } catch (e) {
            console.error("[AG Grid] Invalid row class rules JSON:", rowClassRules, e);
        }
        return undefined;
    }, [rowClassRules]);

    const compiledRowClassRules = useMemo(() => {
        if (!parsedRowClassRules || parsedRowClassRules.length === 0) {
            return undefined;
        }
        return parsedRowClassRules
            .map((rule) => {
                try {
                    // eslint-disable-next-line no-new-func
                    const fn = new Function(
                        "data",
                        "rowIndex",
                        "getValue",
                        "columnValue",
                        `return (${rule.expression});`
                    ) as (
                        data: any,
                        rowIndex: number,
                        getValue: (id: string) => any,
                        columnValue: any
                    ) => any;
                    return { className: rule.className, fn };
                } catch (e) {
                    console.error(
                        "[AG Grid] Invalid row class rule expression:",
                        rule.className,
                        rule.expression,
                        e
                    );
                    return undefined;
                }
            })
            .filter(Boolean) as Array<{
            className: string;
            fn: (
                data: any,
                rowIndex: number,
                getValue: (id: string) => any,
                columnValue: any
            ) => any;
        }>;
    }, [parsedRowClassRules]);

    const compiledRowClassFn = useMemo(() => {
        if (rowClassMode !== "expression" || !rowClassExpression || !rowClassExpression.trim()) {
            return undefined;
        }
        try {
            // eslint-disable-next-line no-new-func
            return new Function(
                "data",
                "rowIndex",
                "getValue",
                "columnValue",
                `return (${rowClassExpression});`
            ) as (
                data: any,
                rowIndex: number,
                getValue: (id: string) => any,
                columnValue: any
            ) => any;
        } catch (e) {
            console.error("[AG Grid] Invalid row class expression:", rowClassExpression, e);
            return undefined;
        }
    }, [rowClassMode, rowClassExpression]);

    const getRowClass = useCallback(
        (params: any) => {
            if (!params?.data) {
                return undefined;
            }

            const classes = new Set<string>();
            const columnValue = rowClassAttribute?.id
                ? getValueById(params.data, rowClassAttribute.id)
                : undefined;

            if (compiledRowClassRules && compiledRowClassRules.length > 0) {
                compiledRowClassRules.forEach((rule) => {
                    try {
                        const result = rule.fn(
                            params.data,
                            params.rowIndex,
                            (id: string) => getValueById(params.data, id),
                            columnValue
                        );
                        if (result) {
                            classes.add(rule.className);
                        }
                    } catch (e) {
                        console.error("[AG Grid] Error in row class rule:", rule.className, e);
                    }
                });
            }

            let baseResult: any;
            if (rowClassMode === "mapping") {
                const key =
                    columnValue !== undefined && columnValue !== null ? String(columnValue) : "";
                baseResult = parsedRowClassMapping ? parsedRowClassMapping[key] : undefined;
            } else if (rowClassMode === "expression" && compiledRowClassFn) {
                try {
                    baseResult = compiledRowClassFn(
                        params.data,
                        params.rowIndex,
                        (id: string) => getValueById(params.data, id),
                        columnValue
                    );
                } catch (e) {
                    console.error("[AG Grid] Error in row class expression:", e);
                }
            }

            if (baseResult !== null && baseResult !== undefined && baseResult !== false) {
                if (Array.isArray(baseResult)) {
                    baseResult.forEach((cls) => cls && classes.add(String(cls)));
                } else if (typeof baseResult === "string") {
                    if (baseResult.trim()) {
                        classes.add(baseResult);
                    }
                } else {
                    classes.add(String(baseResult));
                }
            }

            if (classes.size === 0 && rowClassDefault) {
                classes.add(rowClassDefault);
            }

            return classes.size > 0 ? Array.from(classes) : undefined;
        },
        [
            rowClassMode,
            rowClassAttribute,
            rowClassDefault,
            compiledRowClassFn,
            compiledRowClassRules,
            parsedRowClassMapping,
            getValueById
        ]
    );

    const handleCellValueChanged = useCallback(
        async (event: any) => {
            const { data, colDef, oldValue, newValue, node, api } = event || {};
            if (!data || oldValue === newValue) return;

            const field = colDef?.field;
            const hasSetMethod = typeof data.set === "function";

            // If the data object has a .set() method (Mendix entity), update it in memory
            // Otherwise, the microflow will need to handle the update based on the passed values
            if (field && hasSetMethod) {
                data.set(field, newValue);
            } else if (!hasSetMethod) {
                // For non-entity objects, store the new value in a custom property
                // so the microflow can access it
                if (!data._editedValues) {
                    data._editedValues = {};
                }
                data._editedValues[field] = { oldValue, newValue };
            }

            const action = onCellEditCommit?.get?.(data);
            if (action && action.canExecute) {
                try {
                    await action.execute();

                    // Clean up temporary edit tracking if it exists
                    if (data._editedValues && field) {
                        delete data._editedValues[field];
                        if (Object.keys(data._editedValues).length === 0) {
                            delete data._editedValues;
                        }
                    }
                } catch (error) {
                    console.error("[AG Grid] Cell edit commit failed:", error);

                    // Revert the change
                    if (field && hasSetMethod) {
                        data.set(field, oldValue);
                    } else if (data._editedValues && field) {
                        // Remove failed edit from tracking
                        delete data._editedValues[field];
                    }

                    api?.refreshCells({
                        rowNodes: node ? [node] : undefined,
                        columns: field ? [field] : undefined,
                        force: true
                    });
                }
            } else if (!hasSetMethod) {
                // If no action configured for non-entity data, warn the user
                console.warn(
                    "[AG Grid] Cell edited on non-entity object but no 'On Cell Edit Commit' action is configured. " +
                        "The edit cannot be persisted. Configure an action to handle the update."
                );

                // Refresh cell to show original value
                api?.refreshCells({
                    rowNodes: node ? [node] : undefined,
                    columns: field ? [field] : undefined,
                    force: true
                });
            }

            if (props.rowModelType === "serverSide" && typeof onDataRefresh === "function") {
                onDataRefresh();
            }
        },
        [onCellEditCommit, onDataRefresh, props.rowModelType]
    );

    // Build wrapper class name
    const wrapperClassName = [
        themeClassName,
        effectiveRowHeightMode === "auto" && maxRowHeight > 0 ? "aggrid-max-row-height" : ""
    ]
        .filter(Boolean)
        .join(" ");

    // Build auto-size strategy for AG Grid native column sizing
    const autoSizeStrategyConfig = useMemo(() => {
        if (autoSizeStrategy === "fitGridWidth") {
            return { type: "fitGridWidth" as const };
        }
        if (autoSizeStrategy === "fitCellContents") {
            return {
                type: "fitCellContents" as const,
                skipHeader: skipHeaderOnAutoSize
            };
        }
        return undefined;
    }, [autoSizeStrategy, skipHeaderOnAutoSize]);

    // Build wrapper style with optional CSS variable for max row height
    const wrapperStyle: React.CSSProperties = {
        height: `${height}px`,
        width: "100%",
        ...(effectiveRowHeightMode === "auto" && maxRowHeight > 0
            ? ({ "--ag-max-row-height": `${maxRowHeight}px` } as any)
            : {})
    };

    return (
        <div
            ref={wrapperRef}
            className={wrapperClassName}
            style={wrapperStyle}
            data-testid="ag-grid"
        >
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
                rowHeight={effectiveRowHeightMode === "fixed" ? resolvedRowHeight : undefined}
                getRowHeight={effectiveRowHeightMode === "custom" ? getRowHeight : undefined}
                getRowClass={rowClassMode !== "none" ? getRowClass : undefined}
                // DOM Layout
                domLayout={domLayout}
                // Column Auto-Size Strategy (AG Grid native)
                autoSizeStrategy={autoSizeStrategyConfig}
                editType={editMode === "row" ? "fullRow" : undefined}
                stopEditingWhenCellsLoseFocus={stopEditingWhenCellsLoseFocus}
                undoRedoCellEditing={undoRedoCellEditing}
                onCellValueChanged={handleCellValueChanged}
                onGridReady={handleGridReady}
                onFirstDataRendered={handleFirstDataRendered}
                onRowClicked={onRowClicked}
                onRowDoubleClicked={onRowDoubleClicked}
                onSelectionChanged={onSelectionChanged}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                onColumnPinned={onColumnPinned}
                onColumnResized={persistColumnWidths ? onColumnResized : undefined}
                getContextMenuItems={getContextMenuItems}
                rowModelType={props.rowModelType}
                rowSelection={rowSelectionConfig}
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
