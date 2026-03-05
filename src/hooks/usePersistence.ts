// src/hooks/usePersistence.js
import { useCallback, useRef } from "react";

export const usePersistence = (props, state, setState, initialState) => {
    const { useLocalStorage, name } = props;
    const shouldPersist = useLocalStorage !== false;
    const storageKey = `aggrid:${name || "default"}`;

    // Ref keeps the latest state without needing it in every useCallback dep array.
    // This also fixes the hook-ordering problem in AGGrid.tsx where usePersistence
    // is called before useGridState makes state available (state is initially
    // undefined). The ref is updated synchronously each render, so by the time
    // savePersistedState is actually invoked the ref always holds the current state.
    const stateRef = useRef(state);
    stateRef.current = state;

    const savePersistedState = useCallback(
        (partial) => {
            const currentState = stateRef.current;
            if (!shouldPersist || typeof window === "undefined" || !currentState) {
                return;
            }

            // We build the "next" state from the current state and the partial update
            const nextState = {
                viewMode: partial.viewMode ?? currentState.currentView,
                activeFilters: partial.activeFilters ?? currentState.activeFilters,
                gridFilterModel: partial.gridFilterModel ?? currentState.gridFilterModel,
                globalSearch: partial.globalSearch ?? currentState.globalSearch,
                sortModel: partial.sortModel ?? currentState.sortModel,
                columnVisibility: partial.columnVisibility ?? currentState.columnVisibility,
                columnOrder: partial.columnOrder ?? currentState.columnOrder,
                columnPinned: partial.columnPinned ?? currentState.columnPinned,
                columnWidths: partial.columnWidths ?? currentState.columnWidths,
                preferredExportFormat: partial.preferredExportFormat,
                preferredExportOptions: partial.preferredExportOptions
            };

            try {
                window.localStorage.setItem(storageKey, JSON.stringify(nextState));
            } catch {
                // Ignore persistence errors
            }
        },
        // stateRef is a stable ref object – it doesn't need to be in the dep array.
        // Removing `state` from deps means the function reference is stable across
        // renders, preventing cascading useEffect re-runs in consumers.
        [shouldPersist, storageKey]
    );

    const resetSettings = useCallback(() => {
        if (shouldPersist && typeof window !== "undefined") {
            try {
                window.localStorage.removeItem(storageKey);
            } catch {
                // Ignore
            }
        }
        // Reset state to the calculated initial state
        if (typeof setState === "function") {
            setState(initialState);
        }
        // todo: We also need to re-apply this to the gridApi
        // This logic should be moved to the useGridApi hook or main component
    }, [shouldPersist, storageKey, setState, initialState]);

    return { savePersistedState, resetSettings };
};
