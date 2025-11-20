// src/AGGrid.tsx - Functional Component
import {
    ChangeEvent,
    ReactElement,
    useRef,
    useState,
    useMemo,
    useEffect,
    useCallback
} from "react";

// Import module registration (runs the code)
import "./agGridModules";

// Import AG Grid specifics
import { LicenseManager } from "ag-grid-enterprise";

// Import Mendix types
import { ValueStatus } from "mendix";

// Import types
import { AGGridContainerProps, ViewMode } from "./types";

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
    buildToolbarFilters
} from "./utils/data";
import { getInitialState } from "./utils/initialState";
import { getThemeClassName } from "./utils/theme";
import { CustomFormatterRegistry } from "./utils/customFormatters";
import { getDefaultColumnVisibility } from "./utils/state";

// Import Custom Hooks
import { useToast } from "./hooks/useToast";
import { useResponsive } from "./hooks/useResponsive";
import { usePersistence } from "./hooks/usePersistence";
import { useGridApi } from "./hooks/useGridApi";
import { useDataPolling } from "./hooks/useDataPolling";

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

    // --- 3. Initialize State ---
    // Keep the initial state in a ref so we can pass it to `usePersistence.resetSettings` later
    const initialStateRef = useRef(getInitialState(props));
    const rowDataCacheRef = useRef<{ signature: string; data: any[] }>({
        signature: "",
        data: []
    });
    const [state, setState] = useState(initialStateRef.current);

    const {
        currentView,
        isFilterDrawerOpen,
        activeFilters,
        globalSearch,
        sortModel,
        columnVisibility,
        columnOrder
    } = state;

    // --- 4. Custom Hooks ---

    // Toast notifications
    const { toastNotifications, showToast, dismissToast } = useToast(props.autoHideDuration);

    // Responsive behavior
    const { isMobile, prefersDarkScheme } = useResponsive((newIsMobile) => {
        setState((s) => ({ ...s, isMobile: newIsMobile }));
    });

    // Update state when responsive values change
    useEffect(() => {
        setState((s) => ({ ...s, isMobile, prefersDarkScheme }));
    }, [isMobile, prefersDarkScheme]);

    // Persistence (localStorage)
    const { savePersistedState, resetSettings } = usePersistence(
        props,
        state,
        setState,
        initialStateRef.current
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
    } = useGridApi(state, setState, savePersistedState, props.columns);

    // Data polling
    useDataPolling(props, showToast, gridApiRef);

    // --- 5. Computed Values ---
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

    // --- 6. Event Handlers ---

    // View toggling
    const toggleView = useCallback(
        (newView: ViewMode) => {
            setState((s) => ({ ...s, currentView: newView }));
            savePersistedState({ viewMode: newView });
        },
        [savePersistedState]
    );

    // Filter drawer
    const openFilterDrawer = useCallback(() => {
        // Safely get current sort model from grid if available
        let currentSortModel = sortModel;
        if (gridApiRef.current && typeof gridApiRef.current.getSortModel === "function") {
            try {
                currentSortModel = gridApiRef.current.getSortModel() || sortModel;
            } catch (error) {
                console.warn("[AGGrid] Could not get sort model from grid API:", error);
            }
        }
        setState((s) => ({ ...s, isFilterDrawerOpen: true, sortModel: currentSortModel }));
    }, [gridApiRef, sortModel, setState]);

    const closeFilterDrawer = useCallback((returnFocus = false) => {
        setState((s) => ({ ...s, isFilterDrawerOpen: false }));
        if (returnFocus && filterButtonRef.current) {
            filterButtonRef.current.focus();
        }
    }, []);

    const closeFilterDrawerAndFocus = useCallback(() => {
        closeFilterDrawer(true);
    }, [closeFilterDrawer]);

    const toggleFilterDrawer = useCallback(() => {
        if (isFilterDrawerOpen) {
            closeFilterDrawer();
        } else {
            openFilterDrawer();
        }
    }, [isFilterDrawerOpen, closeFilterDrawer, openFilterDrawer]);

    // Apply filters from drawer
    const applyFiltersFromDrawer = useCallback(
        (
            filters: Record<string, any>,
            search: string,
            sort: Array<{ colId: string; sort: "asc" | "desc" }>
        ) => {
            applyGridSortModel(sort);
            applyFiltersToGrid(filters, search);
            applyGlobalSearch(search);
            setState((s) => ({
                ...s,
                activeFilters: filters,
                globalSearch: search,
                sortModel: sort
            }));
            savePersistedState({ activeFilters: filters, globalSearch: search, sortModel: sort });
        },
        [applyGridSortModel, applyFiltersToGrid, applyGlobalSearch, savePersistedState]
    );

    // Clear filters
    const clearFilters = useCallback(() => {
        applyGridSortModel([]);
        applyFiltersToGrid({}, "");
        applyGlobalSearch("");
        setState((s) => ({ ...s, activeFilters: {}, globalSearch: "", sortModel: [] }));
        savePersistedState({ activeFilters: {}, globalSearch: "", sortModel: [] });
    }, [applyGridSortModel, applyFiltersToGrid, applyGlobalSearch, savePersistedState]);

    // Column visibility
    const toggleColumnVisibility = useCallback(() => {
        // Toolbar column visibility opens the same HiddenDrawer
        setState((s) => ({ ...s, isHiddenDrawerOpen: !s.isHiddenDrawerOpen }));
    }, []);

    // Hidden drawer (open from header menu)
    const toggleHiddenDrawer = useCallback(() => {
        setState((s) => ({ ...s, isHiddenDrawerOpen: !s.isHiddenDrawerOpen }));
    }, []);

    const toggleColumnVisibilityItem = useCallback(
        (columnId: string, visible: boolean) => {
            const newVisibility = { ...columnVisibility, [columnId]: visible };
            setState((s) => ({ ...s, columnVisibility: newVisibility }));
            savePersistedState({ columnVisibility: newVisibility });
        },
        [columnVisibility, savePersistedState]
    );

    const resetColumnVisibilityToDefault = useCallback(() => {
        const defaultVisibility = getDefaultColumnVisibility(props.columns);
        setState((s) => ({ ...s, columnVisibility: defaultVisibility }));
        savePersistedState({ columnVisibility: defaultVisibility });
    }, [props.columns, savePersistedState]);

    // Toolbar handlers
    const handleToolbarSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const search = event.target.value;
            applyGlobalSearch(search);
            setState((s) => ({ ...s, globalSearch: search }));
            savePersistedState({ globalSearch: search });
        },
        [applyGlobalSearch, savePersistedState]
    );

    const clearToolbarSearch = useCallback(() => {
        applyGlobalSearch("");
        setState((s) => ({ ...s, globalSearch: "" }));
        savePersistedState({ globalSearch: "" });
    }, [applyGlobalSearch, savePersistedState]);

    const handleToolbarFilterChange = useCallback(
        (columnId: string, values: string[]) => {
            if (!columnId) {
                return;
            }

            const options = getDistinctValuesForColumn(
                rowDataCacheRef.current.data,
                props.columns || [],
                columnId
            );
            const normalizedValues = values.map(String);
            const newFilters = { ...activeFilters };

            if (normalizedValues.length === options.length) {
                delete newFilters[columnId];
            } else {
                newFilters[columnId] = normalizedValues;
            }

            setState((s) => ({ ...s, activeFilters: newFilters }));
            applyFiltersToGrid(newFilters, globalSearch);
            savePersistedState({ activeFilters: newFilters });
        },
        [activeFilters, applyFiltersToGrid, globalSearch, props.columns, savePersistedState]
    );

    const handleToolbarSortChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            const columnId = event.target.value;
            if (!columnId) {
                const emptySort: Array<{ colId: string; sort: "asc" | "desc" }> = [];
                setState((s) => ({ ...s, sortModel: emptySort }));
                applyGridSortModel(emptySort);
                savePersistedState({ sortModel: emptySort });
                return;
            }

            const newSort = [{ colId: columnId, sort: "asc" as const }];
            setState((s) => ({ ...s, sortModel: newSort }));
            applyGridSortModel(newSort);
            savePersistedState({ sortModel: newSort });
        },
        [applyGridSortModel, savePersistedState]
    );

    const handleToolbarSortDirectionChange = useCallback(
        (direction: "asc" | "desc") => {
            if (sortModel.length === 0) return;

            const newSort = [{ ...sortModel[0], sort: direction }];
            setState((s) => ({ ...s, sortModel: newSort }));
            applyGridSortModel(newSort);
            savePersistedState({ sortModel: newSort });
        },
        [sortModel, applyGridSortModel, savePersistedState]
    );

    const handleToolbarResetFilters = useCallback(() => {
        clearFilters();
    }, [clearFilters]);

    // Row click handler
    const { onRowClick } = props;

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

    // --- 7. Render Logic ---
    const { dataSource, height, pagination, pageSize } = props;

    // Get row data (only update reference when data actually changes)
    const latestRowData = getRowData(dataSource);
    const latestRowSignature = useMemo(() => getRowSignature(latestRowData), [latestRowData]);
    const allRowData = useMemo(() => {
        if (rowDataCacheRef.current.signature !== latestRowSignature) {
            rowDataCacheRef.current = {
                signature: latestRowSignature,
                data: latestRowData
            };
        }

        return rowDataCacheRef.current.data;
    }, [latestRowData, latestRowSignature]);

    // Loading states
    if (!dataSource || dataSource.status === ValueStatus.Loading) {
        return <div className="aggrid-loading">Loading...</div>;
    }
    if (dataSource.status === ValueStatus.Unavailable) {
        return <div className="aggrid-loading">No data source available</div>;
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
                onViewChange={toggleView}
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
                isColumnVisibilityOpen={!!state.isHiddenDrawerOpen}
                onToggleColumnVisibility={toggleColumnVisibility}
                enableCsvExport={Boolean(props.enableCsvExport)}
                onCsvExport={() => undefined} // Not used, we use onExportRequest
                csvFileName={props.csvFileName}
                enableExcelExport={Boolean(props.enableExcelExport)}
                onExcelExport={() => undefined} // Not used, we use onExportRequest
                excelFileName={props.excelFileName}
                enablePdfExport={Boolean(props.enablePdfExport)}
                onPdfExport={() => undefined} // Not used, we use onExportRequest
                pdfFileName={props.pdfFileName}
                onExportRequest={handleExportRequest}
            />

            <ViewRenderer
                currentView={currentView}
                rowData={filteredData}
                columns={props.columns || []}
                themeClassName={themeClassName}
                height={height}
                pagination={pagination}
                pageSize={pageSize}
                onGridReady={onGridReady}
                onRowClicked={onRowClickHandler}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                onColumnPinned={onColumnPinned}
                onOpenColumnVisibility={toggleColumnVisibility}
                onOpenHiddenDrawer={toggleHiddenDrawer}
                columnVisibility={columnVisibility}
                columnOrder={columnOrder}
                customFormatterRegistry={customFormatterRegistry}
                customCardTemplate={props.customCardTemplate}
                customListTemplate={props.customListTemplate}
                enableContextMenu={Boolean(props.enableContextMenu)}
                enableSideBar={Boolean(props.enableSideBar)}
                enableStatusBar={Boolean(props.enableStatusBar)}
                enableColumnMenus={Boolean(props.enableColumnMenus)}
                enableHeaderFilterButtons={Boolean(props.enableHeaderFilterButtons)}
                enableFloatingFilters={Boolean(props.enableFloatingFilters)}
                onRowClick={props.onRowClick}
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
                onApplyFilters={applyFiltersFromDrawer}
                onClearFilters={clearFilters}
                useLocalStorage={props.useLocalStorage !== false}
                onResetSettings={resetSettings}
            />

            {/* Hidden drawer is used for both toolbar and header menu */}
            {currentView === "grid" && (
                <HiddenDrawer
                    isOpen={!!state.isHiddenDrawerOpen}
                    columns={props.columns || []}
                    columnVisibility={columnVisibility}
                    onClose={toggleHiddenDrawer}
                    onToggleColumn={toggleColumnVisibilityItem}
                    onResetToDefault={resetColumnVisibilityToDefault}
                />
            )}
        </div>
    );
}
