// src/types.js
import { AGGridContainerProps } from "../typings/AGGridProps";
export { AGGridContainerProps }; // Re-export for convenience

export type ViewMode = "grid" | "cards" | "list" | "harden";

export interface AGGridState {
    currentView: ViewMode;
    isFilterDrawerOpen: boolean;
    isMobile: boolean;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    isColumnVisibilityOpen: boolean;
    columnOrder: string[];
}

export interface PersistedGridState {
    viewMode: ViewMode;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    columnOrder?: string[];
}
