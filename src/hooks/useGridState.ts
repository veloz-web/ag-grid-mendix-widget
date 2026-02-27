// src/hooks/useGridState.ts
/**
 * Consolidated grid state management hook
 * Manages view mode, filters, search, sort, and column configuration
 */

import { useState, useCallback, useRef } from "react";
import { AGGridState, ViewMode, PersistedGridState } from "../types";
import { AGGridContainerProps } from "../../typings/AGGridProps";
import { getInitialState } from "../utils/initialState";

export interface UseGridStateReturn {
    // State
    state: AGGridState;

    // View management
    currentView: ViewMode;
    setCurrentView: (view: ViewMode) => void;

    // Filter drawer
    isFilterDrawerOpen: boolean;
    openFilterDrawer: () => void;
    closeFilterDrawer: (returnFocus?: boolean) => void;
    toggleFilterDrawer: () => void;

    // Filters
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;

    // Column management
    columnVisibility: Record<string, boolean>;
    columnOrder: string[];
    columnWidths: Record<string, number>;
    isHiddenDrawerOpen: boolean;

    // Update functions
    updateState: (updates: Partial<AGGridState>) => void;
    resetState: () => void;

    // For persistence
    getPersistedState: () => PersistedGridState;
}

export function useGridState(
    props: AGGridContainerProps,
    onPersist?: (state: Partial<PersistedGridState>) => void
): UseGridStateReturn {
    // Initialize state with ref to maintain initial values
    const initialStateRef = useRef(getInitialState(props));
    const [state, setState] = useState<AGGridState>(initialStateRef.current);

    // Destructure commonly used state
    const {
        currentView,
        isFilterDrawerOpen,
        isHiddenDrawerOpen = false,
        activeFilters,
        globalSearch,
        sortModel,
        columnVisibility,
        columnOrder,
        columnWidths = {}
    } = state;

    // Generic state updater with persistence
    const updateState = useCallback(
        (updates: Partial<AGGridState>) => {
            setState((prev) => ({ ...prev, ...updates }));

            // Persist relevant updates
            if (onPersist) {
                const persistUpdates: Partial<PersistedGridState> = {};

                if ("currentView" in updates) persistUpdates.viewMode = updates.currentView;
                if ("activeFilters" in updates)
                    persistUpdates.activeFilters = updates.activeFilters;
                if ("globalSearch" in updates) persistUpdates.globalSearch = updates.globalSearch;
                if ("sortModel" in updates) persistUpdates.sortModel = updates.sortModel;
                if ("columnVisibility" in updates)
                    persistUpdates.columnVisibility = updates.columnVisibility;
                if ("columnOrder" in updates) persistUpdates.columnOrder = updates.columnOrder;
                if ("columnWidths" in updates) persistUpdates.columnWidths = updates.columnWidths;

                if (Object.keys(persistUpdates).length > 0) {
                    onPersist(persistUpdates);
                }
            }
        },
        [onPersist]
    );

    // View management
    const setCurrentView = useCallback(
        (view: ViewMode) => {
            updateState({ currentView: view });
        },
        [updateState]
    );

    // Filter drawer management
    const openFilterDrawer = useCallback(() => {
        updateState({ isFilterDrawerOpen: true });
    }, [updateState]);

    const closeFilterDrawer = useCallback(
        (_returnFocus = false) => {
            updateState({ isFilterDrawerOpen: false });
            // returnFocus is handled by caller with ref
        },
        [updateState]
    );

    const toggleFilterDrawer = useCallback(() => {
        updateState({ isFilterDrawerOpen: !isFilterDrawerOpen });
    }, [isFilterDrawerOpen, updateState]);

    // Reset to initial state
    const resetState = useCallback(() => {
        const newState = getInitialState(props);
        setState(newState);

        if (onPersist) {
            onPersist({
                viewMode: newState.currentView,
                activeFilters: newState.activeFilters,
                globalSearch: newState.globalSearch,
                sortModel: newState.sortModel,
                columnVisibility: newState.columnVisibility,
                columnOrder: newState.columnOrder
            });
        }
    }, [props, onPersist]);

    // Get current persisted state snapshot
    const getPersistedState = useCallback((): PersistedGridState => {
        return {
            viewMode: currentView,
            activeFilters,
            globalSearch,
            sortModel,
            columnVisibility,
            columnOrder,
            columnWidths
        };
    }, [
        currentView,
        activeFilters,
        globalSearch,
        sortModel,
        columnVisibility,
        columnOrder,
        columnWidths
    ]);

    return {
        state,
        currentView,
        setCurrentView,
        isFilterDrawerOpen,
        openFilterDrawer,
        closeFilterDrawer,
        toggleFilterDrawer,
        activeFilters,
        globalSearch,
        sortModel,
        columnVisibility,
        columnOrder,
        columnWidths,
        isHiddenDrawerOpen,
        updateState,
        resetState,
        getPersistedState
    };
}
