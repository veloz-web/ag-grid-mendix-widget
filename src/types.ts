// src/types.js
import { AGGridContainerProps as AGGridContainerPropsBase } from "../typings/AGGridProps";
import { ColumnsType } from "./columnTypes";
// The Mendix code-gen tool omits the `columns` object-list from the generated
// typings. Extend it here so all imports via this file see the correct shape.
export type AGGridContainerProps = AGGridContainerPropsBase & { columns?: ColumnsType[] };

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
    gridFilterModel?: Record<string, any> | null;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    isColumnVisibilityOpen: boolean;
    // Controls the HiddenDrawer opened from the header menu action (separate from toolbar popover)
    isHiddenDrawerOpen?: boolean;
    columnOrder: string[];
    columnPinned: Record<string, ColumnPinnedState>;
    /** Persisted column widths from user drag-resizing (colId -> width in px) */
    columnWidths: Record<string, number>;
    prefersDarkScheme: boolean;
    toastNotifications: ToastNotification[];
}

export interface PersistedGridState {
    viewMode: ViewMode;
    activeFilters: Record<string, any>;
    gridFilterModel?: Record<string, any> | null;
    globalSearch: string;
    sortModel: Array<{ colId: string; sort: "asc" | "desc" | null }>;
    columnVisibility: Record<string, boolean>;
    columnOrder?: string[];
    columnPinned?: Record<string, ColumnPinnedState>;
    /** Persisted column widths from user drag-resizing (colId -> width in px) */
    columnWidths?: Record<string, number>;
    // Persist user's preferred export format and options
    preferredExportFormat?: "csv" | "pdf";
    preferredExportOptions?: {
        fileName?: string;
        allColumns?: boolean;
        pageOrientation?: "landscape" | "portrait";
        title?: string;
    };
}
