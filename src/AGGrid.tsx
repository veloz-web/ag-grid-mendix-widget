import { ChangeEvent, Component, ReactNode, createRef } from "react";
import {
    ClientSideRowModelModule,
    GridReadyEvent,
    ModuleRegistry,
    QuickFilterModule,
    themeAlpine,
    themeBalham,
    themeMaterial,
    themeQuartz
} from "ag-grid-community";
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ColumnsToolPanelModule,
    LicenseManager,
    MenuModule,
    PaginationModule,
    ServerSideRowModelModule,
    SetFilterModule
} from "ag-grid-enterprise";
import { AGGridContainerProps } from "../typings/AGGridProps";
import { ValueStatus } from "mendix";

// Register only the modules we need for optimal bundle size
ModuleRegistry.registerModules([
    ClientSideRowModelModule, // Required for rowData prop
    ClientSideRowModelApiModule, // Enterprise: API methods like setQuickFilter
    ServerSideRowModelModule, // Enterprise: Server-side row model
    QuickFilterModule, // Community: Quick filter feature
    PaginationModule, // Enterprise: Pagination features
    SetFilterModule, // Enterprise: Set filtering
    CellStyleModule, // Enterprise: Cell styling
    ColumnsToolPanelModule, // Enterprise: Column visibility/reordering
    MenuModule // Enterprise: Context menus
]);

import { GridView } from "./components/GridView";
import { DynamicView } from "./components/CardView";
import { HardenCardView } from "./components/delete/HardenCardView";
import { ListView } from "./components/delete/ListView";
import { CustomTemplateView } from "./components/CustomTemplateView";
import { FilterDrawer } from "./components/FilterDrawer";
import { HiddenDrawer } from "./components/HiddenDrawer";
import { Toolbar } from "./components/Toolbar";
import { compareValuesForSort } from "./utils/formatters";

import "./ui/AGGrid.css";

type ViewMode = "grid" | "cards" | "list" | "harden";

interface AGGridState {
    currentView: ViewMode;
    isFilterDrawerOpen: boolean;
    isMobile: boolean;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    isColumnVisibilityOpen: boolean;
    columnOrder: string[];
}

interface PersistedGridState {
    viewMode: ViewMode;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    columnOrder?: string[];
}

export class AGGrid extends Component<AGGridContainerProps, AGGridState> {
    private gridApi: any = null;
    private columnApi: any = null;
    private filterButtonRef = createRef<HTMLButtonElement>();
    private isSettingSortProgrammatically = false;
    private readonly storageKey: string;
    private readonly shouldPersist: boolean;
    private persistedState: PersistedGridState | null = null;

    constructor(props: AGGridContainerProps) {
        super(props);

        // Set the AG Grid Enterprise license key (required for Enterprise features)
        if (props.licenseKey) {
            LicenseManager.setLicenseKey(props.licenseKey);
        }

        this.storageKey = `aggrid:${props.name || "default"}`;
        this.shouldPersist = props.useLocalStorage !== false;

        const persisted = this.shouldPersist ? this.loadPersistedState() : null;
        const initialView = persisted?.viewMode ?? this.getInitialView();
        const initialFilters = persisted?.activeFilters ?? {};
        const initialSearch = persisted?.globalSearch ?? "";
        const initialSort = persisted ? persisted.sortModel : this.getDefaultSortModel();
        const initialColumnVisibility =
            persisted?.columnVisibility ?? this.getDefaultColumnVisibility();
        const initialColumnOrder = persisted?.columnOrder ?? this.getDefaultColumnOrder();

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

    // Map theme name to AG Grid v34 theme object
    private getThemeObject = () => {
        const themeName = this.props.theme || "material";
        switch (themeName) {
            case "alpine":
                return themeAlpine;
            case "balham":
                return themeBalham;
            case "material":
                return themeMaterial;
            case "quartz":
                return themeQuartz;
            default:
                return themeMaterial;
        }
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

    private getDefaultSortModel = (): Array<{ colId: string; sort: "asc" | "desc" }> => {
        // Get columns with default sort configured
        const sortedColumns = this.props.columns
            .filter((col) => col.defaultSort && col.defaultSort !== "none" && col.attribute?.id)
            .map((col) => ({
                colId: col.attribute!.id,
                sort: col.defaultSort as "asc" | "desc",
                sortIndex: col.sortIndex ?? 999 // Default to end if no index specified
            }))
            .sort((a, b) => a.sortIndex - b.sortIndex); // Sort by sortIndex

        return sortedColumns.map(({ colId, sort }) => ({ colId, sort }));
    };

    private getDefaultColumnVisibility = (): Record<string, boolean> => {
        const visibility: Record<string, boolean> = {};
        this.props.columns.forEach((col) => {
            if (col.attribute?.id) {
                visibility[col.attribute.id] = !col.hidden; // Default to visible unless explicitly hidden
            }
        });
        return visibility;
    };

    private getDefaultColumnOrder = (): string[] => {
        return this.props.columns
            .filter((col) => col.attribute?.id)
            .map((col) => col.attribute!.id);
    };

    private toggleView = (view: ViewMode) => {
        this.setState({ currentView: view }, () => {
            this.savePersistedState({ viewMode: view });
        });
    };

    private openFilterDrawer = () => {
        if (this.gridApi) {
            try {
                const currentSortModel = this.getGridSortModel();
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

    private toggleFilterDrawer = () => {
        if (this.state.isFilterDrawerOpen) {
            this.closeFilterDrawer();
        } else {
            this.openFilterDrawer();
        }
    };

    private applyFilter = (columnId: string, filterValue: any) => {
        this.setState(
            (prevState) => {
                const nextFilters = { ...prevState.activeFilters };

                if (filterValue && filterValue !== "") {
                    nextFilters[columnId] = filterValue;
                } else {
                    delete nextFilters[columnId];
                }

                return { activeFilters: nextFilters };
            },
            () => {
                // Apply to grid if it's ready
                if (this.gridApi) {
                    const filterInstance = this.gridApi.getColumnFilterInstance(columnId);
                    if (filterInstance) {
                        if (filterValue && filterValue !== "") {
                            filterInstance.setModel({
                                type: "equals",
                                filter: filterValue
                            });
                        } else {
                            filterInstance.setModel(null);
                        }
                        this.gridApi.onFilterChanged();
                    }
                }

                this.savePersistedState({ activeFilters: this.state.activeFilters });
            }
        );
    };

    private applyGlobalSearch = (searchValue: string) => {
        this.setState({ globalSearch: searchValue }, () => {
            if (this.gridApi) {
                // ✅ Replace deprecated setQuickFilter with setGridOption
                this.gridApi.setGridOption("quickFilterText", searchValue || "");
            }
            this.savePersistedState({ globalSearch: searchValue });
        });
    };

    private onColumnMoved = () => {
        if (!this.columnApi || !this.shouldPersist) {
            return;
        }

        try {
            const columnState = this.columnApi.getColumnState();
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
        // Don't update state if we're the ones who just changed it programmatically
        if (this.isSettingSortProgrammatically) {
            return;
        }

        if (this.gridApi) {
            const sortModel = this.getGridSortModel();
            this.setState({ sortModel }, () => {
                this.savePersistedState({ sortModel });
            });
        }
    };

    // Read current grid sort model in a safe way that works across AG Grid versions
    private getGridSortModel = (): Array<{ colId: string; sort: "asc" | "desc" }> => {
        if (!this.gridApi) return [];
        try {
            const columnState = (this.gridApi as any).getColumnState
                ? (this.gridApi as any).getColumnState()
                : [];
            return (columnState || [])
                .filter((col: any) => col.sort != null)
                .sort((a: any, b: any) => (a.sortIndex || 0) - (b.sortIndex || 0))
                .map((col: any) => ({ colId: col.colId, sort: col.sort }));
        } catch (e) {
            console.error("[AGGrid] getGridSortModel failed:", e);
            return [];
        }
    };

    // Apply a sort model to the grid in a robust way (uses gridApi.applyColumnState when available)
    private applyGridSortModel = (sortModel: Array<{ colId: string; sort: "asc" | "desc" }>) => {
        if (!this.gridApi) return;

        const sortState = (sortModel || []).map((s) => ({
            colId: s.colId,
            sort: s.sort as "asc" | "desc" | null
        }));

        const apply = (this.gridApi as any).applyColumnState
            ? (this.gridApi as any).applyColumnState.bind(this.gridApi)
            : (this.columnApi as any).applyColumnState?.bind(this.columnApi);

        if (!apply) {
            console.warn("[AGGrid] applyColumnState not available - cannot apply sort state");
            return;
        }

        try {
            this.isSettingSortProgrammatically = true;
            apply({ state: sortState, defaultState: { sort: null } });
        } catch (e) {
            console.error("[AGGrid] Error in applyGridSortModel:", e);
        } finally {
            // give AG Grid a tick to flush events, then clear the flag
            setTimeout(() => {
                this.isSettingSortProgrammatically = false;
            }, 50);
        }
    };

    private handleToolbarSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.applyGlobalSearch(event.target.value);
    };

    private clearToolbarSearch = () => {
        this.applyGlobalSearch("");
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

    private loadPersistedState(): PersistedGridState | null {
        if (!this.shouldPersist || typeof window === "undefined") {
            return null;
        }

        try {
            const raw = window.localStorage.getItem(this.storageKey);
            if (!raw) {
                return null;
            }

            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") {
                return null;
            }

            const viewCandidate = parsed.viewMode;

            // Check if templates are available
            const hasCardTemplate = !!(
                this.props.customCardTemplate && this.props.customCardTemplate.trim()
            );
            const hasListTemplate = !!(
                this.props.customListTemplate && this.props.customListTemplate.trim()
            );

            // Validate viewMode - reset to grid if the persisted view isn't available
            let viewMode: ViewMode;
            if (viewCandidate === "grid") {
                viewMode = "grid";
            } else if (viewCandidate === "cards" && hasCardTemplate) {
                viewMode = "cards";
            } else if (viewCandidate === "list" && hasListTemplate) {
                viewMode = "list";
            } else if (viewCandidate === "harden" && hasCardTemplate) {
                viewMode = "harden";
            } else {
                // Invalid or unavailable view - reset to grid
                viewMode = "grid";
            }

            const activeFilters =
                parsed.activeFilters && typeof parsed.activeFilters === "object"
                    ? Object.entries(parsed.activeFilters as Record<string, any>).reduce<
                          Record<string, any>
                      >((acc, [key, value]) => {
                          if (value !== undefined && value !== null && value !== "") {
                              acc[key] = value;
                          }
                          return acc;
                      }, {})
                    : {};

            const globalSearch = typeof parsed.globalSearch === "string" ? parsed.globalSearch : "";

            const sortModel = Array.isArray(parsed.sortModel)
                ? parsed.sortModel
                      .filter((item: any) => item && typeof item.colId === "string")
                      .map((item: any) => ({
                          colId: item.colId,
                          sort: item.sort === "asc" || item.sort === "desc" ? item.sort : null
                      }))
                : [];

            const columnVisibility =
                parsed.columnVisibility && typeof parsed.columnVisibility === "object"
                    ? (parsed.columnVisibility as Record<string, boolean>)
                    : this.getDefaultColumnVisibility();

            const columnOrder = Array.isArray(parsed.columnOrder)
                ? parsed.columnOrder.filter((id: any) => typeof id === "string")
                : this.getDefaultColumnOrder();

            return {
                viewMode,
                activeFilters,
                globalSearch,
                sortModel,
                columnVisibility,
                columnOrder
            };
        } catch {
            return null;
        }
    }

    private savePersistedState(partial: Partial<PersistedGridState>) {
        if (!this.shouldPersist || typeof window === "undefined") {
            return;
        }

        const resolvedFilters = partial.activeFilters ?? this.state.activeFilters;
        const resolvedSorts = partial.sortModel ?? this.state.sortModel;
        const resolvedVisibility = partial.columnVisibility ?? this.state.columnVisibility;
        const resolvedColumnOrder = partial.columnOrder ?? this.state.columnOrder;

        const nextState: PersistedGridState = {
            viewMode: partial.viewMode ?? this.state.currentView,
            activeFilters: { ...resolvedFilters },
            globalSearch: partial.globalSearch ?? this.state.globalSearch,
            sortModel: (resolvedSorts || []).map((sort) => ({
                colId: sort.colId,
                sort: sort.sort === "asc" || sort.sort === "desc" ? sort.sort : null
            })),
            columnVisibility: { ...resolvedVisibility },
            columnOrder: [...resolvedColumnOrder]
        };

        this.persistedState = nextState;

        try {
            window.localStorage.setItem(this.storageKey, JSON.stringify(nextState));
        } catch {
            // Ignore storage write errors (e.g., quota exceeded or disabled storage)
        }
    }

    private resetSettings = () => {
        if (!this.shouldPersist || typeof window === "undefined") {
            return;
        }

        try {
            window.localStorage.removeItem(this.storageKey);
        } catch {
            // Ignore storage errors
        }

        // Reset to default state
        const defaultView = this.getInitialView();
        const defaultFilters = {};
        const defaultSearch = "";
        const defaultSort = this.getDefaultSortModel();
        const defaultColumnVisibility = this.getDefaultColumnVisibility();
        const defaultColumnOrder = this.getDefaultColumnOrder();

        this.setState({
            currentView: defaultView,
            activeFilters: defaultFilters,
            globalSearch: defaultSearch,
            sortModel: defaultSort,
            columnVisibility: defaultColumnVisibility,
            columnOrder: defaultColumnOrder
        });

        // Clear persisted state
        this.persistedState = null;

        // Apply defaults to grid
        this.applyFiltersToGrid(defaultFilters, defaultSearch);
        this.applyGridSortModel(defaultSort);

        // Close the filter drawer
        this.closeFilterDrawer();
    };

    private applyFiltersToGrid(filters: Record<string, any>, globalSearch: string) {
        if (!this.gridApi) {
            return;
        }

        const filterModel = Object.entries(filters || {}).reduce<Record<string, any>>(
            (acc, [colId, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    acc[colId] = { type: "equals", filter: value };
                }
                return acc;
            },
            {}
        );

        this.gridApi.setFilterModel(Object.keys(filterModel).length > 0 ? filterModel : null);
        this.gridApi.setGridOption("quickFilterText", globalSearch || "");
    }

    private getRowData(): any[] {
        const { dataSource } = this.props;

        if (!dataSource || dataSource.status !== ValueStatus.Available) {
            return [];
        }

        return dataSource.items || [];
    }

    private onGridReady = (params: GridReadyEvent) => {
        this.gridApi = params.api;
        this.columnApi = (params as any).columnApi || null;
        const { sortModel, activeFilters, globalSearch, columnOrder } = this.state;

        // Apply saved column order if available
        if (columnOrder && columnOrder.length > 0 && this.columnApi) {
            try {
                const columnState = columnOrder.map((colId, _index) => ({
                    colId,
                    sort: null,
                    sortIndex: null,
                    aggFunc: null,
                    pivotIndex: null,
                    pinned: null,
                    width: null,
                    hide: false
                }));
                this.columnApi.applyColumnState({ state: columnState, applyOrder: true });
            } catch (error) {
                console.error("[AGGrid] Error applying saved column order:", error);
            }
        }

        if (sortModel.length > 0) {
            this.applyGridSortModel(sortModel);
        }

        this.applyFiltersToGrid(activeFilters, globalSearch);
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
        this.applyFiltersToGrid(sanitizedFilters, search);

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
        this.setState(
            {
                activeFilters: {},
                globalSearch: "",
                sortModel: []
            },
            () => {
                this.savePersistedState({
                    activeFilters: {},
                    globalSearch: "",
                    sortModel: []
                });
            }
        );

        this.applyFiltersToGrid({}, "");
        this.applyGridSortModel([]);
    };

    private onRowClicked = (event: any) => {
        const { onRowClick } = this.props;

        if (!onRowClick || !event.data) {
            return;
        }

        // For ListActionValue, we need to get the action for the specific item
        const action = onRowClick.get(event.data);

        // Check if the action can be executed and execute it
        if (action && action.canExecute) {
            // Defer execution to next tick to ensure proper reactive context in React-only mode
            setTimeout(() => {
                action.execute();
            }, 0);
        }
    };

    private getFilterableColumns() {
        const { activeFilters } = this.state;

        return this.props.columns
            .filter((col) => col.includeInFilters)
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
    }

    private getDistinctValuesForColumn(columnId: string): string[] {
        const rowData = this.getRowData();
        const column = this.props.columns.find((col) => col.attribute?.id === columnId);

        if (!column || !column.attribute) return [];

        const values = new Set<string>();

        rowData.forEach((item) => {
            const value = column.attribute!.get(item);
            if (value.status === ValueStatus.Available && value.value != null) {
                values.add(String(value.value));
            }
        });

        return Array.from(values).sort();
    }

    private onFilterChanged = () => {
        if (this.gridApi) {
            const filterModel = this.gridApi.getFilterModel();
            const newFilters: Record<string, any> = {};

            // Convert AG Grid filter model to our filter format
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

    private getFilteredData(): any[] {
        const rowData = this.getRowData();
        const { activeFilters, globalSearch, sortModel } = this.state;
        const { columns } = this.props;

        const hasGlobalSearch = Boolean(globalSearch && globalSearch.trim() !== "");
        const hasActiveFilters = Object.keys(activeFilters).some((key) => {
            const value = activeFilters[key];
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
                    if (!filterValue || filterValue === "") return true;

                    const column = columns.find((col) => col.attribute?.id === columnId);
                    if (!column || !column.attribute) return true;

                    const value = column.attribute.get(item);
                    if (value.status !== ValueStatus.Available) return false;

                    const itemValue = String(value.value || "");
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
            const aValue = sortColumn.attribute!.get(a);
            const bValue = sortColumn.attribute!.get(b);

            const aComparable =
                aValue && aValue.status === ValueStatus.Available ? aValue.value : null;
            const bComparable =
                bValue && bValue.status === ValueStatus.Available ? bValue.value : null;

            if (aComparable === null && bComparable === null) {
                return 0;
            }

            if (aComparable === null) {
                return 1;
            }

            if (bComparable === null) {
                return -1;
            }

            return compareValuesForSort(aComparable, bComparable) * directionMultiplier;
        });
    }

    render(): ReactNode {
        try {
            const {
                dataSource,
                enableViewSelector,
                enableFilterDrawer,
                columns,
                onRowClick,
                theme,
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
            const sortableColumns = columns.filter((col) => col.sortable);
            const hasSortApplied = Boolean(
                sortModel && sortModel.length > 0 && sortModel[0]?.colId
            );
            const currentSortColumnId = hasSortApplied ? sortModel[0].colId : "";
            const currentSortDirection = sortModel[0]?.sort ?? "asc";
            const showSortControls = currentView !== "grid" && sortableColumns.length > 0;
            const showToolbarSearch = this.props.showToolbarSearch !== false;

            if (!dataSource || dataSource.status === ValueStatus.Loading) {
                return <div className="aggrid-loading">Loading...</div>;
            }

            if (dataSource.status === ValueStatus.Unavailable) {
                return <div className="aggrid-loading">No data source available</div>;
            }

            const filteredData = this.getFilteredData();
            const filterableColumns = this.getFilterableColumns();

            // Check if templates are available
            const hasCardTemplate = !!(
                this.props.customCardTemplate && this.props.customCardTemplate.trim()
            );
            const hasListTemplate = !!(
                this.props.customListTemplate && this.props.customListTemplate.trim()
            );

            // Only show view selector if there are templates available
            const showViewSelector = enableViewSelector && (hasCardTemplate || hasListTemplate);

            // Count active filters (column filters + global search if present)
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

                    {currentView === "grid" && (
                        <GridView
                            rowData={filteredData}
                            columns={columns}
                            theme={this.getThemeObject()}
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
                        />
                    )}

                    {currentView === "cards" &&
                        (this.props.customCardTemplate ? (
                            <CustomTemplateView
                                rowData={filteredData}
                                columns={columns}
                                template={this.props.customCardTemplate}
                                onRowClick={onRowClick}
                                className="aggrid-card-view"
                            />
                        ) : (
                            <DynamicView
                                rowData={filteredData}
                                columns={columns}
                                onRowClick={onRowClick}
                            />
                        ))}

                    {currentView === "list" &&
                        (this.props.customListTemplate ? (
                            <CustomTemplateView
                                rowData={filteredData}
                                columns={columns}
                                template={this.props.customListTemplate}
                                onRowClick={onRowClick}
                                className="aggrid-list-view"
                            />
                        ) : (
                            <ListView
                                rowData={filteredData}
                                columns={columns}
                                onRowClick={onRowClick}
                            />
                        ))}

                    {currentView === "harden" && (
                        <HardenCardView
                            rowData={filteredData}
                            columns={columns}
                            onRowClick={onRowClick}
                        />
                    )}

                    <FilterDrawer
                        isOpen={isFilterDrawerOpen}
                        filterableColumns={filterableColumns}
                        sortableColumns={sortableColumns}
                        activeFilters={activeFilters}
                        globalSearch={globalSearch}
                        sortModel={sortModel}
                        getDistinctValues={(columnId) => this.getDistinctValuesForColumn(columnId)}
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
