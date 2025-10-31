// src/utils/gridApi.ts

import type {
    GridApi,
    ColumnState,
    ApplyColumnStateParams,
    SortModelItem,
    FilterModel
} from "ag-grid-community";
import {
    isDateRangeValue,
    normalizeDateRangeValue,
    isRelativeDateRangeKey,
    resolveRelativeDateRange
} from "./dateRange";

/**
 * Reads the current sort model from the grid API.
 * @param gridApi - The AG Grid API instance.
 * @returns The sort model.
 */
export const getGridSortModel = (gridApi: GridApi | null): SortModelItem[] => {
    if (!gridApi) return [];
    try {
        const columnState: ColumnState[] = gridApi.getColumnState?.() || [];
        return columnState
            .filter((col) => col.sort != null)
            .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
            .map((col) => ({ colId: col.colId, sort: col.sort! }));
    } catch (e) {
        console.error("[AGGrid] getGridSortModel failed:", e);
        return [];
    }
};

/**
 * Applies a sort model to the grid API.
 * @param gridApi - The AG Grid API instance.
 * @param sortModel - The sort model to apply.
 */
export const applyGridSortModel = (gridApi: GridApi | null, sortModel: SortModelItem[]): void => {
    if (!gridApi) return;

    const sortState: ColumnState[] = sortModel.map((s) => ({
        colId: s.colId,
        sort: s.sort
    }));

    const params: ApplyColumnStateParams = {
        state: sortState,
        defaultState: { sort: null }
    };

    try {
        gridApi.applyColumnState(params);
    } catch (e) {
        console.error("[AGGrid] Error in applyGridSortModel:", e);
    }
};

/**
 * Applies column filters and global search to the grid API.
 * @param gridApi - The AG Grid API instance.
 * @param filters - The column filter model (values can be string or string[]).
 * @param globalSearch - The global search text.
 */
export const applyFiltersToGrid = (
    gridApi: GridApi | null,
    filters: Record<string, any>,
    globalSearch: string
): void => {
    if (!gridApi) return;

    const filterModel: FilterModel = {};

    Object.entries(filters || {}).forEach(([colId, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        let candidateValue = value;

        if (typeof candidateValue === "string" && isRelativeDateRangeKey(candidateValue)) {
            candidateValue = resolveRelativeDateRange(candidateValue) ?? undefined;
        }

        if (isDateRangeValue(candidateValue)) {
            const range = normalizeDateRangeValue(candidateValue);
            if (!range) {
                return;
            }

            const { from, to } = range;

            if (from && to) {
                filterModel[colId] = {
                    filterType: "date",
                    type: "inRange",
                    dateFrom: from,
                    dateTo: to
                } as any;
            } else if (from) {
                filterModel[colId] = {
                    filterType: "date",
                    type: "greaterThanOrEqual",
                    dateFrom: from
                } as any;
            } else if (to) {
                filterModel[colId] = {
                    filterType: "date",
                    type: "lessThanOrEqual",
                    dateFrom: to
                } as any;
            }

            return;
        }

        if (value === "") {
            return;
        }

        if (value !== undefined && value !== null) {
            // Try to get the filter instance to detect filter type
            // Use 'any' because getFilterInstance may not be in base types
            const filterInstance = (gridApi as any).getFilterInstance?.(colId);

            // Normalize value to array for multi-select support
            const values = Array.isArray(value) ? value : [value];

            if (filterInstance && typeof filterInstance.getFilterType === "function") {
                const filterType = filterInstance.getFilterType();

                if (filterType === "set") {
                    filterModel[colId] = {
                        filterType: "set",
                        values: values
                    };
                } else {
                    // For text filters with multi-select, use the first value
                    // (or consider using OR condition if supported)
                    filterModel[colId] = {
                        filterType: "text",
                        type: "equals",
                        filter: values[0]
                    };
                }
            } else {
                // Fallback: assume set filter (common in Enterprise)
                filterModel[colId] = {
                    filterType: "set",
                    values: values
                };
            }
        }
    });

    gridApi.setFilterModel(Object.keys(filterModel).length > 0 ? filterModel : null);
    gridApi.setGridOption("quickFilterText", globalSearch || "");
};
