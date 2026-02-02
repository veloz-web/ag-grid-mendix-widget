// src/hooks/useColumnManagement.ts
/**
 * Column visibility, ordering, and pinning management hook
 */

import { useCallback } from "react";
import { ColumnsType } from "../../typings/AGGridProps";
import { getDefaultColumnVisibility } from "../utils/state";

export interface UseColumnManagementProps {
    columns: ColumnsType[];
    columnVisibility: Record<string, boolean>;
    columnOrder: string[];
    isHiddenDrawerOpen: boolean;
    onUpdateState: (updates: {
        columnVisibility?: Record<string, boolean>;
        columnOrder?: string[];
        isHiddenDrawerOpen?: boolean;
    }) => void;
}

export interface UseColumnManagementReturn {
    // Hidden drawer (column visibility panel)
    toggleHiddenDrawer: () => void;
    toggleColumnVisibility: () => void; // Alias for toolbar

    // Column visibility
    toggleColumnVisibilityItem: (columnId: string, visible: boolean) => void;
    resetColumnVisibilityToDefault: () => void;
    showColumn: (columnId: string) => void;
    hideColumn: (columnId: string) => void;

    // Utilities
    getVisibleColumns: () => string[];
    getHiddenColumns: () => string[];
}

export function useColumnManagement({
    columns,
    columnVisibility,
    columnOrder: _columnOrder,
    isHiddenDrawerOpen,
    onUpdateState
}: UseColumnManagementProps): UseColumnManagementReturn {
    // Toggle hidden drawer (column visibility panel)
    const toggleHiddenDrawer = useCallback(() => {
        onUpdateState({ isHiddenDrawerOpen: !isHiddenDrawerOpen });
    }, [isHiddenDrawerOpen, onUpdateState]);

    // Alias for toolbar button
    const toggleColumnVisibility = toggleHiddenDrawer;

    // Toggle individual column visibility
    const toggleColumnVisibilityItem = useCallback(
        (columnId: string, visible: boolean) => {
            const newVisibility = { ...columnVisibility, [columnId]: visible };
            onUpdateState({ columnVisibility: newVisibility });
        },
        [columnVisibility, onUpdateState]
    );

    // Show a column
    const showColumn = useCallback(
        (columnId: string) => {
            toggleColumnVisibilityItem(columnId, true);
        },
        [toggleColumnVisibilityItem]
    );

    // Hide a column
    const hideColumn = useCallback(
        (columnId: string) => {
            toggleColumnVisibilityItem(columnId, false);
        },
        [toggleColumnVisibilityItem]
    );

    // Reset to default visibility
    const resetColumnVisibilityToDefault = useCallback(() => {
        const defaultVisibility = getDefaultColumnVisibility(columns);
        onUpdateState({ columnVisibility: defaultVisibility });
    }, [columns, onUpdateState]);

    // Get list of visible column IDs
    const getVisibleColumns = useCallback(() => {
        return Object.entries(columnVisibility)
            .filter(([_, visible]) => visible)
            .map(([id, _]) => id);
    }, [columnVisibility]);

    // Get list of hidden column IDs
    const getHiddenColumns = useCallback(() => {
        return Object.entries(columnVisibility)
            .filter(([_, visible]) => !visible)
            .map(([id, _]) => id);
    }, [columnVisibility]);

    return {
        toggleHiddenDrawer,
        toggleColumnVisibility,
        toggleColumnVisibilityItem,
        resetColumnVisibilityToDefault,
        showColumn,
        hideColumn,
        getVisibleColumns,
        getHiddenColumns
    };
}
