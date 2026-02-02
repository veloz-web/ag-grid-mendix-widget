// src/hooks/useFilterManagement.ts
/**
 * Filter and search management hook
 * Handles active filters, global search, and sort model
 */

import { useCallback, ChangeEvent } from "react";
import { ColumnsType } from "../../typings/AGGridProps";
import { getDistinctValuesForColumn } from "../utils/data";

export interface UseFilterManagementProps {
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    rowData: any[];
    columns: ColumnsType[];
    onUpdateState: (updates: {
        activeFilters?: Record<string, any>;
        globalSearch?: string;
        sortModel?: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    }) => void;
    // Optional: AG Grid API methods for syncing
    applyGridSortModel?: (sort: Array<{ colId: string; sort: "asc" | "desc" }>) => void;
    applyFiltersToGrid?: (filters: Record<string, any>, search: string) => void;
    applyGlobalSearch?: (search: string) => void;
}

export interface UseFilterManagementReturn {
    // Filter operations
    applyFilters: (
        filters: Record<string, any>,
        search: string,
        sort: Array<{ colId: string; sort: "asc" | "desc" }>
    ) => void;
    clearFilters: () => void;
    clearSearch: () => void;

    // Individual filter operations
    setFilter: (columnId: string, values: string[]) => void;
    removeFilter: (columnId: string) => void;

    // Search operations
    setSearch: (search: string) => void;
    handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;

    // Sort operations
    setSort: (sort: Array<{ colId: string; sort: "asc" | "desc" | null }>) => void;
    setSortColumn: (columnId: string) => void;
    setSortDirection: (direction: "asc" | "desc") => void;

    // Utilities
    hasActiveFilters: () => boolean;
    getFilterCount: () => number;
}

export function useFilterManagement({
    activeFilters,
    globalSearch,
    sortModel,
    rowData,
    columns,
    onUpdateState,
    applyGridSortModel,
    applyFiltersToGrid,
    applyGlobalSearch
}: UseFilterManagementProps): UseFilterManagementReturn {
    // Apply filters from drawer (complete filter state)
    const applyFilters = useCallback(
        (
            filters: Record<string, any>,
            search: string,
            sort: Array<{ colId: string; sort: "asc" | "desc" }>
        ) => {
            // Update AG Grid if methods provided
            if (applyGridSortModel) applyGridSortModel(sort);
            if (applyFiltersToGrid) applyFiltersToGrid(filters, search);
            if (applyGlobalSearch) applyGlobalSearch(search);

            // Update state
            onUpdateState({
                activeFilters: filters,
                globalSearch: search,
                sortModel: sort
            });
        },
        [applyGridSortModel, applyFiltersToGrid, applyGlobalSearch, onUpdateState]
    );

    // Clear all filters
    const clearFilters = useCallback(() => {
        const emptySort: Array<{ colId: string; sort: "asc" | "desc" }> = [];

        if (applyGridSortModel) applyGridSortModel(emptySort);
        if (applyFiltersToGrid) applyFiltersToGrid({}, "");
        if (applyGlobalSearch) applyGlobalSearch("");

        onUpdateState({
            activeFilters: {},
            globalSearch: "",
            sortModel: []
        });
    }, [applyGridSortModel, applyFiltersToGrid, applyGlobalSearch, onUpdateState]);

    // Clear search only
    const clearSearch = useCallback(() => {
        if (applyGlobalSearch) applyGlobalSearch("");
        onUpdateState({ globalSearch: "" });
    }, [applyGlobalSearch, onUpdateState]);

    // Set individual filter
    const setFilter = useCallback(
        (columnId: string, values: string[]) => {
            if (!columnId) return;

            const options = getDistinctValuesForColumn(rowData, columns, columnId);
            const normalizedValues = values.map(String);
            const newFilters = { ...activeFilters };

            if (normalizedValues.length === options.length) {
                delete newFilters[columnId];
            } else {
                newFilters[columnId] = normalizedValues;
            }

            if (applyFiltersToGrid) applyFiltersToGrid(newFilters, globalSearch);
            onUpdateState({ activeFilters: newFilters });
        },
        [activeFilters, rowData, columns, globalSearch, applyFiltersToGrid, onUpdateState]
    );

    // Remove individual filter
    const removeFilter = useCallback(
        (columnId: string) => {
            const newFilters = { ...activeFilters };
            delete newFilters[columnId];

            if (applyFiltersToGrid) applyFiltersToGrid(newFilters, globalSearch);
            onUpdateState({ activeFilters: newFilters });
        },
        [activeFilters, globalSearch, applyFiltersToGrid, onUpdateState]
    );

    // Set search
    const setSearch = useCallback(
        (search: string) => {
            if (applyGlobalSearch) applyGlobalSearch(search);
            onUpdateState({ globalSearch: search });
        },
        [applyGlobalSearch, onUpdateState]
    );

    // Handle search input change
    const handleSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setSearch(event.target.value);
        },
        [setSearch]
    );

    // Set complete sort model
    const setSort = useCallback(
        (sort: Array<{ colId: string; sort: "asc" | "desc" | null }>) => {
            if (applyGridSortModel) {
                applyGridSortModel(
                    sort.filter((s) => s.sort !== null) as Array<{
                        colId: string;
                        sort: "asc" | "desc";
                    }>
                );
            }
            onUpdateState({ sortModel: sort });
        },
        [applyGridSortModel, onUpdateState]
    );

    // Set sort column (default to asc)
    const setSortColumn = useCallback(
        (columnId: string) => {
            if (!columnId) {
                setSort([]);
                return;
            }

            const newSort = [{ colId: columnId, sort: "asc" as const }];
            setSort(newSort);
        },
        [setSort]
    );

    // Set sort direction (keep current column)
    const setSortDirection = useCallback(
        (direction: "asc" | "desc") => {
            if (sortModel.length === 0) return;

            const newSort = [{ ...sortModel[0], sort: direction }];
            setSort(newSort);
        },
        [sortModel, setSort]
    );

    // Check if any filters are active
    const hasActiveFilters = useCallback(() => {
        return Object.keys(activeFilters).length > 0 || globalSearch.length > 0;
    }, [activeFilters, globalSearch]);

    // Count active filters
    const getFilterCount = useCallback(() => {
        let count = Object.keys(activeFilters).length;
        if (globalSearch.length > 0) count++;
        return count;
    }, [activeFilters, globalSearch]);

    return {
        applyFilters,
        clearFilters,
        clearSearch,
        setFilter,
        removeFilter,
        setSearch,
        handleSearchChange,
        setSort,
        setSortColumn,
        setSortDirection,
        hasActiveFilters,
        getFilterCount
    };
}
