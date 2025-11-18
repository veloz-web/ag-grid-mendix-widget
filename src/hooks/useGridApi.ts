// src/hooks/useGridApi.ts
import { useRef, useCallback } from "react";
import { exportToPDF } from "../utils/pdfExport";
import { AGGridState, ColumnPinnedState } from "../types";

export const useGridApi = (
    state: AGGridState,
    setState: any,
    savePersistedState: any,
    _columns: any
) => {
    const gridApiRef = useRef<any>(null);
    const isApplyingFilters = useRef(false);
    const isSettingSort = useRef(false);

    // --- Grid API Helpers ---

    const applyGridSortModel = useCallback(
        (sortModel: Array<{ colId: string; sort: "asc" | "desc" }>) => {
            const api = gridApiRef.current;
            if (!api || typeof api.setSortModel !== "function") {
                console.warn("[AGGrid] Grid API unavailable for setSortModel");
                return;
            }
            isSettingSort.current = true;
            api.setSortModel(sortModel);
            setTimeout(() => {
                isSettingSort.current = false;
            }, 50);
        },
        []
    );

    const applyFiltersToGrid = useCallback((filters: Record<string, any>, search: string) => {
        if (!gridApiRef.current) return;
        isApplyingFilters.current = true;
        // Apply filters to grid
        gridApiRef.current.setQuickFilter(search || "");
        setTimeout(() => {
            isApplyingFilters.current = false;
        }, 50);
    }, []);

    const applyGlobalSearch = useCallback((search) => {
        if (!gridApiRef.current) return;
        gridApiRef.current.setQuickFilter(search || "");
    }, []);

    // --- Grid Event Callbacks ---

    const onGridReady = useCallback(
        (params: any) => {
            gridApiRef.current = params.api;
            console.log("[AGGrid] Grid ready, API available");

            // Apply initial state directly (don't use callbacks to avoid stale closure issues)
            const {
                sortModel,
                activeFilters: _activeFilters,
                globalSearch,
                columnOrder,
                columnPinned
            } = state;

            // Apply column state
            if (columnOrder && columnOrder.length > 0) {
                const columnState = columnOrder.map((colId: string) => ({
                    colId,
                    pinned: columnPinned[colId] === "none" ? null : columnPinned[colId]
                }));
                params.api.applyColumnState({ state: columnState, applyOrder: true });
            }

            // Apply sort and search directly
            if (sortModel && sortModel.length > 0) {
                isSettingSort.current = true;
                params.api.setSortModel(sortModel);
                setTimeout(() => {
                    isSettingSort.current = false;
                }, 50);
            }
            if (globalSearch) {
                params.api.setQuickFilter(globalSearch || "");
            }
        },
        [state]
    );

    const onSortChanged = useCallback(() => {
        if (isSettingSort.current || !gridApiRef.current) return;
        const sortModel = gridApiRef.current.getSortModel();
        setState((s: any) => ({ ...s, sortModel }));
        savePersistedState({ sortModel });
    }, [setState, savePersistedState]);

    const onFilterChanged = useCallback(() => {
        if (isApplyingFilters.current || !gridApiRef.current) return;
        const filterModel = gridApiRef.current.getFilterModel();
        console.log("[AGGrid] Filter changed:", filterModel);
        // Grid's internal filters - we don't sync these to state
        // Our drawer filters are managed separately
    }, []);

    const syncColumnStateFromGrid = useCallback(() => {
        if (!gridApiRef.current) return;
        const columnState = gridApiRef.current.getColumnState();
        const columnOrder = columnState.map((c: any) => c.colId);
        const columnPinned = columnState.reduce(
            (acc: Record<string, ColumnPinnedState>, col: any) => {
                acc[col.colId] = col.pinned || "none";
                return acc;
            },
            {}
        );
        setState((s: any) => ({ ...s, columnOrder, columnPinned }));
        savePersistedState({ columnOrder, columnPinned });
    }, [setState, savePersistedState]);

    const onColumnMoved = syncColumnStateFromGrid;
    const onColumnPinned = syncColumnStateFromGrid;

    // --- Export Logic ---
    const handleExportRequest = useCallback(
        (req: {
            format: "csv" | "excel" | "pdf";
            fileName: string;
            allColumns: boolean;
            pageOrientation?: "landscape" | "portrait";
            title?: string;
        }) => {
            const { format, ...options } = req;
            savePersistedState({
                preferredExportFormat: format,
                preferredExportOptions: options
            });

            const api = gridApiRef.current;

            if (!api) {
                console.warn("[AGGrid] Grid API not ready for export");
                return;
            }

            // Now that CsvExportModule is registered, all exports work the same way
            if (format === "csv") {
                api.exportDataAsCsv({
                    fileName: `${options.fileName}.csv`,
                    allColumns: options.allColumns
                });
            } else if (format === "excel") {
                api.exportDataAsExcel({
                    fileName: `${options.fileName}.xlsx`,
                    allColumns: options.allColumns
                });
            } else if (format === "pdf") {
                exportToPDF(api, {
                    fileName: options.fileName,
                    pageOrientation: options.pageOrientation || "landscape",
                    title: options.title || "",
                    allColumns: options.allColumns
                });
            }
        },
        [savePersistedState]
    );

    return {
        gridApiRef,
        onGridReady,
        onSortChanged,
        onFilterChanged,
        onColumnMoved,
        onColumnPinned,
        applyGridSortModel,
        applyFiltersToGrid,
        applyGlobalSearch,
        handleExportRequest,
        syncColumnStateFromGrid
    };
};
