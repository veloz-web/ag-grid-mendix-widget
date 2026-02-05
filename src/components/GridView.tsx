// GridView.tsx
import React, { ReactElement, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridReadyEvent, ColumnPinnedEvent } from "ag-grid-community";
import { ColumnsType } from "../../typings/AGGridProps";
import { CustomFormatterRegistry } from "../utils/customFormatters";
import { buildColumnDefs } from "../utils/column/mapping";
import { calculatePinnedBottomRow } from "../utils/aggregation/calculator";

interface GridViewProps {
    rowData: any[];
    columns: ColumnsType[];
    themeClassName: string; // <-- Changed: from theme: Theme
    height: number;
    pagination: boolean;
    pageSize: number;
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
        themeClassName, // <-- Changed
        height,
        pagination,
        pageSize,
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

    return (
        // --- THEME FIX: Apply theme class to the wrapper div ---
        <div
            className={themeClassName}
            style={{ height: `${height}px`, width: "100%" }}
            data-testid="ag-grid"
        >
            <AgGridReact
                // theme={theme} // <-- Removed: Theme is now on the wrapper
                columnDefs={columnDefs} // <-- Removed 'as any'
                rowData={rowData}
                pinnedBottomRowData={pinnedBottomRowData}
                pagination={pagination}
                paginationPageSize={pageSize}
                onGridReady={onGridReady} // <-- Removed 'as any'
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
