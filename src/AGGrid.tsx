// src/AGGrid.tsx - Functional Component
import {
    ChangeEvent,
    ReactElement,
    useRef,
    useMemo,
    useCallback,
    useState,
    useEffect
} from "react";

// Import module registration (runs the code)
import "./agGridModules";

// Import AG Grid specifics
import { LicenseManager } from "ag-grid-enterprise";

// Import Mendix types
import { ValueStatus } from "mendix";

// Import types
import { AGGridContainerProps } from "./types";

// Import UI Components
import { Toolbar } from "./components/Toolbar";
import { FilterDrawer } from "./components/FilterDrawer";
import { ViewRenderer } from "./components/viewRenderer";
// ColumnVisibilityPopover replaced by HiddenDrawer
import { HiddenDrawer } from "./components/HiddenDrawer";
import { ToastContainer } from "./components/ToastContainer";

// Import Utils
import {
    getRowData,
    getFilterableColumns,
    getFilteredData,
    getRowSignature,
    getDistinctValuesForColumn,
    buildToolbarFilters,
    applyDefaultSortToData,
    validateSortConfiguration
} from "./utils/data";
import { getThemeClassName } from "./utils/theme";
import { CustomFormatterRegistry } from "./utils/customFormatters";

// Import Custom Hooks
import { useToast } from "./hooks/useToast";
import { useResponsive } from "./hooks/useResponsive";
import { usePersistence } from "./hooks/usePersistence";
import { useGridApi } from "./hooks/useGridApi";
import { useDataPolling } from "./hooks/useDataPolling";
import { useGridState } from "./hooks/useGridState";
import { useColumnManagement } from "./hooks/useColumnManagement";
import { useFilterManagement } from "./hooks/useFilterManagement";

// Import base styles
import "./ui/AGGrid.css";

// Set license key once (outside component)
let licenseSet = false;

export function AGGrid(props: AGGridContainerProps): ReactElement {
    // --- 1. Initialize License (once) ---
    if (!licenseSet && props.licenseKey) {
        LicenseManager.setLicenseKey(props.licenseKey);
        licenseSet = true;
    }

    // --- 2. Refs ---
    const filterButtonRef = useRef<HTMLButtonElement>(null);
    const rowDataCacheRef = useRef<{ signature: string; data: any[] }>({
        signature: "",
        data: []
    });

    // --- 3. Custom Hooks ---

    // Toast notifications
    const { toastNotifications, showToast, dismissToast } = useToast(props.autoHideDuration);

    // Responsive behavior
    const { prefersDarkScheme } = useResponsive();

    // Persistence (localStorage)
    const { savePersistedState, resetSettings } = usePersistence(
        props,
        undefined, // Will be updated to use gridState
        undefined,
        undefined
    );

    // Grid state management
    const gridState = useGridState(props, savePersistedState);
    const {
        state,
        currentView,
        setCurrentView,
        isFilterDrawerOpen,
        openFilterDrawer: _openFilterDrawerBase,
        closeFilterDrawer,
        toggleFilterDrawer,
        activeFilters,
        globalSearch,
        sortModel,
        columnVisibility,
        columnOrder,
        isHiddenDrawerOpen,
        updateState
    } = gridState;

    const [selectedRowCount, setSelectedRowCount] = useState(0);

    // Wrapper for setState compatibility with useGridApi
    const setStateCompat = useCallback(
        (action: React.SetStateAction<typeof state>) => {
            if (typeof action === "function") {
                updateState(action(state));
            } else {
                updateState(action);
            }
        },
        [state, updateState]
    );

    // Grid API and events
    const {
        gridApiRef,
        onGridReady,
        onSortChanged,
        onFilterChanged,
        onColumnMoved,
        onColumnPinned,
        applyGridSortModel,
        applyFiltersToGrid,
        applyGlobalSearch,
        handleExportRequest
    } = useGridApi(state, setStateCompat, savePersistedState, props);

    // Column management
    const columnManagement = useColumnManagement({
        columns: props.columns || [],
        columnVisibility,
        columnOrder,
        isHiddenDrawerOpen,
        onUpdateState: updateState
    });

    // Filter management
    const filterManagement = useFilterManagement({
        activeFilters,
        globalSearch,
        sortModel,
        rowData: rowDataCacheRef.current.data,
        columns: props.columns || [],
        onUpdateState: updateState,
        applyGridSortModel,
        applyFiltersToGrid,
        applyGlobalSearch
    });

    // Data polling
    useDataPolling(props, showToast, gridApiRef);

    // --- 4. Computed Values ---
    const themeClassName = useMemo(
        () => getThemeClassName(props.theme, props.themeVariant, prefersDarkScheme),
        [props.theme, props.themeVariant, prefersDarkScheme]
    );

    const customFormatterRegistry = useMemo(() => {
        const registry = new CustomFormatterRegistry();
        if (props.customFormatters && Array.isArray(props.customFormatters)) {
            registry.registerFormatters(props.customFormatters);
        }
        return registry;
    }, [props.customFormatters]);

    // --- 5. Event Handlers (using hooks) ---

    // Enhanced filter drawer opener that syncs sort model from grid
    const _openFilterDrawer = useCallback(() => {
        // Safely get current sort model from grid if available
        let currentSortModel = sortModel;
        if (gridApiRef.current && typeof gridApiRef.current.getSortModel === "function") {
            try {
                currentSortModel = gridApiRef.current.getSortModel() || sortModel;
            } catch (error) {
                console.warn("[AGGrid] Could not get sort model from grid API:", error);
            }
        }
        updateState({ isFilterDrawerOpen: true, sortModel: currentSortModel });
    }, [gridApiRef, sortModel, updateState]);

    // Close drawer with focus management
    const closeFilterDrawerWithFocus = useCallback(
        (returnFocus = false) => {
            closeFilterDrawer(returnFocus);
            if (returnFocus && filterButtonRef.current) {
                filterButtonRef.current.focus();
            }
        },
        [closeFilterDrawer]
    );

    const closeFilterDrawerAndFocus = useCallback(() => {
        closeFilterDrawerWithFocus(true);
    }, [closeFilterDrawerWithFocus]);

    // Toolbar handlers (delegating to filter management hook)
    const handleToolbarSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            filterManagement.handleSearchChange(event);
        },
        [filterManagement]
    );

    const clearToolbarSearch = useCallback(() => {
        filterManagement.clearSearch();
    }, [filterManagement]);

    const handleToolbarFilterChange = useCallback(
        (columnId: string, values: string[]) => {
            filterManagement.setFilter(columnId, values);
        },
        [filterManagement]
    );

    const handleToolbarSortChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            const columnId = event.target.value;
            if (!columnId) {
                filterManagement.setSort([]);
            } else {
                filterManagement.setSortColumn(columnId);
            }
        },
        [filterManagement]
    );

    const handleToolbarSortDirectionChange = useCallback(
        (direction: "asc" | "desc") => {
            filterManagement.setSortDirection(direction);
        },
        [filterManagement]
    );

    const handleToolbarResetFilters = useCallback(() => {
        filterManagement.clearFilters();
    }, [filterManagement]);

    // Row click handler
    const { onRowClick, onRowDoubleClick } = props;

    const onRowClickHandler = useCallback(
        (event: any) => {
            if (!onRowClick || !event.data) {
                return;
            }
            const action = onRowClick.get(event.data);
            if (action && action.canExecute) {
                setTimeout(() => {
                    action.execute();
                }, 0);
            }
        },
        [onRowClick]
    );

    const onRowDoubleClickHandler = useCallback(
        (event: any) => {
            if (!onRowDoubleClick || !event.data) {
                return;
            }
            const action = onRowDoubleClick.get(event.data);
            if (action && action.canExecute) {
                setTimeout(() => {
                    action.execute();
                }, 0);
            }
        },
        [onRowDoubleClick]
    );

    // --- 6. Render Logic ---
    const { dataSource, height, pagination, pageSize } = props;

    // Validate sort configuration
    const sortValidation = useMemo(
        () => validateSortConfiguration(props.columns || []),
        [props.columns]
    );

    // Get row data (only update reference when data actually changes)
    const latestRowData = getRowData(dataSource);
    const latestRowSignature = useMemo(() => getRowSignature(latestRowData), [latestRowData]);
    const allRowData = useMemo(() => {
        if (rowDataCacheRef.current.signature !== latestRowSignature) {
            // Apply default sort to the raw data based on column sortIndex and defaultSort
            const sortedData = applyDefaultSortToData(
                latestRowData,
                props.columns || [],
                sortModel
            );
            rowDataCacheRef.current = {
                signature: latestRowSignature,
                data: sortedData
            };
        }

        return rowDataCacheRef.current.data;
    }, [latestRowData, latestRowSignature, props.columns, sortModel]);

    const deleteConfig = useMemo(
        () => ({
            enableRowDelete: Boolean(props.enableRowDelete),
            bulkDeleteEnabled: Boolean(props.bulkDeleteEnabled),
            deleteConfirmation: {
                enabled: props.deleteConfirmationEnabled ?? true,
                title: props.deleteConfirmationTitle || "Confirm Delete",
                message:
                    props.deleteConfirmationMessage || "Are you sure you want to delete this row?"
            },
            deleteButton: {
                showInToolbar: props.deleteShowInToolbar ?? true,
                showInContextMenu: props.deleteShowInContextMenu ?? true,
                label: props.deleteButtonLabel || "Delete",
                requireSelection: props.deleteRequireSelection ?? true
            }
        }),
        [
            props.enableRowDelete,
            props.bulkDeleteEnabled,
            props.deleteConfirmationEnabled,
            props.deleteConfirmationTitle,
            props.deleteConfirmationMessage,
            props.deleteShowInToolbar,
            props.deleteShowInContextMenu,
            props.deleteButtonLabel,
            props.deleteRequireSelection
        ]
    );

    const addConfig = useMemo(
        () => ({
            enableRowAdd: Boolean(props.enableRowAdd),
            addButton: {
                showInToolbar: props.addShowInToolbar ?? true,
                label: props.addButtonLabel || "Add"
            }
        }),
        [props.enableRowAdd, props.addShowInToolbar, props.addButtonLabel]
    );

    // --- CRUD Configuration Validation (runtime) ---
    useEffect(() => {
        const selMode = props.rowSelectionMode || "none";

        if (deleteConfig.enableRowDelete) {
            if (!props.onDeleteRow) {
                console.error(
                    "[AG Grid] Row delete is enabled but no 'On Delete Row' action is configured. " +
                        "The delete button will not work. Configure an action in the Events tab."
                );
            }
            if (
                !deleteConfig.deleteButton.showInToolbar &&
                !deleteConfig.deleteButton.showInContextMenu
            ) {
                console.warn(
                    "[AG Grid] Row delete is enabled but the delete button is hidden from both the toolbar and the context menu. " +
                        "Users will have no way to trigger a delete."
                );
            }
            if (deleteConfig.deleteButton.requireSelection && selMode === "none") {
                console.error(
                    "[AG Grid] Row delete requires row selection but Row Selection Mode is 'None'. " +
                        "Set Row Selection Mode to 'Single' or 'Multiple' so users can select rows to delete."
                );
            }
            if (deleteConfig.bulkDeleteEnabled && selMode !== "multiple") {
                console.warn(
                    "[AG Grid] Bulk delete is enabled but Row Selection Mode is not 'Multiple'. " +
                        "Set Row Selection Mode to 'Multiple' to allow selecting multiple rows for deletion."
                );
            }
        }
        if (addConfig.enableRowAdd && !props.onAddRow) {
            console.error(
                "[AG Grid] Row add is enabled but no 'On Add Row' action is configured. " +
                    "The add button will not work. Configure an action in the Events tab."
            );
        }
        const editableColumns = (props.columns || []).filter((c: any) => c.editable);
        if (editableColumns.length > 0 && !props.onCellEditCommit) {
            console.warn(
                "[AG Grid] Editable columns are configured but no 'On Cell Edit Commit' action is set. " +
                    "Cell edits will not be persisted."
            );
        }
    }, [
        deleteConfig,
        addConfig,
        props.onDeleteRow,
        props.onAddRow,
        props.onCellEditCommit,
        props.columns,
        props.rowSelectionMode
    ]);

    const handleSelectionChanged = useCallback((event: any) => {
        const api = event?.api;
        const selectedRows = api?.getSelectedRows?.() ?? [];
        setSelectedRowCount(selectedRows.length);
    }, []);

    const handleDeleteRows = useCallback(
        async (rows: any[], _source?: "toolbar" | "context") => {
            if (!deleteConfig.enableRowDelete) {
                return;
            }

            if (deleteConfig.deleteButton.requireSelection && (!rows || rows.length === 0)) {
                showToast("Select rows to delete.", "warning", "delete-selection");
                return;
            }

            if (!props.onDeleteRow) {
                showToast("Delete action is not configured.", "error", "delete-missing");
                return;
            }

            let rowsToDelete = rows || [];
            if (!deleteConfig.bulkDeleteEnabled && rowsToDelete.length > 1) {
                rowsToDelete = [rowsToDelete[0]];
                showToast(
                    "Multiple row delete is disabled. Deleting the first row only.",
                    "info",
                    "delete-bulk-disabled"
                );
            }

            if (deleteConfig.deleteConfirmation.enabled) {
                const title = deleteConfig.deleteConfirmation.title?.trim();
                const message = deleteConfig.deleteConfirmation.message?.trim();
                const confirmMessage = title ? `${title}\n\n${message}` : message;
                const confirmed = window.confirm(confirmMessage || "Confirm delete?");
                if (!confirmed) {
                    return;
                }
            }

            const results = await Promise.all(
                rowsToDelete.map(async (row) => {
                    try {
                        const action = props.onDeleteRow?.get?.(row);
                        if (!action || !action.canExecute) {
                            return { row, success: false };
                        }
                        await Promise.resolve(action.execute());
                        return { row, success: true };
                    } catch (error) {
                        console.error("[AG Grid] Delete failed:", error);
                        return { row, success: false };
                    }
                })
            );

            const successful = results
                .filter((result) => result.success)
                .map((result) => result.row);
            const failedCount = results.length - successful.length;

            if (successful.length > 0) {
                if (props.rowModelType === "serverSide") {
                    props.dataSource?.reload?.();
                } else if (gridApiRef.current?.applyTransaction) {
                    gridApiRef.current.applyTransaction({ remove: successful });
                }

                showToast(
                    `${successful.length} row${successful.length === 1 ? "" : "s"} deleted.`,
                    "success",
                    "delete-success"
                );
            }

            if (failedCount > 0) {
                showToast(
                    `Failed to delete ${failedCount} row${failedCount === 1 ? "" : "s"}.`,
                    "error",
                    "delete-failure"
                );
            }

            if (gridApiRef.current?.deselectAll) {
                gridApiRef.current.deselectAll();
            }
            setSelectedRowCount(0);
        },
        [
            deleteConfig,
            gridApiRef,
            props.dataSource,
            props.onDeleteRow,
            props.rowModelType,
            showToast
        ]
    );

    const handleToolbarDelete = useCallback(() => {
        const selectedRows = gridApiRef.current?.getSelectedRows?.() ?? [];
        handleDeleteRows(selectedRows, "toolbar");
    }, [gridApiRef, handleDeleteRows]);

    const handleAddRow = useCallback(() => {
        if (!addConfig.enableRowAdd) {
            return;
        }
        if (!props.onAddRow) {
            showToast("Add action is not configured.", "error", "add-missing");
            return;
        }
        if (props.onAddRow.canExecute) {
            props.onAddRow.execute();
        }
    }, [addConfig.enableRowAdd, props.onAddRow, showToast]);

    // Loading states
    if (!dataSource || dataSource.status === ValueStatus.Loading) {
        return <div className="aggrid-loading">Loading...</div>;
    }
    if (dataSource.status === ValueStatus.Unavailable) {
        return <div className="aggrid-loading">No data source available</div>;
    }

    // Validation error for sort configuration
    if (!sortValidation.valid) {
        return (
            <div
                className="aggrid-error"
                style={{
                    padding: "20px",
                    color: "#d32f2f",
                    border: "2px solid #d32f2f",
                    borderRadius: "4px",
                    margin: "10px"
                }}
            >
                <strong>Configuration Error:</strong>
                <p>{sortValidation.error}</p>
            </div>
        );
    }

    const filteredData =
        currentView === "grid"
            ? allRowData // Grid handles its own filtering
            : getFilteredData(allRowData, props.columns || [], state);

    const filterableColumns = getFilterableColumns(props.columns || [], activeFilters);
    const activeFilterCount = Object.keys(activeFilters).length + (globalSearch ? 1 : 0);

    // Toolbar filters - map to correct type with options and selectedValues
    const toolbarFilters = buildToolbarFilters(props.columns || [], allRowData, activeFilters);

    // Sortable columns
    const sortableColumns = (props.columns || []).filter((c: any) => c.includeInSortOptions);

    // Check enabled views
    const hasCardTemplate = !!(props.customCardTemplate && props.customCardTemplate.trim());
    const hasListTemplate = !!(props.customListTemplate && props.customListTemplate.trim());

    // Calculate additional toolbar props
    const hasSortApplied = Boolean(sortModel && sortModel.length > 0 && sortModel[0]?.colId);
    const currentSortColumnId = hasSortApplied ? sortModel[0].colId : "";
    const currentSortDirection = sortModel[0]?.sort ?? "asc";
    const showSortControls = currentView !== "grid" && sortableColumns.length > 0;
    const showToolbarSearch = props.showToolbarSearch !== false;
    const enableFilterDrawer = props.enableFilterDrawer !== false;
    const showViewSelector = hasCardTemplate || hasListTemplate;
    const storageKey = `aggrid:${props.name || "default"}`;

    return (
        <div className="aggrid-container">
            <ToastContainer
                notifications={toastNotifications}
                onDismiss={dismissToast}
                position={props.toastPosition || "topRight"}
            />

            <Toolbar
                enableViewSelector={showViewSelector}
                currentView={currentView}
                storageKey={storageKey}
                onViewChange={setCurrentView}
                hasCardTemplate={hasCardTemplate}
                hasListTemplate={hasListTemplate}
                toolbarFilters={toolbarFilters}
                onToolbarFilterChange={handleToolbarFilterChange}
                enableToolbarFilterSearch={props.enableToolbarFilterSearch !== false}
                onResetToolbarFilters={handleToolbarResetFilters}
                showSortControls={showSortControls}
                hasSortApplied={hasSortApplied}
                currentSortColumnId={currentSortColumnId}
                currentSortDirection={currentSortDirection}
                sortableColumns={sortableColumns}
                onSortChange={handleToolbarSortChange}
                onSortDirectionChange={handleToolbarSortDirectionChange}
                showToolbarSearch={showToolbarSearch}
                globalSearch={globalSearch}
                onSearchChange={handleToolbarSearchChange}
                onClearSearch={clearToolbarSearch}
                enableFilterDrawer={enableFilterDrawer}
                isFilterDrawerOpen={isFilterDrawerOpen}
                activeFilterCount={activeFilterCount}
                filterButtonRef={filterButtonRef}
                onToggleFilterDrawer={toggleFilterDrawer}
                isColumnVisibilityOpen={!!isHiddenDrawerOpen}
                onToggleColumnVisibility={columnManagement.toggleColumnVisibility}
                enableCsvExport={Boolean(props.enableCsvExport)}
                onCsvExport={() => undefined} // Not used, we use onExportRequest
                csvFileName={props.csvFileName}
                enableExcelExport={Boolean(props.enableExcelExport)}
                onExcelExport={() => undefined} // Not used, we use onExportRequest
                excelFileName={props.excelFileName}
                enablePdfExport={Boolean(props.enablePdfExport)}
                onPdfExport={() => undefined} // Not used, we use onExportRequest
                pdfFileName={props.pdfFileName}
                enableRowDelete={deleteConfig.enableRowDelete}
                showDeleteInToolbar={deleteConfig.deleteButton.showInToolbar}
                deleteButtonLabel={deleteConfig.deleteButton.label}
                deleteDisabled={
                    deleteConfig.deleteButton.requireSelection && selectedRowCount === 0
                }
                onDeleteRows={handleToolbarDelete}
                enableRowAdd={addConfig.enableRowAdd}
                showAddInToolbar={addConfig.addButton.showInToolbar}
                addButtonLabel={addConfig.addButton.label}
                onAddRow={handleAddRow}
                onExportRequest={handleExportRequest}
            />

            <ViewRenderer
                currentView={currentView}
                data={{
                    rowData: filteredData,
                    columns: props.columns || [],
                    columnVisibility,
                    columnOrder,
                    customFormatterRegistry
                }}
                display={{
                    themeClassName,
                    height,
                    pagination,
                    pageSize,
                    rowBuffer: props.rowBuffer || 10,
                    suppressRowVirtualisation: Boolean(props.suppressRowVirtualisation),
                    rowHeightMode: props.rowHeightMode || "fixed",
                    rowHeight: props.rowHeight || 40,
                    rowHeightExpression: props.rowHeightExpression || "",
                    maxRowHeight: props.maxRowHeight || 0,
                    rowClassMode: props.rowClassMode || "none",
                    rowClassAttribute: props.rowClassAttribute,
                    rowClassMapping: props.rowClassMapping || "",
                    rowClassRules: props.rowClassRules || "",
                    rowClassDefault: props.rowClassDefault || "",
                    rowClassExpression: props.rowClassExpression || "",
                    editMode: props.editMode || "cell",
                    stopEditingWhenCellsLoseFocus: Boolean(props.stopEditingWhenCellsLoseFocus),
                    undoRedoCellEditing: Boolean(props.undoRedoCellEditing)
                }}
                uiFeatures={{
                    enableContextMenu: Boolean(props.enableContextMenu),
                    enableSideBar: Boolean(props.enableSideBar),
                    enableStatusBar: Boolean(props.enableStatusBar),
                    enableColumnMenus: Boolean(props.enableColumnMenus),
                    enableHeaderFilterButtons: Boolean(props.enableHeaderFilterButtons),
                    enableFloatingFilters: Boolean(props.enableFloatingFilters)
                }}
                deleteConfig={deleteConfig}
                rowSelectionMode={props.rowSelectionMode || "none"}
                showSelectionCheckboxes={props.showSelectionCheckboxes !== false}
                advancedFeatures={{
                    enableAggregationFooter: Boolean(props.enableAggregationFooter),
                    rowModelType: props.rowModelType,
                    cacheBlockSize: props.cacheBlockSize || 100,
                    maxBlocksInCache: props.maxBlocksInCache || 0,
                    maxConcurrentRequests: props.maxConcurrentRequests || 2
                }}
                grouping={{
                    enabled: Boolean(props.enableRowGrouping),
                    defaultExpanded: props.groupDefaultExpanded ?? -1,
                    showOnSeparateLine: Boolean(props.showGroupRowsOnSeparateLine),
                    suppressAggregationOnRows: Boolean(props.suppressAggregationOnGroupRows)
                }}
                callbacks={{
                    onGridReady,
                    onRowClicked: onRowClickHandler,
                    onRowDoubleClicked: onRowDoubleClickHandler,
                    onSortChanged,
                    onFilterChanged,
                    onColumnMoved,
                    onColumnPinned,
                    onOpenColumnVisibility: columnManagement.toggleColumnVisibility,
                    onOpenHiddenDrawer: columnManagement.toggleHiddenDrawer,
                    onRowClick: props.onRowClick,
                    onRowDoubleClick: props.onRowDoubleClick,
                    onCellEditCommit: props.onCellEditCommit,
                    onDataRefresh: () => props.dataSource?.reload?.(),
                    onSelectionChanged: handleSelectionChanged,
                    onDeleteRows: handleDeleteRows
                }}
                templates={{
                    customCardTemplate: props.customCardTemplate,
                    customListTemplate: props.customListTemplate
                }}
            />

            <FilterDrawer
                isOpen={isFilterDrawerOpen}
                filterableColumns={filterableColumns}
                sortableColumns={sortableColumns}
                activeFilters={activeFilters}
                globalSearch={globalSearch}
                sortModel={sortModel}
                getDistinctValues={(columnId: string) =>
                    getDistinctValuesForColumn(allRowData, props.columns || [], columnId)
                }
                onClose={closeFilterDrawerAndFocus}
                onApplyFilters={filterManagement.applyFilters}
                onClearFilters={filterManagement.clearFilters}
                useLocalStorage={props.useLocalStorage !== false}
                onResetSettings={resetSettings}
            />

            {/* Hidden drawer is used for both toolbar and header menu */}
            {currentView === "grid" && (
                <HiddenDrawer
                    isOpen={!!isHiddenDrawerOpen}
                    columns={props.columns || []}
                    columnVisibility={columnVisibility}
                    onClose={columnManagement.toggleHiddenDrawer}
                    onToggleColumn={columnManagement.toggleColumnVisibilityItem}
                    onResetToDefault={columnManagement.resetColumnVisibilityToDefault}
                />
            )}
        </div>
    );
}
