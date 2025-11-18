// src/types.js
import { AGGridContainerProps } from "../typings/AGGridProps";
export { AGGridContainerProps }; // Re-export for convenience

export type ViewMode = "grid" | "cards" | "list" | "harden";

export type ColumnPinnedState = "none" | "left" | "right";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastNotification {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

export interface AGGridState {
    currentView: ViewMode;
    isFilterDrawerOpen: boolean;
    isMobile: boolean;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    isColumnVisibilityOpen: boolean;
    // Controls the HiddenDrawer opened from the header menu action (separate from toolbar popover)
    isHiddenDrawerOpen?: boolean;
    columnOrder: string[];
    columnPinned: Record<string, ColumnPinnedState>;
    prefersDarkScheme: boolean;
    toastNotifications: ToastNotification[];
}

export interface PersistedGridState {
    viewMode: ViewMode;
    activeFilters: Record<string, any>;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    columnOrder?: string[];
    columnPinned?: Record<string, ColumnPinnedState>;
    // Persist user's preferred export format and options
    preferredExportFormat?: "csv" | "excel" | "pdf";
    preferredExportOptions?: {
        fileName?: string;
        allColumns?: boolean;
        pageOrientation?: "landscape" | "portrait";
        title?: string;
    };
}
