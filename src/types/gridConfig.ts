/**
 * Grid Configuration Types
 *
 * Semantic grouping of grid configuration to reduce prop drilling and improve
 * maintainability. Instead of passing 39+ individual props, we group related
 * configuration into logical units.
 */

import type { GridReadyEvent, ColumnPinnedEvent, ColumnResizedEvent } from "ag-grid-community";
import { ColumnsType } from "../columnTypes";
import { CustomFormatterRegistry } from "../utils/customFormatters";
import { ReactNode } from "react";

/**
 * Data-related configuration
 */
export interface GridDataConfig {
    /** Row data to display */
    rowData: any[];
    /** Column configurations */
    columns: ColumnsType[];
    /** Column visibility state */
    columnVisibility?: Record<string, boolean>;
    /** Column ordering */
    columnOrder?: string[];
    /** Custom formatter registry */
    customFormatterRegistry?: CustomFormatterRegistry;
}

/**
 * Display/appearance configuration
 */
export interface GridDisplayConfig {
    /** AG Grid theme class name */
    themeClassName: string;
    /** Grid height in pixels */
    height: number;
    /** Enable pagination */
    pagination: boolean;
    /** Page size (rows per page) */
    pageSize: number;
    /** Where to render pagination: bottom (AG Grid built-in) or top (moved via DOM) */
    paginationPosition: "bottom" | "top";
    /** Extra rows rendered above/below the visible viewport (default: 10) */
    rowBuffer: number;
    /** Disable row virtualisation — renders ALL rows in the DOM (default: false) */
    suppressRowVirtualisation: boolean;
    /** DOM Layout mode: normal (fixed height with scrolling), autoHeight (expand to fit all rows), or print */
    domLayout: "normal" | "autoHeight" | "print";
    /** Auto-size strategy for initial column sizing */
    autoSizeStrategy: "none" | "fitGridWidth" | "fitCellContents";
    /** Skip header text width when auto-sizing to fit cell contents */
    skipHeaderOnAutoSize: boolean;
    /** Whether to persist user-resized column widths to localStorage */
    persistColumnWidths: boolean;
    /** Row height mode: fixed, auto, or custom */
    rowHeightMode: "fixed" | "auto" | "custom";
    /** Row height in pixels (fixed height, or default/min for auto/custom) */
    rowHeight: number;
    /** JavaScript expression for custom row height (when mode is 'custom') */
    rowHeightExpression?: string;
    /** Maximum row height in pixels (0 = unlimited) */
    maxRowHeight: number;
    /** Row class mode: none, mapping, or expression */
    rowClassMode: "none" | "mapping" | "expression";
    /** Attribute used for row class mapping */
    rowClassAttribute?: ColumnsType["attribute"];
    /** JSON mapping string for row class mapping */
    rowClassMapping?: string;
    /** JSON rules mapping class names to expressions */
    rowClassRules?: string;
    /** Default row class when mapping/expression returns nothing */
    rowClassDefault?: string;
    /** JavaScript expression for row class */
    rowClassExpression?: string;
    /** Edit mode: cell or row */
    editMode: "cell" | "row";
    /** Stop editing when focus leaves the cell */
    stopEditingWhenCellsLoseFocus: boolean;
    /** Enable undo/redo for cell edits */
    undoRedoCellEditing: boolean;
}

/**
 * Feature flags for UI components
 */
export interface GridUIFeatures {
    /** Show right-click context menu */
    enableContextMenu: boolean;
    /** Show side bar (columns/filters panel) */
    enableSideBar: boolean;
    /** Show status bar (row counts) */
    enableStatusBar: boolean;
    /** Show column header menus */
    enableColumnMenus: boolean;
    /** Show filter buttons in headers */
    enableHeaderFilterButtons: boolean;
    /** Show floating filters below headers */
    enableFloatingFilters: boolean;
}

/**
 * Delete action configuration
 */
export interface GridDeleteConfig {
    /** Enable row deletion */
    enableRowDelete: boolean;
    /** Allow multi-row deletion */
    bulkDeleteEnabled: boolean;
    /** Confirmation dialog settings */
    deleteConfirmation: {
        enabled: boolean;
        title: string;
        message: string;
    };
    /** Delete button visibility/settings */
    deleteButton: {
        showInToolbar: boolean;
        showInContextMenu: boolean;
        label: string;
        requireSelection: boolean;
    };
}

/**
 * Advanced features configuration
 */
export interface GridAdvancedFeatures {
    /** Enable aggregation footer row */
    enableAggregationFooter: boolean;
    /** Row model type */
    rowModelType?: "clientSide" | "serverSide";
    /** Rows fetched per block from the server (server-side only, default: 100) */
    cacheBlockSize: number;
    /** Max blocks kept in memory (server-side only, 0 = unlimited) */
    maxBlocksInCache: number;
    /** Max simultaneous data requests (server-side only, default: 2) */
    maxConcurrentRequests: number;
}

/**
 * Row grouping configuration
 */
export interface GridGroupingConfig {
    /** Enable row grouping */
    enabled: boolean;
    /** Number of levels to expand by default (-1 = all, 0 = none) */
    defaultExpanded: number;
    /** Display groups on separate lines vs inline */
    showOnSeparateLine: boolean;
    /** Hide aggregations on group rows */
    suppressAggregationOnRows: boolean;
}

/**
 * Grid event callbacks
 */
export interface GridCallbacks {
    /** Called when grid is ready */
    onGridReady: (params: GridReadyEvent) => void;
    /** Called when a row is clicked */
    onRowClicked: (event: any) => void;
    /** Called when a row is double-clicked */
    onRowDoubleClicked?: (event: any) => void;
    /** Called when a cell edit is committed */
    onCellEditCommit?: any;
    /** Called to refresh data source after edits (server-side) */
    onDataRefresh?: () => void;
    /** Called when sort changes */
    onSortChanged?: (event: any) => void;
    /** Called when filter changes */
    onFilterChanged?: (event: any) => void;
    /** Called when column is moved */
    onColumnMoved?: (event: any) => void;
    /** Called when column is pinned */
    onColumnPinned?: (event: ColumnPinnedEvent) => void;
    /** Called when column is resized (user drag or auto-size) */
    onColumnResized?: (event: ColumnResizedEvent) => void;
    /** Called when column visibility menu is requested */
    onOpenColumnVisibility?: () => void;
    /** Called when hidden drawer is requested */
    onOpenHiddenDrawer?: () => void;
    /** Called when row is clicked (for custom views) - Mendix action */
    onRowClick?: any;
    /** Called when row is double-clicked (for custom views) - Mendix action */
    onRowDoubleClick?: any;
    /** Called when selection changes */
    onSelectionChanged?: (event: any) => void;
    /** Called to delete rows */
    onDeleteRows?: (rows: any[], source?: "toolbar" | "context") => void;
}

/**
 * Custom template configuration
 */
export interface GridTemplateConfig {
    /** Custom card template for card view */
    customCardTemplate?: ReactNode;
    /** Custom list template for list view */
    customListTemplate?: ReactNode;
}

/**
 * Complete grid configuration combining all config groups
 */
export interface GridConfig {
    data: GridDataConfig;
    display: GridDisplayConfig;
    uiFeatures: GridUIFeatures;
    deleteConfig?: GridDeleteConfig;
    advancedFeatures: GridAdvancedFeatures;
    grouping: GridGroupingConfig;
    callbacks: GridCallbacks;
    templates: GridTemplateConfig;
    rowModelType?: "clientSide" | "serverSide";
}
