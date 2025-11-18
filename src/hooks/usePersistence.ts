// src/hooks/usePersistence.js
import { useCallback } from "react";

export const usePersistence = (props, state, setState, initialState) => {
    const { useLocalStorage, name } = props;
    const shouldPersist = useLocalStorage !== false;
    const storageKey = `aggrid:${name || "default"}`;

    const savePersistedState = useCallback(
        (partial) => {
            if (!shouldPersist || typeof window === "undefined") {
                return;
            }

            // We build the "next" state from the current state and the partial update
            const nextState = {
                viewMode: partial.viewMode ?? state.currentView,
                activeFilters: partial.activeFilters ?? state.activeFilters,
                gridFilterModel: partial.gridFilterModel ?? state.gridFilterModel,
                globalSearch: partial.globalSearch ?? state.globalSearch,
                sortModel: partial.sortModel ?? state.sortModel,
                columnVisibility: partial.columnVisibility ?? state.columnVisibility,
                columnOrder: partial.columnOrder ?? state.columnOrder,
                columnPinned: partial.columnPinned ?? state.columnPinned,
                preferredExportFormat: partial.preferredExportFormat,
                preferredExportOptions: partial.preferredExportOptions
            };

            try {
                window.localStorage.setItem(storageKey, JSON.stringify(nextState));
            } catch {
                // Ignore persistence errors
            }
        },
        [shouldPersist, storageKey, state]
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
        setState(initialState);
        // todo: We also need to re-apply this to the gridApi
        // This logic should be moved to the useGridApi hook or main component
    }, [shouldPersist, storageKey, setState, initialState]);

    return { savePersistedState, resetSettings };
};
