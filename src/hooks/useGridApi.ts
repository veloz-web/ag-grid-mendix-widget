import { useRef, useCallback, useEffect } from "react";
import {
    GridApi,
    GridReadyEvent,
    SortChangedEvent,
    FilterChangedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnState
} from "ag-grid-community";
import { exportToPDF } from "../utils/pdfExport";
import { AGGridState, ColumnPinnedState, PersistedGridState } from "../types";
import { debugLog } from "../utils/logger";

type FilterModel = Record<string, any> | null;

type ExtendedGridApi = GridApi & {
    setQuickFilter: (value: string) => void;
    setFilterModel: (model: FilterModel) => void;
    getFilterModel: () => FilterModel;
    setSortModel: (model: AGGridState["sortModel"]) => void;
    getSortModel: () => AGGridState["sortModel"];
};

const normalizePinnedValue = (value?: ColumnPinnedState): "left" | "right" | null => {
    if (value === "left" || value === "right") {
        return value;
    }
    return null;
};

const areJsonEqual = (left: unknown, right: unknown): boolean =>
    JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const cloneFilterModel = (model: FilterModel): FilterModel => {
    if (!model) {
        return null;
    }
    try {
        return JSON.parse(JSON.stringify(model));
    } catch {
        return null;
    }
};

export const useGridApi = (
    state: AGGridState,
    setState: React.Dispatch<React.SetStateAction<AGGridState>>,
    savePersistedState: (state: Partial<PersistedGridState>) => void,
    _columns: any // Kept for signature compatibility, though ideally typed
) => {
    const gridApiRef = useRef<ExtendedGridApi | null>(null);
    const { columnOrder, columnPinned, sortModel, globalSearch, gridFilterModel } = state;

    // --- Grid API Helpers ---

    const applyGridSortModel = useCallback(
        (sortModel: Array<{ colId: string; sort: "asc" | "desc" }>) => {
            const api = gridApiRef.current;
            if (!api || api.isDestroyed()) {
                console.warn("[AGGrid] Grid API unavailable for setSortModel");
                return;
            }
            // AG Grid events will fire, but we check event.source in the listener
            // to prevent infinite loops, removing the need for setTimeout flags.
            api.setSortModel(sortModel);
        },
        []
    );

    const applyFiltersToGrid = useCallback(
        (filters: Record<string, any>, search: string) => {
            const api = gridApiRef.current;
            if (!api || api.isDestroyed()) return;

            const hasFilters = Boolean(filters && Object.keys(filters).length > 0);
            const normalizedFilters = hasFilters ? filters : null;

            api.setQuickFilter(search || "");
            api.setFilterModel(normalizedFilters);

            const clonedModel = cloneFilterModel(normalizedFilters);
            setState((prev) => ({ ...prev, gridFilterModel: clonedModel }));
            savePersistedState({ gridFilterModel: clonedModel });
        },
        [savePersistedState, setState]
    );

    const applyGlobalSearch = useCallback((search: string) => {
        if (!gridApiRef.current) return;
        gridApiRef.current.setQuickFilter(search || "");
    }, []);

    // --- Internal State Synchronization Helper ---

    const syncColumnStateFromGrid = useCallback(() => {
        if (!gridApiRef.current) return;

        const columnState = gridApiRef.current.getColumnState();
        const columnOrder = columnState.map((c) => c.colId);

        const columnPinned = columnState.reduce((acc: Record<string, ColumnPinnedState>, col) => {
            acc[col.colId] = (col.pinned as ColumnPinnedState) || "none";
            return acc;
        }, {});

        // We update local state and persist to Mendix
        const newStateUpdate = { columnOrder, columnPinned };

        setState((prev) => ({ ...prev, ...newStateUpdate }));
        savePersistedState(newStateUpdate);
    }, [setState, savePersistedState]);

    // --- Grid Event Callbacks ---

    const onGridReady = useCallback((params: GridReadyEvent) => {
        gridApiRef.current = params.api as ExtendedGridApi;
        debugLog("[AGGrid] Grid ready, API available");

        // NOTE: We do NOT apply state here anymore.
        // We rely on the useEffect below to sync `state` -> `grid`.
        // This separates "Initialization" from "State Synchronization".
    }, []);

    /**
     * Effect: Sync External State -> Grid
     * This ensures that if Mendix loads a saved state (or state changes externally),
     * the Grid updates to match.
     */
    useEffect(() => {
        const api = gridApiRef.current;
        if (!api || api.isDestroyed()) return;

        const currentColumnState = api.getColumnState();
        const desiredOrder = columnOrder ?? [];
        const desiredPinned = columnPinned ?? {};
        const hasDesiredOrder = Array.isArray(desiredOrder) && desiredOrder.length > 0;

        const orderDiffers = hasDesiredOrder
            ? desiredOrder.length !== currentColumnState.length ||
              desiredOrder.some((colId, index) => currentColumnState[index]?.colId !== colId)
            : false;

        const pinnedDiffers = currentColumnState.some((col) => {
            const desiredPin = normalizePinnedValue(desiredPinned[col.colId]);
            const currentPin = col.pinned ?? null;
            return desiredPin !== currentPin;
        });

        if (hasDesiredOrder && (orderDiffers || pinnedDiffers)) {
            const seen = new Set<string>();
            const orderedState: ColumnState[] = [];

            const pushColumnState = (colId: string) => {
                if (!colId) return;
                orderedState.push({
                    colId,
                    pinned: normalizePinnedValue(desiredPinned[colId]) ?? undefined
                });
                seen.add(colId);
            };

            desiredOrder.forEach(pushColumnState);
            currentColumnState.forEach((col) => {
                if (seen.has(col.colId)) return;
                orderedState.push({
                    colId: col.colId,
                    pinned: normalizePinnedValue(desiredPinned[col.colId]) ?? undefined
                });
            });

            api.applyColumnState({ state: orderedState, applyOrder: true });
        } else if (!hasDesiredOrder && pinnedDiffers) {
            const pinnedOnlyState: ColumnState[] = currentColumnState.map((col) => ({
                colId: col.colId,
                pinned: normalizePinnedValue(desiredPinned[col.colId]) ?? undefined
            }));
            api.applyColumnState({ state: pinnedOnlyState });
        }

        const desiredSort = sortModel ?? [];
        const currentSort = api.getSortModel() ?? [];
        if (!areJsonEqual(currentSort, desiredSort)) {
            api.setSortModel(desiredSort);
        }

        if (globalSearch !== undefined) {
            api.setQuickFilter(globalSearch || "");
        }

        const desiredFilters = gridFilterModel ?? null;
        const normalizedDesiredFilters =
            desiredFilters && Object.keys(desiredFilters).length > 0 ? desiredFilters : null;
        const currentFilters = api.getFilterModel() ?? null;
        if (!areJsonEqual(currentFilters, normalizedDesiredFilters)) {
            api.setFilterModel(normalizedDesiredFilters);
        }
    }, [columnOrder, columnPinned, sortModel, globalSearch, gridFilterModel]);
    // Dependency array is specific properties to avoid re-running on unrelated state changes

    // --- Event Listeners ---

    const onSortChanged = useCallback(
        (params: SortChangedEvent) => {
            // CRITICAL FIX: Prevent infinite loops.
            // Only save state if the change came from user interaction ('ui', 'columnMenu')
            // If source is 'api', it means *we* triggered it via setSortModel, so ignore it.
            if (params.source === "api") return;
            const api = params.api as ExtendedGridApi;
            const sortModel = api.getSortModel();
            setState((s) => ({ ...s, sortModel }));
            savePersistedState({ sortModel });
        },
        [setState, savePersistedState]
    );

    const onFilterChanged = useCallback(
        (params: FilterChangedEvent) => {
            if (params.source === "api") return;

            const api = params.api as ExtendedGridApi;
            const filterModel = cloneFilterModel(api.getFilterModel() ?? null);
            debugLog("[AGGrid] Filter changed (User initiated):", filterModel);
            setState((prev) => ({ ...prev, gridFilterModel: filterModel }));
            savePersistedState({ gridFilterModel: filterModel });
        },
        [savePersistedState, setState]
    );

    // Debounce could be added here for performance, as moving columns fires rapidly
    const onColumnMoved = useCallback(
        (params: ColumnMovedEvent) => {
            if (params.source === "api") return;
            syncColumnStateFromGrid();
        },
        [syncColumnStateFromGrid]
    );

    const onColumnPinned = useCallback(
        (params: ColumnPinnedEvent) => {
            if (params.source === "api") return;
            syncColumnStateFromGrid();
        },
        [syncColumnStateFromGrid]
    );

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

            // Persist user preference
            savePersistedState({
                preferredExportFormat: format,
                preferredExportOptions: options
            });

            const api = gridApiRef.current;

            if (!api || api.isDestroyed()) {
                console.warn("[AGGrid] Grid API not ready for export");
                return;
            }

            switch (format) {
                case "csv":
                    api.exportDataAsCsv({
                        fileName: `${options.fileName}.csv`,
                        allColumns: options.allColumns
                    });
                    break;
                case "excel":
                    // Ensure Enterprise is enabled for this
                    if (api.exportDataAsExcel) {
                        api.exportDataAsExcel({
                            fileName: `${options.fileName}.xlsx`,
                            allColumns: options.allColumns
                        });
                    } else {
                        console.error("[AGGrid] Excel export requires AG Grid Enterprise");
                    }
                    break;
                case "pdf":
                    exportToPDF(api, {
                        fileName: options.fileName,
                        pageOrientation: options.pageOrientation || "landscape",
                        title: options.title || "",
                        allColumns: options.allColumns
                    });
                    break;
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
