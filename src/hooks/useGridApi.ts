import { useRef, useCallback, useEffect } from "react";
import {
    GridApi,
    GridReadyEvent,
    SortChangedEvent,
    FilterChangedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnResizedEvent,
    ColumnState,
    IServerSideDatasource,
    IServerSideGetRowsParams
} from "ag-grid-community";
import { exportToPDF } from "../utils/pdfExport";
import { AGGridState, ColumnPinnedState, PersistedGridState, AGGridContainerProps } from "../types";
import { debugLog } from "../utils/logger";
import {
    isDateRangeValue,
    normalizeDateRangeValue,
    isRelativeDateRangeKey,
    resolveRelativeDateRange
} from "../utils/dateRange";

type GridFilterModel = Record<string, any> | null;

type ExtendedGridApi = GridApi & {
    setQuickFilter: (value: string) => void;
    setFilterModel: (model: GridFilterModel) => void;
    getFilterModel: () => GridFilterModel;
    setSortModel: (model: AGGridState["sortModel"]) => void;
    getSortModel: () => AGGridState["sortModel"];
    getFilterInstance?: (colId: string) => unknown;
};

interface ApiMethodOptions {
    logMissing?: boolean;
}

const getApiFunction = <T extends (...args: any[]) => any>(
    api: ExtendedGridApi | null | undefined,
    methodName: string,
    options: ApiMethodOptions = {}
): T | undefined => {
    const { logMissing = true } = options;
    if (!api) {
        if (logMissing) {
            console.warn(`[AGGrid] Grid API unavailable for method ${methodName}`);
        }
        return undefined;
    }

    const isDestroyed = typeof api.isDestroyed === "function" ? api.isDestroyed() : false;
    if (isDestroyed) {
        if (logMissing) {
            console.warn(`[AGGrid] Grid API destroyed before calling ${methodName}`);
        }
        return undefined;
    }

    const fn = (api as unknown as Record<string, any>)[methodName];
    if (typeof fn !== "function") {
        if (logMissing) {
            console.warn(`[AGGrid] Grid API method ${methodName} is unavailable in this build`);
        }
        return undefined;
    }

    return fn.bind(api) as T;
};

const ensureValidFilterModel = (model: GridFilterModel): GridFilterModel => {
    if (!model) {
        return null;
    }

    const validEntries = Object.entries(model).reduce<Record<string, any>>(
        (acc, [colId, entry]) => {
            if (entry && typeof entry === "object" && "filterType" in entry) {
                acc[colId] = entry;
            }
            return acc;
        },
        {}
    );

    return Object.keys(validEntries).length > 0 ? validEntries : null;
};

const buildFilterModel = (
    filters: Record<string, any>,
    api: ExtendedGridApi | null
): GridFilterModel => {
    if (!filters || Object.keys(filters).length === 0) {
        return null;
    }

    const filterModel: Record<string, any> = {};

    Object.entries(filters).forEach(([colId, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        let candidateValue = value;

        if (typeof candidateValue === "string" && isRelativeDateRangeKey(candidateValue)) {
            candidateValue = resolveRelativeDateRange(candidateValue) ?? candidateValue;
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
                };
            } else if (from) {
                filterModel[colId] = {
                    filterType: "date",
                    type: "greaterThanOrEqual",
                    dateFrom: from
                };
            } else if (to) {
                filterModel[colId] = {
                    filterType: "date",
                    type: "lessThanOrEqual",
                    dateTo: to
                };
            }

            return;
        }

        if (candidateValue === "") {
            return;
        }

        const normalizedValues = (
            Array.isArray(candidateValue) ? candidateValue : [candidateValue]
        ).filter((entry) => entry !== undefined && entry !== null && entry !== "");

        if (!normalizedValues.length) {
            return;
        }

        const filterInstance = api?.getFilterInstance?.(colId) as
            | { getFilterType?: () => string }
            | undefined;
        const filterType = filterInstance?.getFilterType?.() ?? "set";

        if (filterType === "set") {
            filterModel[colId] = {
                filterType: "set",
                values: normalizedValues
            };
            return;
        }

        if (filterType === "text" || filterType === "number") {
            filterModel[colId] = {
                filterType,
                type: "equals",
                filter: normalizedValues[0]
            };
            return;
        }

        filterModel[colId] = {
            filterType: "set",
            values: normalizedValues
        };
    });

    return Object.keys(filterModel).length > 0 ? filterModel : null;
};

const normalizePinnedValue = (value?: ColumnPinnedState): "left" | "right" | null => {
    if (value === "left" || value === "right") {
        return value;
    }
    return null;
};

const areJsonEqual = (left: unknown, right: unknown): boolean =>
    JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const cloneFilterModel = (model: GridFilterModel): GridFilterModel => {
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
    props: AGGridContainerProps
) => {
    const gridApiRef = useRef<ExtendedGridApi | null>(null);
    const { columnOrder, columnPinned, columnWidths, sortModel, globalSearch, gridFilterModel } =
        state;

    // --- Grid API Helpers ---

    const applyGridSortModel = useCallback(
        (sortModel: Array<{ colId: string; sort: "asc" | "desc" }>) => {
            const api = gridApiRef.current;
            const setSortModel = getApiFunction<(model: typeof sortModel) => void>(
                api,
                "setSortModel",
                { logMissing: false }
            );

            if (setSortModel) {
                setSortModel(sortModel);
                return;
            }

            console.warn(
                "[AGGrid] setSortModel is unavailable on the current Grid API, attempting setGridOption fallback"
            );
            const setGridOption = getApiFunction<(key: string, value: unknown) => void>(
                api,
                "setGridOption"
            );
            if (setGridOption) {
                setGridOption("sortModel", sortModel);
            }
        },
        []
    );

    const applyFiltersToGrid = useCallback(
        (filters: Record<string, any>, search: string) => {
            const api = gridApiRef.current;
            if (!api) return;

            const filterModel = buildFilterModel(filters, api);
            const setQuickFilter = getApiFunction<(value: string) => void>(api, "setQuickFilter", {
                logMissing: false
            });
            if (setQuickFilter) {
                setQuickFilter(search || "");
            } else {
                const setGridOption = getApiFunction<(key: string, value: unknown) => void>(
                    api,
                    "setGridOption",
                    { logMissing: false }
                );
                if (setGridOption) {
                    setGridOption("quickFilterText", search || "");
                }
            }

            const setFilterModel = getApiFunction<(model: GridFilterModel) => void>(
                api,
                "setFilterModel",
                { logMissing: false }
            );
            if (setFilterModel) {
                setFilterModel(filterModel);
            } else {
                const setGridOption = getApiFunction<(key: string, value: unknown) => void>(
                    api,
                    "setGridOption",
                    { logMissing: false }
                );
                if (setGridOption) {
                    setGridOption("filterModel", filterModel);
                } else if (filterModel) {
                    console.warn(
                        "[AGGrid] Unable to apply filter model; setFilterModel is unavailable"
                    );
                }
            }

            const clonedModel = cloneFilterModel(filterModel);
            setState((prev) => ({ ...prev, gridFilterModel: clonedModel }));
            savePersistedState({ gridFilterModel: clonedModel });
        },
        [savePersistedState, setState]
    );

    const applyGlobalSearch = useCallback((search: string) => {
        const setQuickFilter = getApiFunction<(value: string) => void>(
            gridApiRef.current,
            "setQuickFilter"
        );
        if (setQuickFilter) {
            setQuickFilter(search || "");
        }
    }, []);

    // --- Internal State Synchronization Helper ---

    const syncColumnStateFromGrid = useCallback(() => {
        const api = gridApiRef.current;
        const getColumnState = getApiFunction<() => ColumnState[]>(api, "getColumnState");
        if (!getColumnState) return;

        const columnState = getColumnState();
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

    // --- Server Side Datasource ---
    const createServerSideDatasource = useCallback((mxMicroflow: string): IServerSideDatasource => {
        return {
            getRows: async (params: IServerSideGetRowsParams) => {
                const { startRow, endRow, sortModel, filterModel } = params.request;
                const requestJson = JSON.stringify({
                    startRow,
                    endRow,
                    sortModel,
                    filterModel,
                    groupKeys: params.request.groupKeys
                });

                try {
                    const responseJson = await new Promise<string>((resolve, reject) => {
                        if (window.mx && window.mx.data && window.mx.data.action) {
                            window.mx.data.action({
                                params: {
                                    actionname: mxMicroflow,
                                    applyto: "none",
                                    args: {
                                        requestJson: requestJson
                                    }
                                },
                                callback: (res: string) => resolve(res),
                                error: (err: any) => reject(err)
                            });
                        } else {
                            reject(new Error("Mendix client API (mx.data.action) not available"));
                        }
                    });

                    const response = JSON.parse(responseJson);
                    params.success({
                        rowData: response.rowData,
                        rowCount: response.lastRow
                    });
                } catch (error) {
                    console.error("[AGGrid] Error fetching server-side data", error);
                    params.fail();
                }
            }
        };
    }, []);

    // --- Grid Event Callbacks ---

    const onGridReady = useCallback(
        (params: GridReadyEvent) => {
            gridApiRef.current = params.api as ExtendedGridApi;
            debugLog("[AGGrid] Grid ready, API available");

            if (props.rowModelType === "serverSide" && props.serverSideMicroflow) {
                const datasource = createServerSideDatasource(props.serverSideMicroflow);
                params.api.setGridOption("serverSideDatasource", datasource);
            }

            // NOTE: We do NOT apply state here anymore.
            // We rely on the useEffect below to sync `state` -> `grid`.
            // This separates "Initialization" from "State Synchronization".
        },
        [props.rowModelType, props.serverSideMicroflow, createServerSideDatasource]
    );

    /**
     * Effect: Sync External State -> Grid
     * This ensures that if Mendix loads a saved state (or state changes externally),
     * the Grid updates to match.
     */
    useEffect(() => {
        const api = gridApiRef.current;
        if (!api) return;

        const getColumnState = getApiFunction<() => ColumnState[]>(api, "getColumnState");
        const applyColumnState = getApiFunction<
            (params: { state: ColumnState[]; applyOrder?: boolean }) => void
        >(api, "applyColumnState");
        if (!getColumnState || !applyColumnState) {
            return;
        }

        const currentColumnState = getColumnState();
        const desiredOrder = columnOrder ?? [];
        const desiredPinned = columnPinned ?? {};
        const desiredWidths = columnWidths ?? {};
        const hasDesiredOrder = Array.isArray(desiredOrder) && desiredOrder.length > 0;
        const hasDesiredWidths = Object.keys(desiredWidths).length > 0;

        const orderDiffers = hasDesiredOrder
            ? desiredOrder.length !== currentColumnState.length ||
              desiredOrder.some((colId, index) => currentColumnState[index]?.colId !== colId)
            : false;

        const pinnedDiffers = currentColumnState.some((col) => {
            const desiredPin = normalizePinnedValue(desiredPinned[col.colId]);
            const currentPin = col.pinned ?? null;
            return desiredPin !== currentPin;
        });

        const widthsDiffer =
            hasDesiredWidths &&
            currentColumnState.some((col) => {
                const desiredWidth = desiredWidths[col.colId];
                return desiredWidth !== undefined && desiredWidth !== col.width;
            });

        if (hasDesiredOrder && (orderDiffers || pinnedDiffers || widthsDiffer)) {
            const seen = new Set<string>();
            const orderedState: ColumnState[] = [];

            const pushColumnState = (colId: string) => {
                if (!colId) return;
                orderedState.push({
                    colId,
                    pinned: normalizePinnedValue(desiredPinned[colId]) ?? undefined,
                    width: desiredWidths[colId] ?? undefined
                });
                seen.add(colId);
            };

            desiredOrder.forEach(pushColumnState);
            currentColumnState.forEach((col) => {
                if (seen.has(col.colId)) return;
                orderedState.push({
                    colId: col.colId,
                    pinned: normalizePinnedValue(desiredPinned[col.colId]) ?? undefined,
                    width: desiredWidths[col.colId] ?? undefined
                });
            });

            applyColumnState({ state: orderedState, applyOrder: true });
        } else if (!hasDesiredOrder && (pinnedDiffers || widthsDiffer)) {
            const stateUpdate: ColumnState[] = currentColumnState.map((col) => ({
                colId: col.colId,
                pinned: normalizePinnedValue(desiredPinned[col.colId]) ?? undefined,
                width: desiredWidths[col.colId] ?? undefined
            }));
            applyColumnState({ state: stateUpdate });
        }

        const desiredSort = sortModel ?? [];
        const getSortModel = getApiFunction<() => AGGridState["sortModel"]>(api, "getSortModel", {
            logMissing: false
        });
        const setSortModelFn = getApiFunction<(model: AGGridState["sortModel"]) => void>(
            api,
            "setSortModel",
            { logMissing: false }
        );
        const currentSort = getSortModel ? getSortModel() ?? [] : [];
        if (!areJsonEqual(currentSort, desiredSort)) {
            if (setSortModelFn) {
                setSortModelFn(desiredSort);
            } else {
                const setGridOption = getApiFunction<(key: string, value: unknown) => void>(
                    api,
                    "setGridOption",
                    { logMissing: false }
                );
                if (setGridOption) {
                    console.warn(
                        "[AGGrid] setSortModel unavailable during state sync, using setGridOption fallback"
                    );
                    setGridOption("sortModel", desiredSort);
                }
            }
        }

        if (globalSearch !== undefined) {
            const setQuickFilter = getApiFunction<(value: string) => void>(api, "setQuickFilter", {
                logMissing: false
            });
            if (setQuickFilter) {
                setQuickFilter(globalSearch || "");
            }
        }

        const desiredFilters = ensureValidFilterModel(gridFilterModel ?? null);
        const getFilterModel = getApiFunction<() => GridFilterModel>(api, "getFilterModel", {
            logMissing: false
        });
        const currentFilters = getFilterModel
            ? ensureValidFilterModel(getFilterModel() ?? null)
            : null;

        if (!areJsonEqual(currentFilters, desiredFilters)) {
            const setFilterModel = getApiFunction<(model: GridFilterModel) => void>(
                api,
                "setFilterModel",
                { logMissing: false }
            );

            if (setFilterModel) {
                setFilterModel(desiredFilters);
            } else {
                const setGridOption = getApiFunction<(key: string, value: unknown) => void>(
                    api,
                    "setGridOption",
                    { logMissing: false }
                );
                if (setGridOption) {
                    setGridOption("filterModel", desiredFilters);
                }
            }
        }
    }, [columnOrder, columnPinned, columnWidths, sortModel, globalSearch, gridFilterModel]);
    // Dependency array is specific properties to avoid re-running on unrelated state changes

    // --- Event Listeners ---

    const onSortChanged = useCallback(
        (params: SortChangedEvent) => {
            // CRITICAL FIX: Prevent infinite loops.
            // Only save state if the change came from user interaction ('ui', 'columnMenu')
            // If source is 'api', it means *we* triggered it via setSortModel, so ignore it.
            if (params.source === "api") return;
            const api = params.api as ExtendedGridApi;
            const getSortModel = getApiFunction<() => AGGridState["sortModel"]>(
                api,
                "getSortModel",
                { logMissing: false }
            );
            if (!getSortModel) return;
            const sortModel = getSortModel();
            setState((s) => ({ ...s, sortModel }));
            savePersistedState({ sortModel });
        },
        [setState, savePersistedState]
    );

    const onFilterChanged = useCallback(
        (params: FilterChangedEvent) => {
            if (params.source === "api") return;

            const api = params.api as ExtendedGridApi;
            const getFilterModel = getApiFunction<() => GridFilterModel>(api, "getFilterModel", {
                logMissing: false
            });
            if (!getFilterModel) return;
            const filterModel = ensureValidFilterModel(cloneFilterModel(getFilterModel() ?? null));
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

    // Persist column widths when user finishes drag-resizing
    const onColumnResized = useCallback(
        (params: ColumnResizedEvent) => {
            // Only capture user-initiated resizes, and only when the drag is finished
            if (params.source === "api" || !params.finished) return;

            const api = params.api as ExtendedGridApi;
            const getColumnState = getApiFunction<() => ColumnState[]>(api, "getColumnState");
            if (!getColumnState) return;

            const columnState = getColumnState();
            const columnWidths: Record<string, number> = {};
            columnState.forEach((col) => {
                if (col.width && col.width > 0) {
                    columnWidths[col.colId] = col.width;
                }
            });

            setState((prev) => ({ ...prev, columnWidths }));
            savePersistedState({ columnWidths });
        },
        [setState, savePersistedState]
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
        onColumnResized,
        applyGridSortModel,
        applyFiltersToGrid,
        applyGlobalSearch,
        handleExportRequest,
        syncColumnStateFromGrid,
        createServerSideDatasource
    };
};
