import React, { ChangeEvent, RefObject } from "react";
import { ViewSelector } from "./ViewSelector";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { ColumnsType } from "../../typings/AGGridProps";

type ViewMode = "grid" | "cards" | "list" | "harden";

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
    onToggleColumnVisibility
}) => {
    // Check if there are any active toolbar filters or search
    const hasActiveToolbarFilters = toolbarFilters.some(
        (filter) =>
            filter.selectedValues.length > 0 && filter.selectedValues.length < filter.options.length
    );
    const hasActiveSearch = globalSearch && globalSearch.trim() !== "";
    const showResetButton = hasActiveToolbarFilters || hasActiveSearch;

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
                                    {sortableColumns.map((col, idx) => (
                                        <option key={idx} value={col.attribute?.id || ""}>
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
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                        </svg>
                        {activeFilterCount > 0 && (
                            <span className="filter-badge">{activeFilterCount}</span>
                        )}
                    </button>
                )}

                <button
                    type="button"
                    className="aggrid-column-visibility-btn"
                    onClick={onToggleColumnVisibility}
                    aria-haspopup="dialog"
                    aria-expanded={isColumnVisibilityOpen}
                    title="Column Visibility"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
