import { Component, ReactNode } from "react";
import { GridReadyEvent } from "ag-grid-community";
// Note: ag-grid-enterprise is imported but only activated with a license key
// The bundle includes Enterprise code, but features are only enabled when licensed
import { LicenseManager } from "ag-grid-enterprise";
import { AGGridContainerProps } from "../typings/AGGridProps";
import { ValueStatus } from "mendix";

import { GridView } from "./components/GridView";
import { CardView } from "./components/CardView";
import { ListView } from "./components/ListView";
import { ViewSelector } from "./components/ViewSelector";
import { FilterDrawer } from "./components/FilterDrawer";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import "./ui/AGGrid.css";

type ViewMode = "grid" | "cards" | "list";

interface AGGridState {
    currentView: ViewMode;
    isFilterDrawerOpen: boolean;
    isMobile: boolean;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
}

interface PersistedGridState {
    viewMode: ViewMode;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
}

export class AGGrid extends Component<AGGridContainerProps, AGGridState> {
    private gridApi: any = null;
    private columnApi: any = null;
    private isSettingSortProgrammatically = false;
    private readonly storageKey: string;
    private persistedState: PersistedGridState | null = null;

    constructor(props: AGGridContainerProps) {
        super(props);

        this.storageKey = `aggrid:${props.name || "default"}`;

        if (props.licenseKey && props.licenseKey.trim() !== "") {
            LicenseManager.setLicenseKey(props.licenseKey);
        }

        const persisted = this.loadPersistedState();
        const initialView = persisted?.viewMode ?? this.getInitialView();
        const initialFilters = persisted?.activeFilters ?? {};
        const initialSearch = persisted?.globalSearch ?? "";
        const initialSort = persisted ? persisted.sortModel : this.getDefaultSortModel();

        this.state = {
            currentView: initialView,
            isFilterDrawerOpen: false,
            isMobile: this.checkIsMobile(),
            activeFilters: initialFilters,
            globalSearch: initialSearch,
            sortModel: initialSort
        };

        this.persistedState = {
            viewMode: initialView,
            activeFilters: initialFilters,
            globalSearch: initialSearch,
            sortModel: initialSort
        };
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

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

    private toggleView = (view: ViewMode) => {
        this.setState({ currentView: view }, () => {
            this.savePersistedState({ viewMode: view });
        });
    };

    private toggleFilterDrawer = () => {
        // If opening the drawer, sync state with current grid state
        if (!this.state.isFilterDrawerOpen && this.gridApi) {
            try {
                const currentSortModel = this.getGridSortModel();
                this.setState({ sortModel: currentSortModel, isFilterDrawerOpen: true });
            } catch (error) {
                console.error("[AGGrid] Error syncing sort model:", error);
                // Fallback: just open drawer without syncing
                this.setState({ isFilterDrawerOpen: true });
            }
        } else {
            this.setState({ isFilterDrawerOpen: !this.state.isFilterDrawerOpen });
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
                this.gridApi.setQuickFilter(searchValue || "");
            }
            this.savePersistedState({ globalSearch: searchValue });
        });
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

    private loadPersistedState(): PersistedGridState | null {
        if (typeof window === "undefined") {
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
            const viewMode: ViewMode =
                viewCandidate === "grid" || viewCandidate === "cards" || viewCandidate === "list"
                    ? viewCandidate
                    : this.getInitialView();

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

            return { viewMode, activeFilters, globalSearch, sortModel };
        } catch {
            return null;
        }
    }

    private savePersistedState(partial: Partial<PersistedGridState>) {
        if (typeof window === "undefined") {
            return;
        }

        const resolvedFilters = partial.activeFilters ?? this.state.activeFilters;
        const resolvedSorts = partial.sortModel ?? this.state.sortModel;

        const nextState: PersistedGridState = {
            viewMode: partial.viewMode ?? this.state.currentView,
            activeFilters: { ...resolvedFilters },
            globalSearch: partial.globalSearch ?? this.state.globalSearch,
            sortModel: (resolvedSorts || []).map((sort) => ({
                colId: sort.colId,
                sort: sort.sort === "asc" || sort.sort === "desc" ? sort.sort : null
            }))
        };

        this.persistedState = nextState;

        try {
            window.localStorage.setItem(this.storageKey, JSON.stringify(nextState));
        } catch {
            // Ignore storage write errors (e.g., quota exceeded or disabled storage)
        }
    }

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

        if (Object.keys(filterModel).length > 0) {
            this.gridApi.setFilterModel(filterModel);
        } else {
            this.gridApi.setFilterModel(null);
        }

        this.gridApi.setQuickFilter(globalSearch || "");
    }

    private renderStatusBadge = (value: any, mappingString: string | undefined): string => {
        try {
            // Handle empty or undefined mapping - return default badge
            if (
                !mappingString ||
                typeof mappingString !== "string" ||
                mappingString.trim() === ""
            ) {
                return `<span class="aggrid-status-badge badge-secondary">${String(
                    value || ""
                )}</span>`;
            }
            const mappings = JSON.parse(mappingString);

            if (!Array.isArray(mappings)) {
                console.warn("Status mapping is not an array:", mappings);
                return `<span class="aggrid-status-badge badge-secondary">${String(
                    value || ""
                )}</span>`;
            }

            // Normalize the value for comparison (handle both integers and strings)
            const normalizedValue = value !== null && value !== undefined ? value : "";

            // Find matching mapping - support both numeric and string values
            const mapping = mappings.find((m: any) => {
                if (m.value === undefined || m.value === null) return false;

                // Try exact match first
                if (m.value === normalizedValue) return true;

                // Try string comparison
                if (String(m.value) === String(normalizedValue)) return true;

                // Try numeric comparison if both can be numbers
                const numValue = Number(normalizedValue);
                const numMapping = Number(m.value);
                if (!isNaN(numValue) && !isNaN(numMapping) && numValue === numMapping) return true;

                return false;
            });

            if (!mapping) {
                // No mapping found, return default badge with the raw value
                return `<span class="aggrid-status-badge badge-secondary">${String(
                    value || ""
                )}</span>`;
            }

            // Return HTML string with badge
            const className = `aggrid-status-badge ${
                mapping.className || "badge-secondary"
            }`.trim();
            const style = mapping.style ? ` style="${mapping.style}"` : "";
            const labelText =
                mapping.label !== undefined && mapping.label !== null
                    ? String(mapping.label)
                    : String(value || "");

            return `<span class="${className}"${style}>${labelText}</span>`;
        } catch (e) {
            // If anything fails, log error and return default badge
            console.error("Error in renderStatusBadge:", e);
            console.error("Mapping string was:", mappingString);
            console.error("Value was:", value);
            return `<span class="aggrid-status-badge badge-secondary">${String(
                value || ""
            )}</span>`;
        }
    };

    private renderLink = (
        value: any,
        urlPattern: string | undefined,
        linkTextPattern: string | undefined
    ): string => {
        try {
            // Handle empty or undefined URL pattern
            if (!urlPattern || typeof urlPattern !== "string" || urlPattern.trim() === "") {
                console.warn("Link URL pattern is empty or invalid, returning plain value:", value);
                return String(value || "");
            }

            // Replace ${value} placeholder with actual value
            const url = urlPattern.replace(/\$\{value\}/g, String(value || ""));

            // Determine link text
            let displayText: string;
            if (
                linkTextPattern &&
                typeof linkTextPattern === "string" &&
                linkTextPattern.trim() !== ""
            ) {
                // Replace ${value} in link text pattern
                displayText = linkTextPattern.replace(/\$\{value\}/g, String(value || ""));
            } else {
                // Use the value as display text
                displayText = String(value || "");
            }

            // Return HTML anchor tag
            return `<a href="${url}" class="aggrid-link" onclick="event.stopPropagation();">${displayText}</a>`;
        } catch (e) {
            console.error("Error in renderLink:", e);
            console.error("URL pattern was:", urlPattern);
            console.error("Value was:", value);
            return String(value || "");
        }
    };

    private applyFormatter = (
        value: any,
        formatter: string,
        attributeType: string,
        customPrefix?: string,
        customSuffix?: string
    ): string => {
        if (value === null || value === undefined) return "";

        try {
            switch (formatter) {
                case "customPrefix":
                    const prefix = customPrefix || "";
                    const suffix = customSuffix || "";
                    return `${prefix}${String(value)}${suffix}`;
                case "currency":
                    return this.formatCurrency(value, "USD");
                case "currencyEUR":
                    return this.formatCurrency(value, "EUR");
                case "currencyGBP":
                    return this.formatCurrency(value, "GBP");
                case "percentage":
                    const numVal = Number(value);
                    return isNaN(numVal) ? String(value) : `${numVal.toFixed(2)}%`;
                case "number":
                    const num = Number(value);
                    return isNaN(num) ? String(value) : num.toLocaleString();
                case "decimal2":
                    const dec = Number(value);
                    return isNaN(dec) ? String(value) : dec.toFixed(2);
                case "dateShort":
                case "dateMDY":
                    return this.formatDate(value, "MM/DD/YYYY");
                case "dateLong":
                    return this.formatDate(value, "long");
                case "dateISO":
                case "dateYMD":
                    return this.formatDate(value, "YYYY-MM-DD");
                case "dateDMY":
                    return this.formatDate(value, "DD/MM/YYYY");
                case "dateTime":
                    return this.formatDate(value, "datetime");
                case "time":
                    return this.formatDate(value, "time");
                case "yesNo":
                    return value ? "Yes" : "No";
                case "trueFalse":
                    return value ? "True" : "False";
                case "uppercase":
                    return String(value).toUpperCase();
                case "lowercase":
                    return String(value).toLowerCase();
                case "capitalize":
                    const str = String(value);
                    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                case "none":
                default:
                    return this.formatValue(value, attributeType);
            }
        } catch (e) {
            console.error("Error applying formatter:", formatter, "Error:", e);
            return String(value);
        }
    };

    private formatCurrency(value: any, currency: string): string {
        const numValue = Number(value);
        if (isNaN(numValue)) return String(value);

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numValue);
    }

    private formatDate(value: any, format: string): string {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return String(value);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        switch (format) {
            case "MM/DD/YYYY":
                return `${month}/${day}/${year}`;
            case "DD/MM/YYYY":
                return `${day}/${month}/${year}`;
            case "YYYY-MM-DD":
                return `${year}-${month}-${day}`;
            case "YYYY/MM/DD":
                return `${year}/${month}/${day}`;
            case "long":
                return date.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
            case "datetime":
                return date.toLocaleString();
            case "time":
                return date.toLocaleTimeString();
            default:
                return date.toLocaleDateString();
        }
    }

    private formatValue(value: any, type: string): string {
        if (value === null || value === undefined) return "";

        switch (type) {
            case "Boolean":
                return value ? "Yes" : "No";
            case "DateTime":
                return value instanceof Date ? value.toLocaleString() : String(value);
            case "Decimal":
            case "Long":
            case "Integer":
                return String(value);
            default:
                return String(value);
        }
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
        const { sortModel, activeFilters, globalSearch } = this.state;

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
            action.execute();
        }
    };

    private getFilterableColumns() {
        const filterable = this.props.columns.filter((col) => col.includeInFilters);
        return filterable;
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
        const { activeFilters, globalSearch } = this.state;
        const { columns } = this.props;

        // If no active filters or global search, return all data
        if (Object.keys(activeFilters).length === 0 && !globalSearch) {
            return rowData;
        }

        // Filter the data based on active filters and global search
        return rowData.filter((item) => {
            // First check global search across all columns
            if (globalSearch && globalSearch.trim() !== "") {
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

            // Then check column-specific filters
            return Object.entries(activeFilters).every(([columnId, filterValue]) => {
                if (!filterValue || filterValue === "") return true;

                const column = columns.find((col) => col.attribute?.id === columnId);
                if (!column || !column.attribute) return true;

                const value = column.attribute.get(item);
                if (value.status !== ValueStatus.Available) return false;

                // Use exact match for dropdown filters
                const itemValue = String(value.value || "");
                const filter = String(filterValue);

                return itemValue === filter;
            });
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
            const { currentView, isFilterDrawerOpen, activeFilters, globalSearch, sortModel } =
                this.state;

            if (!dataSource || dataSource.status === ValueStatus.Loading) {
                return <div className="aggrid-loading">Loading...</div>;
            }

            if (dataSource.status === ValueStatus.Unavailable) {
                return <div className="aggrid-loading">No data source available</div>;
            }

            const filteredData = this.getFilteredData();
            const filterableColumns = this.getFilterableColumns();

            // Count active filters (column filters + global search if present)
            const columnFilterCount = Object.keys(activeFilters).filter(
                (key) => activeFilters[key]
            ).length;
            const activeFilterCount = columnFilterCount + (globalSearch ? 1 : 0);

            return (
                <div className="aggrid-container">
                    <div className="aggrid-toolbar">
                        {enableViewSelector && (
                            <ViewSelector
                                currentView={currentView}
                                onViewChange={this.toggleView}
                                groupId={this.storageKey}
                            />
                        )}
                        {enableFilterDrawer && (
                            <button
                                className="aggrid-filter-btn"
                                onClick={this.toggleFilterDrawer}
                                title="Filters"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                                </svg>
                                {activeFilterCount > 0 && (
                                    <span className="filter-badge">{activeFilterCount}</span>
                                )}
                            </button>
                        )}
                    </div>

                    {currentView === "grid" && (
                        <GridView
                            rowData={filteredData}
                            columns={columns}
                            theme={theme}
                            height={height}
                            pagination={pagination}
                            pageSize={pageSize}
                            onGridReady={this.onGridReady}
                            onRowClicked={this.onRowClicked}
                            onSortChanged={this.onSortChanged}
                            onFilterChanged={this.onFilterChanged}
                            renderStatusBadge={this.renderStatusBadge}
                            renderLink={this.renderLink}
                            applyFormatter={this.applyFormatter}
                        />
                    )}

                    {currentView === "cards" && (
                        <CardView
                            rowData={filteredData}
                            columns={columns}
                            onRowClick={onRowClick}
                            renderStatusBadge={this.renderStatusBadge}
                            renderLink={this.renderLink}
                            applyFormatter={this.applyFormatter}
                        />
                    )}

                    {currentView === "list" && (
                        <ListView
                            rowData={filteredData}
                            columns={columns}
                            onRowClick={onRowClick}
                            applyFormatter={this.applyFormatter}
                        />
                    )}

                    <FilterDrawer
                        isOpen={isFilterDrawerOpen}
                        filterableColumns={filterableColumns}
                        sortableColumns={columns.filter((col) => col.sortable)}
                        activeFilters={activeFilters}
                        globalSearch={globalSearch}
                        sortModel={sortModel}
                        getDistinctValues={this.getDistinctValuesForColumn}
                        onClose={this.toggleFilterDrawer}
                        onApplyFilters={this.applyFiltersFromDrawer}
                        onClearFilters={this.clearFilters}
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
