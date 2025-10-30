// src/AGGrid.js
import { ChangeEvent, Component, ReactNode, createRef } from "react";

// Import module registration (runs the code)
import "./agGridModules";

// Import AG Grid specifics
import { GridReadyEvent } from "ag-grid-community";
import { LicenseManager } from "ag-grid-enterprise";

// Import Mendix types
import { ValueStatus } from "mendix";

// Import new refactored types and components
import { AGGridContainerProps, AGGridState, PersistedGridState, ViewMode } from "./types";
import { Toolbar } from "./components/Toolbar";
import { FilterDrawer } from "./components/FilterDrawer";
import { HiddenDrawer } from "./components/HiddenDrawer";
import { ViewRenderer } from "./components/viewRenderer";
import { CustomFormatterRegistry } from "./utils/customFormatters";
import { getThemeClassName } from "./utils/theme";
import {
    getDefaultSortModel,
    getDefaultColumnVisibility,
    getDefaultColumnOrder
} from "./utils/state";
import {
    getRowData,
    getFilterableColumns,
    getDistinctValuesForColumn,
    getFilteredData
} from "./utils/data";
import { getGridSortModel, applyGridSortModel, applyFiltersToGrid } from "./utils/gridApi";

// Import base styles
import "./ui/AGGrid.css";

export class AGGrid extends Component<AGGridContainerProps, AGGridState> {
    private gridApi: any = null;
    private filterButtonRef = createRef<HTMLButtonElement>();
    private isSettingSortProgrammatically = false;
    private readonly storageKey: string;
    private readonly shouldPersist: boolean;
    private persistedState: PersistedGridState | null = null;
    private customFormatterRegistry: CustomFormatterRegistry = new CustomFormatterRegistry();

    constructor(props: AGGridContainerProps) {
        super(props);

        if (props.licenseKey) {
            LicenseManager.setLicenseKey(props.licenseKey);
        }

        if (
            props.customFormatters &&
            Array.isArray(props.customFormatters) &&
            props.customFormatters.length > 0
        ) {
            this.customFormatterRegistry.registerFormatters(props.customFormatters);
        }

        this.storageKey = `aggrid:${props.name || "default"}`;
        this.shouldPersist = props.useLocalStorage !== false;

        const persisted = this.shouldPersist ? this.loadPersistedState() : null;
        const initialView = persisted?.viewMode ?? this.getInitialView();
        const initialFilters = persisted?.activeFilters ?? {};
        const initialSearch = persisted?.globalSearch ?? "";
        // Use new util functions
        const initialSort = persisted ? persisted.sortModel : getDefaultSortModel(props.columns);
        const initialColumnVisibility =
            persisted?.columnVisibility ?? getDefaultColumnVisibility(props.columns);
        const initialColumnOrder = persisted?.columnOrder ?? getDefaultColumnOrder(props.columns);

        this.state = {
            currentView: initialView,
            isFilterDrawerOpen: false,
            isMobile: this.checkIsMobile(),
            activeFilters: initialFilters,
            globalSearch: initialSearch,
            sortModel: initialSort,
            columnVisibility: initialColumnVisibility,
            isColumnVisibilityOpen: false,
            columnOrder: initialColumnOrder
        };

        this.persistedState = this.shouldPersist
            ? {
                  viewMode: initialView,
                  activeFilters: initialFilters,
                  globalSearch: initialSearch,
                  sortModel: initialSort,
                  columnVisibility: initialColumnVisibility,
                  columnOrder: initialColumnOrder
              }
            : null;
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    // --- Responsive & View Handlers ---

    private getThemeClassName = () => {
        // Use new theme util
        return getThemeClassName(this.props.theme);
    };

    private checkIsMobile = (): boolean => {
        return window.innerWidth < 768;
    };

    private handleResize = () => {
        const isMobile = this.checkIsMobile();
        if (isMobile !== this.state.isMobile) {
            this.setState({
                isMobile,
                currentView: this.getInitialView()
            });
        }
    };

    private getInitialView = (): ViewMode => {
        const { defaultView, mobileDefaultView } = this.props;
        const isMobile = this.checkIsMobile();

        if (isMobile) {
            return (mobileDefaultView || "cards") as ViewMode;
        }
        return (defaultView || "grid") as ViewMode;
    };

    private toggleView = (view: ViewMode) => {
        this.setState({ currentView: view }, () => {
            this.savePersistedState({ viewMode: view });
        });
    };

    // --- Drawer State Handlers ---

    private openFilterDrawer = () => {
        if (this.gridApi) {
            try {
                const currentSortModel = getGridSortModel(this.gridApi); // Use util
                this.setState({ sortModel: currentSortModel, isFilterDrawerOpen: true });
            } catch (error) {
                console.error("[AGGrid] Error syncing sort model:", error);
                this.setState({ isFilterDrawerOpen: true });
            }
        } else {
            this.setState({ isFilterDrawerOpen: true });
        }
    };

    private closeFilterDrawer = (returnFocus = false) => {
        const restoreFocus = () => {
            if (returnFocus && this.filterButtonRef.current) {
                this.filterButtonRef.current.focus();
            }
        };
        if (!this.state.isFilterDrawerOpen) {
            restoreFocus();
            return;
        }
        this.setState({ isFilterDrawerOpen: false }, restoreFocus);
    };

    private closeFilterDrawerAndFocus = () => {
        this.closeFilterDrawer(true);
    };

    private toggleFilterDrawer = () => {
        if (this.state.isFilterDrawerOpen) {
            this.closeFilterDrawer();
        } else {
            this.openFilterDrawer();
        }
    };

    private toggleColumnVisibility = () => {
        this.setState((prevState) => ({
            isColumnVisibilityOpen: !prevState.isColumnVisibilityOpen
        }));
    };

    private toggleColumnVisibilityItem = (columnId: string, visible: boolean) => {
        this.setState((prevState) => {
            const newVisibility = { ...prevState.columnVisibility, [columnId]: visible };
            this.savePersistedState({ columnVisibility: newVisibility });
            return { columnVisibility: newVisibility };
        });
    };

    // --- Grid Event Handlers ---

    private onGridReady = (params: GridReadyEvent) => {
        this.gridApi = params.api;
        // --- DEPRECATION FIX ---
        // this.columnApi = (params as any).columnApi || null; // <-- REMOVED
        // ---

        const { sortModel, activeFilters, globalSearch, columnOrder } = this.state;

        if (columnOrder && columnOrder.length > 0 && this.gridApi) {
            try {
                const columnState = columnOrder.map((colId) => ({ colId }));
                // --- DEPRECATION FIX ---
                this.gridApi.applyColumnState({ state: columnState, applyOrder: true }); // <-- Use gridApi
                // ---
            } catch (error) {
                console.error("[AGGrid] Error applying saved column order:", error);
            }
        }

        if (sortModel.length > 0) {
            this.applyGridSortModel(sortModel);
        }

        applyFiltersToGrid(this.gridApi, activeFilters, globalSearch); // Use util
    };

    private onColumnMoved = () => {
        if (!this.gridApi || !this.shouldPersist) {
            return;
        }
        try {
            // --- DEPRECATION FIX ---
            const columnState = this.gridApi.getColumnState(); // <-- Use gridApi
            // ---
            const columnOrder = columnState
                .filter((col: any) => col.colId)
                .map((col: any) => col.colId);
            this.setState({ columnOrder }, () => {
                this.savePersistedState({ columnOrder });
            });
        } catch (error) {
            console.error("[AGGrid] Error handling column moved:", error);
        }
    };

    private onSortChanged = () => {
        if (this.isSettingSortProgrammatically) {
            return;
        }
        if (this.gridApi) {
            const sortModel = getGridSortModel(this.gridApi); // Use util
            this.setState({ sortModel }, () => {
                this.savePersistedState({ sortModel });
            });
        }
    };

    private onFilterChanged = () => {
        if (this.gridApi) {
            const filterModel = this.gridApi.getFilterModel();
            const newFilters: Record<string, any> = {};

            Object.keys(filterModel).forEach((colId) => {
                const filter = filterModel[colId];
                if (filter && filter.filter) {
                    newFilters[colId] = filter.filter;
                }
            });

            this.setState({ activeFilters: newFilters }, () => {
                this.savePersistedState({ activeFilters: newFilters });
            });
        }
    };

    private onRowClicked = (event: any) => {
        const { onRowClick } = this.props;
        if (!onRowClick || !event.data) {
            return;
        }
        const action = onRowClick.get(event.data);
        if (action && action.canExecute) {
            setTimeout(() => {
                action.execute();
            }, 0);
        }
    };

    // --- Filter/Sort Application ---

    private applyGridSortModel = (sortModel: Array<{ colId: string; sort: "asc" | "desc" }>) => {
        if (!this.gridApi) return;
        try {
            this.isSettingSortProgrammatically = true;
            applyGridSortModel(this.gridApi, sortModel); // Use util
        } catch (e) {
            console.error("[AGGrid] Error in applyGridSortModel:", e);
        } finally {
            setTimeout(() => {
                this.isSettingSortProgrammatically = false;
            }, 50);
        }
    };

    private applyGlobalSearch = (searchValue: string) => {
        this.setState({ globalSearch: searchValue }, () => {
            if (this.gridApi) {
                this.gridApi.setGridOption("quickFilterText", searchValue || "");
            }
            this.savePersistedState({ globalSearch: searchValue });
        });
    };

    private applyFiltersFromDrawer = (
        filters: { [key: string]: any },
        search: string,
        sort: Array<{ colId: string; sort: "asc" | "desc" }>
    ) => {
        const sortModel = Array.isArray(sort) ? sort : this.state.sortModel;
        const sanitizedFilters = Object.entries(filters || {}).reduce<Record<string, any>>(
            (acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    acc[key] = value;
                }
                return acc;
            },
            {}
        );

        this.applyGridSortModel(sortModel);
        applyFiltersToGrid(this.gridApi, sanitizedFilters, search); // Use util

        this.setState(
            {
                activeFilters: sanitizedFilters,
                globalSearch: search,
                sortModel: sortModel
            },
            () => {
                this.savePersistedState({
                    activeFilters: sanitizedFilters,
                    globalSearch: search,
                    sortModel: sortModel
                });
            }
        );
    };

    private clearFilters = () => {
        this.setState({ activeFilters: {}, globalSearch: "", sortModel: [] }, () => {
            this.savePersistedState({ activeFilters: {}, globalSearch: "", sortModel: [] });
        });
        applyFiltersToGrid(this.gridApi, {}, ""); // Use util
        this.applyGridSortModel([]);
    };

    // --- Toolbar Handlers ---

    private handleToolbarFilterChange = (columnId: string, values: string[]) => {
        const newFilters = { ...this.state.activeFilters };

        const column = this.props.columns.find((col) => col.attribute?.id === columnId);
        if (!column) return;

        const allRowData = getRowData(this.props.dataSource);
        const allOptions = getDistinctValuesForColumn(allRowData, this.props.columns, columnId);

        // If all values selected, remove the filter (show all)
        // If none or partial selection, store the array
        if (values.length === allOptions.length) {
            delete newFilters[columnId];
        } else {
            // Store array for multi-select (including empty array for "none selected")
            newFilters[columnId] = values;
        }

        this.setState({ activeFilters: newFilters }, () => {
            this.savePersistedState({ activeFilters: newFilters });
            applyFiltersToGrid(this.gridApi, newFilters, this.state.globalSearch);
        });
    };

    private handleToolbarSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.applyGlobalSearch(event.target.value);
    };

    private clearToolbarSearch = () => {
        this.applyGlobalSearch("");
    };

    private handleToolbarResetFilters = () => {
        // Clear all toolbar filters
        const toolbarColumns = this.props.columns.filter((col) => {
            const filterLocation = (col as any).filterLocation;
            const showInToolbar = (col as any).showInToolbar;
            return filterLocation === "toolbar" || showInToolbar === true;
        });

        const newFilters = { ...this.state.activeFilters };
        toolbarColumns.forEach((col) => {
            if (col.attribute?.id) {
                delete newFilters[col.attribute.id];
            }
        });

        // Clear search and apply
        this.setState(
            {
                activeFilters: newFilters,
                globalSearch: ""
            },
            () => {
                this.savePersistedState({ activeFilters: newFilters, globalSearch: "" });
                applyFiltersToGrid(this.gridApi, newFilters, "");
            }
        );
    };

    private handleToolbarSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const columnId = event.target.value;
        const currentDirection = this.state.sortModel[0]?.sort ?? "asc";
        const nextSortModel = columnId
            ? [{ colId: columnId, sort: currentDirection || "asc" }]
            : [];

        this.applyGridSortModel(nextSortModel);
        this.setState({ sortModel: nextSortModel }, () => {
            this.savePersistedState({ sortModel: nextSortModel });
        });
    };

    private handleToolbarSortDirectionChange = (direction: "asc" | "desc") => {
        const currentSort = this.state.sortModel[0];
        if (!currentSort || currentSort.sort === direction) {
            return;
        }
        const nextSortModel = [{ colId: currentSort.colId, sort: direction }];
        this.applyGridSortModel(nextSortModel);
        this.setState({ sortModel: nextSortModel }, () => {
            this.savePersistedState({ sortModel: nextSortModel });
        });
    };

    // --- Local Storage Persistence ---
    // (Kept in main component as it's tightly coupled to state and props)

    private loadPersistedState(): PersistedGridState | null {
        if (!this.shouldPersist || typeof window === "undefined") {
            return null;
        }
        try {
            const raw = window.localStorage.getItem(this.storageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return null;

            // ... (rest of your load logic)
            // ... (Sanitizing logic is good, keeping it)
            const { customCardTemplate, customListTemplate } = this.props;
            const hasCardTemplate = !!(customCardTemplate && customCardTemplate.trim());
            const hasListTemplate = !!(customListTemplate && customListTemplate.trim());
            let viewMode: ViewMode;
            // ... (your view validation logic)
            if (parsed.viewMode === "grid") viewMode = "grid";
            else if (parsed.viewMode === "cards" && hasCardTemplate) viewMode = "cards";
            else if (parsed.viewMode === "list" && hasListTemplate) viewMode = "list";
            else if (parsed.viewMode === "harden" && hasCardTemplate) viewMode = "harden";
            else viewMode = "grid";

            return {
                viewMode,
                activeFilters: parsed.activeFilters || {},
                globalSearch: parsed.globalSearch || "",
                sortModel: parsed.sortModel || [],
                columnVisibility:
                    parsed.columnVisibility || getDefaultColumnVisibility(this.props.columns),
                columnOrder: parsed.columnOrder || getDefaultColumnOrder(this.props.columns)
            };
            // ...
        } catch {
            return null;
        }
    }

    private savePersistedState(partial: Partial<PersistedGridState>) {
        if (!this.shouldPersist || typeof window === "undefined") {
            return;
        }
        // ... (rest of your save logic)
        // This is fine as-is.
        const nextState: PersistedGridState = {
            viewMode: partial.viewMode ?? this.state.currentView,
            activeFilters: { ...(partial.activeFilters ?? this.state.activeFilters) },
            globalSearch: partial.globalSearch ?? this.state.globalSearch,
            sortModel: (partial.sortModel ?? this.state.sortModel).map((s) => ({ ...s })),
            columnVisibility: { ...(partial.columnVisibility ?? this.state.columnVisibility) },
            columnOrder: [...(partial.columnOrder ?? this.state.columnOrder)]
        };
        this.persistedState = nextState;
        try {
            window.localStorage.setItem(this.storageKey, JSON.stringify(nextState));
        } catch {
            // Ignore
        }
    }

    private resetSettings = () => {
        if (!this.shouldPersist || typeof window === "undefined") {
            return;
        }
        try {
            window.localStorage.removeItem(this.storageKey);
        } catch {
            // Ignore
        }

        const defaultView = this.getInitialView();
        const defaultFilters = {};
        const defaultSearch = "";
        const defaultSort = getDefaultSortModel(this.props.columns); // Use util
        const defaultColumnVisibility = getDefaultColumnVisibility(this.props.columns); // Use util
        const defaultColumnOrder = getDefaultColumnOrder(this.props.columns); // Use util

        this.setState({
            currentView: defaultView,
            activeFilters: defaultFilters,
            globalSearch: defaultSearch,
            sortModel: defaultSort,
            columnVisibility: defaultColumnVisibility,
            columnOrder: defaultColumnOrder
        });

        this.persistedState = null;
        applyFiltersToGrid(this.gridApi, defaultFilters, defaultSearch); // Use util
        this.applyGridSortModel(defaultSort);
        this.closeFilterDrawer();
    };

    // --- Render ---

    render(): ReactNode {
        try {
            const {
                dataSource,
                enableViewSelector,
                enableFilterDrawer,
                columns,
                onRowClick,
                height,
                pagination,
                pageSize
            } = this.props;
            const {
                currentView,
                isFilterDrawerOpen,
                activeFilters,
                globalSearch,
                sortModel,
                columnVisibility,
                isColumnVisibilityOpen
            } = this.state;

            if (!dataSource || dataSource.status === ValueStatus.Loading) {
                return <div className="aggrid-loading">Loading...</div>;
            }
            if (dataSource.status === ValueStatus.Unavailable) {
                return <div className="aggrid-loading">No data source available</div>;
            }

            // --- Use Data Utils ---
            const allRowData = getRowData(dataSource);
            const filteredData =
                currentView === "grid"
                    ? allRowData // Grid handles its own filtering
                    : getFilteredData(allRowData, columns, this.state); // Manual filter for custom views
            const filterableColumns = getFilterableColumns(columns, activeFilters);

            // Build toolbar filters (columns with filterLocation='toolbar')
            const toolbarFilterColumns = columns.filter((col: any) => {
                // Support both legacy showInToolbar and new filterLocation
                if (col.filterLocation) {
                    return col.filterLocation === "toolbar";
                }
                return col.showInToolbar === true;
            });
            const toolbarFilters = toolbarFilterColumns.map((col: any) => {
                const columnId = col.attribute?.id || "";
                const options = getDistinctValuesForColumn(allRowData, columns, columnId);
                const filterValue = activeFilters[columnId];

                // Handle filter values:
                // - undefined/not in activeFilters = all selected (no filter applied)
                // - array (including empty) = exact selection state
                // - string (legacy) = single value selected
                let selectedValues: string[];
                if (filterValue === undefined) {
                    selectedValues = [...options]; // No filter = all selected
                } else if (Array.isArray(filterValue)) {
                    selectedValues = filterValue; // Use exact array (including empty)
                } else {
                    selectedValues = [filterValue]; // Legacy single value
                }

                return {
                    columnId,
                    label: col.header?.value || "Filter",
                    options,
                    selectedValues
                };
            });
            // ---

            const sortableColumns = columns.filter((col) => col.sortable);
            const hasSortApplied = Boolean(
                sortModel && sortModel.length > 0 && sortModel[0]?.colId
            );
            const currentSortColumnId = hasSortApplied ? sortModel[0].colId : "";
            const currentSortDirection = sortModel[0]?.sort ?? "asc";
            const showSortControls = currentView !== "grid" && sortableColumns.length > 0;
            const showToolbarSearch = this.props.showToolbarSearch !== false;

            const hasCardTemplate = !!(
                this.props.customCardTemplate && this.props.customCardTemplate.trim()
            );
            const hasListTemplate = !!(
                this.props.customListTemplate && this.props.customListTemplate.trim()
            );
            const showViewSelector = enableViewSelector && (hasCardTemplate || hasListTemplate);

            const columnFilterCount = Object.keys(activeFilters).filter(
                (key) => activeFilters[key]
            ).length;
            const activeFilterCount = columnFilterCount + (globalSearch ? 1 : 0);

            return (
                <div className="aggrid-container">
                    <Toolbar
                        enableViewSelector={showViewSelector}
                        currentView={currentView}
                        storageKey={this.storageKey}
                        onViewChange={this.toggleView}
                        hasCardTemplate={hasCardTemplate}
                        hasListTemplate={hasListTemplate}
                        toolbarFilters={toolbarFilters}
                        onToolbarFilterChange={this.handleToolbarFilterChange}
                        enableToolbarFilterSearch={
                            (this.props as any).enableToolbarFilterSearch !== false
                        }
                        onResetToolbarFilters={this.handleToolbarResetFilters}
                        showSortControls={showSortControls}
                        hasSortApplied={hasSortApplied}
                        currentSortColumnId={currentSortColumnId}
                        currentSortDirection={currentSortDirection}
                        sortableColumns={sortableColumns}
                        onSortChange={this.handleToolbarSortChange}
                        onSortDirectionChange={this.handleToolbarSortDirectionChange}
                        showToolbarSearch={showToolbarSearch}
                        globalSearch={globalSearch}
                        onSearchChange={this.handleToolbarSearchChange}
                        onClearSearch={this.clearToolbarSearch}
                        enableFilterDrawer={enableFilterDrawer}
                        isFilterDrawerOpen={isFilterDrawerOpen}
                        activeFilterCount={activeFilterCount}
                        filterButtonRef={this.filterButtonRef}
                        onToggleFilterDrawer={this.toggleFilterDrawer}
                        isColumnVisibilityOpen={isColumnVisibilityOpen}
                        onToggleColumnVisibility={this.toggleColumnVisibility}
                    />

                    {/* --- NEW: Use ViewRenderer --- */}
                    <ViewRenderer
                        currentView={currentView}
                        rowData={filteredData}
                        columns={columns}
                        themeClassName={this.getThemeClassName()} // <-- Fixed: Pass theme class name
                        height={height}
                        pagination={pagination}
                        pageSize={pageSize}
                        onGridReady={this.onGridReady}
                        onRowClicked={this.onRowClicked}
                        onSortChanged={this.onSortChanged}
                        onFilterChanged={this.onFilterChanged}
                        onColumnMoved={this.onColumnMoved}
                        columnVisibility={columnVisibility}
                        columnOrder={this.state.columnOrder}
                        customFormatterRegistry={this.customFormatterRegistry}
                        customCardTemplate={this.props.customCardTemplate}
                        customListTemplate={this.props.customListTemplate}
                        onRowClick={onRowClick} // Pass onRowClick for custom views
                    />

                    <FilterDrawer
                        isOpen={isFilterDrawerOpen}
                        filterableColumns={filterableColumns}
                        sortableColumns={sortableColumns}
                        activeFilters={activeFilters}
                        globalSearch={globalSearch}
                        sortModel={sortModel}
                        getDistinctValues={(columnId) =>
                            getDistinctValuesForColumn(allRowData, columns, columnId)
                        }
                        onClose={this.closeFilterDrawerAndFocus}
                        onApplyFilters={this.applyFiltersFromDrawer}
                        onClearFilters={this.clearFilters}
                        useLocalStorage={this.shouldPersist}
                        onResetSettings={this.resetSettings}
                    />

                    <HiddenDrawer
                        isOpen={isColumnVisibilityOpen}
                        columns={columns}
                        columnVisibility={columnVisibility}
                        onClose={this.toggleColumnVisibility}
                        onToggleColumn={this.toggleColumnVisibilityItem}
                    />
                </div>
            );
        } catch (error) {
            console.error("Error rendering AG Grid widget:", error);
            return (
                <div className="aggrid-container" style={{ padding: "20px" }}>
                    <div
                        style={{
                            backgroundColor: "#ffebee",
                            border: "1px solid #f44336",
                            padding: "15px",
                            borderRadius: "4px",
                            color: "#c62828"
                        }}
                    >
                        <strong>Error rendering grid:</strong>
                        <p>{String(error)}</p>
                        <p style={{ fontSize: "12px", marginTop: "10px" }}>
                            Check the browser console for more details.
                        </p>
                    </div>
                </div>
            );
        }
    }
}
