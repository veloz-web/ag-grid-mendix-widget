import React, { ChangeEvent, RefObject } from "react";
import { ViewSelector } from "./ViewSelector";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { ColumnsType } from "../columnTypes";

type ViewMode = "grid" | "cards" | "list" | "harden";

export type CustomButtonStyle = "default" | "primary" | "success" | "danger" | "warning" | "info";
export type CustomButtonIcon =
    | "none"
    | "plus"
    | "edit"
    | "trash"
    | "refresh"
    | "download"
    | "upload"
    | "check"
    | "close"
    | "search"
    | "settings"
    | "link"
    | "copy"
    | "save"
    | "mail"
    | "print";
export type CustomButtonPosition = "left" | "right";

export interface CustomToolbarButton {
    buttonLabel: string;
    buttonStyle: CustomButtonStyle;
    buttonIcon: CustomButtonIcon;
    buttonPosition: CustomButtonPosition;
    buttonVisible: boolean;
    buttonDisabled: boolean;
    onAction: () => void;
}

export interface ToolbarFilterColumn {
    columnId: string;
    label: string;
    options: string[];
    selectedValues: string[];
}

export interface ToolbarProps {
    // View selector props
    enableViewSelector: boolean;
    currentView: ViewMode;
    storageKey: string;
    onViewChange: (view: ViewMode) => void;
    hasCardTemplate: boolean;
    hasListTemplate: boolean;

    // Toolbar filters props
    toolbarFilters: ToolbarFilterColumn[];
    onToolbarFilterChange: (columnId: string, values: string[]) => void;
    enableToolbarFilterSearch: boolean;

    // Sort controls props
    showSortControls: boolean;
    hasSortApplied: boolean;
    currentSortColumnId: string;
    currentSortDirection: "asc" | "desc";
    sortableColumns: ColumnsType[];
    onSortChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    onSortDirectionChange: (direction: "asc" | "desc") => void;

    // Search props
    showToolbarSearch: boolean;
    globalSearch: string;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;

    // Reset button props
    onResetToolbarFilters: () => void;

    // Filter drawer props
    enableFilterDrawer: boolean;
    isFilterDrawerOpen: boolean;
    activeFilterCount: number;
    filterButtonRef: RefObject<HTMLButtonElement>;
    onToggleFilterDrawer: () => void;

    // Column visibility props
    isColumnVisibilityOpen: boolean;
    onToggleColumnVisibility: () => void;

    // CSV Export props
    enableCsvExport: boolean;
    onCsvExport: () => void;
    csvFileName?: string;

    // PDF Export props
    enablePdfExport: boolean;
    onPdfExport: () => void;
    pdfFileName?: string;
    // Delete props
    enableRowDelete: boolean;
    showDeleteInToolbar: boolean;
    deleteButtonLabel: string;
    deleteDisabled: boolean;
    onDeleteRows?: () => void;
    // Add props
    enableRowAdd: boolean;
    showAddInToolbar: boolean;
    addButtonLabel: string;
    onAddRow?: () => void;
    // Consolidated export callback
    onExportRequest?: (req: {
        format: "csv" | "pdf";
        fileName: string;
        allColumns: boolean;
        pageOrientation?: "landscape" | "portrait";
        title?: string;
    }) => void;
    // Custom toolbar buttons
    customButtons?: CustomToolbarButton[];
}

export const Toolbar: React.FC<ToolbarProps> = ({
    enableViewSelector,
    currentView,
    storageKey,
    onViewChange,
    hasCardTemplate,
    hasListTemplate,
    toolbarFilters,
    onToolbarFilterChange,
    enableToolbarFilterSearch,
    showSortControls,
    hasSortApplied,
    currentSortColumnId,
    currentSortDirection,
    sortableColumns,
    onSortChange,
    onSortDirectionChange,
    showToolbarSearch,
    globalSearch,
    onSearchChange,
    onClearSearch,
    onResetToolbarFilters,
    enableFilterDrawer,
    isFilterDrawerOpen,
    activeFilterCount,
    filterButtonRef,
    onToggleFilterDrawer,
    isColumnVisibilityOpen,
    onToggleColumnVisibility,
    enableCsvExport,
    onCsvExport,
    csvFileName,
    enablePdfExport,
    onPdfExport,
    pdfFileName,
    enableRowDelete,
    showDeleteInToolbar,
    deleteButtonLabel,
    deleteDisabled,
    onDeleteRows,
    enableRowAdd,
    showAddInToolbar,
    addButtonLabel,
    onAddRow,
    onExportRequest,
    customButtons = []
}) => {
    // Split custom buttons by position
    const leftCustomButtons = customButtons.filter(
        (b) => b.buttonVisible && b.buttonPosition === "left"
    );
    const rightCustomButtons = customButtons.filter(
        (b) => b.buttonVisible && b.buttonPosition === "right"
    );

    // Check if there are any active toolbar filters or search
    const hasActiveToolbarFilters = toolbarFilters.some(
        (filter) =>
            filter.selectedValues.length > 0 && filter.selectedValues.length < filter.options.length
    );
    const hasActiveSearch = globalSearch && globalSearch.trim() !== "";
    const showResetButton = hasActiveToolbarFilters || hasActiveSearch;

    const renderButtonIcon = (icon: CustomButtonIcon) => {
        if (icon === "none") return null;
        const iconPaths: Record<string, string> = {
            plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
            edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
            trash: "M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2zm-4 2h14v2H5V6z",
            refresh:
                "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
            download:
                "M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z",
            upload: "M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6-.67l2.59 2.58L17 12.5l-5-5-5 5 1.41 1.41L11 11.33V21h2z",
            check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
            close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
            search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
            settings:
                "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
            link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
            copy: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
            save: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z",
            mail: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
            print: "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
        };
        const path = iconPaths[icon];
        if (!path) return null;
        return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={path} />
            </svg>
        );
    };

    const renderCustomButton = (btn: CustomToolbarButton, index: number) => (
        <button
            key={`custom-btn-${index}`}
            type="button"
            className={`aggrid-custom-btn aggrid-custom-btn-${btn.buttonStyle}`}
            onClick={btn.onAction}
            disabled={btn.buttonDisabled}
            title={btn.buttonLabel}
            aria-label={btn.buttonLabel}
        >
            {renderButtonIcon(btn.buttonIcon)}
            <span className="btn-text">{btn.buttonLabel}</span>
        </button>
    );

    return (
        <div className="aggrid-toolbar">
            <div className="aggrid-toolbar-left">
                {enableViewSelector && (
                    <ViewSelector
                        currentView={currentView}
                        onViewChange={onViewChange}
                        groupId={storageKey}
                        hasCardTemplate={hasCardTemplate}
                        hasListTemplate={hasListTemplate}
                    />
                )}

                {/* Toolbar multi-select filters */}
                {toolbarFilters
                    .filter((filter) => filter.options.length > 1)
                    .map((filter) => (
                        <MultiSelectFilter
                            key={filter.columnId}
                            label={filter.label}
                            options={filter.options}
                            selectedValues={filter.selectedValues}
                            onChange={(values) => onToolbarFilterChange(filter.columnId, values)}
                            enableSearch={enableToolbarFilterSearch}
                        />
                    ))}

                {/* Reset toolbar filters button */}
                {showResetButton && (
                    <button
                        type="button"
                        className="toolbar-reset-btn"
                        onClick={onResetToolbarFilters}
                        title="Clear all toolbar filters and search"
                        aria-label="Reset toolbar filters"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                        <span>Reset</span>
                    </button>
                )}

                {/* Custom left-positioned buttons */}
                {leftCustomButtons.map((btn, idx) => renderCustomButton(btn, idx))}
            </div>
            <div className="aggrid-toolbar-right">
                {showSortControls && (
                    <div className="aggrid-toolbar-sort" role="group" aria-label="Current sort">
                        {hasSortApplied ? (
                            <>
                                <label
                                    className="toolbar-label"
                                    htmlFor={`${storageKey}-toolbar-sort`}
                                >
                                    Sorted by
                                </label>
                                <select
                                    id={`${storageKey}-toolbar-sort`}
                                    className="toolbar-select"
                                    value={currentSortColumnId}
                                    onChange={onSortChange}
                                >
                                    {sortableColumns.map((col) => (
                                        <option
                                            key={col.attribute?.id || col.header?.value || ""}
                                            value={col.attribute?.id || ""}
                                        >
                                            {col.header?.value || "Field"}
                                        </option>
                                    ))}
                                </select>
                                <div
                                    className="toolbar-sort-direction"
                                    role="group"
                                    aria-label="Sort direction"
                                >
                                    <button
                                        type="button"
                                        className={`toolbar-sort-button ${
                                            currentSortDirection === "asc" ? "active" : ""
                                        }`}
                                        onClick={() => onSortDirectionChange("asc")}
                                        aria-pressed={currentSortDirection === "asc"}
                                        aria-label="Sort ascending"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M7 14l5-5 5 5z" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        className={`toolbar-sort-button ${
                                            currentSortDirection === "desc" ? "active" : ""
                                        }`}
                                        onClick={() => onSortDirectionChange("desc")}
                                        aria-pressed={currentSortDirection === "desc"}
                                        aria-label="Sort descending"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M7 10l5 5 5-5z" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="toolbar-sort-placeholder">
                                No sort applied (configure in Filters)
                            </div>
                        )}
                    </div>
                )}

                {showToolbarSearch && (
                    <div className="aggrid-toolbar-search">
                        <label className="toolbar-label" htmlFor={`${storageKey}-toolbar-search`}>
                            Contains
                        </label>
                        <div className="toolbar-search-wrapper">
                            <input
                                id={`${storageKey}-toolbar-search`}
                                type="search"
                                className="toolbar-search-input"
                                placeholder="Search..."
                                value={globalSearch}
                                onChange={onSearchChange}
                            />
                            {globalSearch && (
                                <button
                                    type="button"
                                    className="toolbar-search-clear"
                                    onClick={onClearSearch}
                                    aria-label="Clear contains search"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {enableFilterDrawer && (
                    <button
                        ref={filterButtonRef}
                        type="button"
                        className="aggrid-filter-btn"
                        onClick={onToggleFilterDrawer}
                        aria-haspopup="dialog"
                        aria-expanded={isFilterDrawerOpen}
                        title="Filters"
                        aria-label={`Filters${
                            activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""
                        }`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                        </svg>
                        {activeFilterCount > 0 && (
                            <span className="filter-badge">{activeFilterCount}</span>
                        )}
                    </button>
                )}

                {/* Custom right-positioned buttons */}
                {rightCustomButtons.map((btn, idx) => renderCustomButton(btn, idx))}

                {enableRowAdd && showAddInToolbar && (
                    <button
                        type="button"
                        className="aggrid-add-btn"
                        onClick={onAddRow}
                        disabled={!onAddRow}
                        title="Add new row"
                        aria-label="Add new row"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        <span className="btn-text">{addButtonLabel}</span>
                    </button>
                )}

                {enableRowDelete && showDeleteInToolbar && (
                    <button
                        type="button"
                        className="aggrid-delete-btn"
                        onClick={onDeleteRows}
                        disabled={deleteDisabled || !onDeleteRows}
                        title="Delete selected rows"
                        aria-label="Delete selected rows"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2zm-4 2h14v2H5V6z" />
                        </svg>
                        <span className="btn-text">{deleteButtonLabel}</span>
                    </button>
                )}

                {/* Consolidated export: if more than one export is enabled show a single Export control */}

                {/* If exactly one export is enabled, show the specific button for it */}
                {[enableCsvExport, enablePdfExport].filter(Boolean).length ===
                    1 &&
                    enableCsvExport && (
                        <button
                            type="button"
                            className="aggrid-csv-export-btn"
                            onClick={onCsvExport}
                            title="Export to CSV"
                            aria-label="Export data to CSV file"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
                            </svg>
                            <span className="btn-text">CSV</span>
                        </button>
                    )}

                {[enableCsvExport, enablePdfExport].filter(Boolean).length ===
                    1 &&
                    enablePdfExport && (
                        <button
                            type="button"
                            className="aggrid-pdf-export-btn"
                            onClick={onPdfExport}
                            title="Export to PDF"
                            aria-label="Export data to PDF file"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
                            </svg>
                            <span className="btn-text">PDF</span>
                        </button>
                    )}

                {/* Render ExportMenu after the buttons so CSS/DOM structure remains stable */}
                {[enableCsvExport, enablePdfExport].filter(Boolean).length >
                    1 && (
                    <div style={{ display: "inline-block" }}>
                        {/* Defer import to keep file small; static import used here */}
                        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
                        {React.createElement(require("./ExportMenu").default, {
                            enableCsv: enableCsvExport,
                            enablePdf: enablePdfExport,
                            csvFileName: csvFileName,
                            pdfFileName: pdfFileName,
                            defaultFormat: undefined,
                            defaultAllColumns: true,
                            onExportRequest: onExportRequest
                        })}
                    </div>
                )}

                <div style={{ position: "relative" }}>
                    <button
                        type="button"
                        className="aggrid-column-visibility-btn"
                        onClick={onToggleColumnVisibility}
                        aria-haspopup="dialog"
                        aria-expanded={isColumnVisibilityOpen}
                        title="Column Visibility"
                        aria-label="Column visibility settings"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
