import React, { useState, useEffect, useRef } from "react";
import { ColumnsType } from "../../typings/AGGridProps";

interface ColumnVisibilityPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ColumnsType[];
    columnVisibility: Record<string, boolean>;
    onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
    onResetToDefault: () => void;
}

export const ColumnVisibilityPopover: React.FC<ColumnVisibilityPopoverProps> = ({
    isOpen,
    onClose,
    columns,
    columnVisibility,
    onColumnVisibilityChange,
    onResetToDefault
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const popoverRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus management when popover opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            // Focus the search input when popover opens
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close on Escape key and handle tab navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            // Tab trapping within the popover
            if (event.key === "Tab" && popoverRef.current) {
                const focusableElements = popoverRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Filter columns based on search term
    const filteredColumns = columns.filter((col) => {
        const headerText = col.header?.value || "";
        return headerText.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Get visibility state for a column
    const getColumnVisibility = (columnId: string): boolean => {
        return columnVisibility[columnId] !== false; // Default to true if not set
    };

    // Handle select all/none
    const handleSelectAll = () => {
        filteredColumns.forEach((col) => {
            const columnId = col.attribute?.id;
            if (columnId && !getColumnVisibility(columnId)) {
                onColumnVisibilityChange(columnId, true);
            }
        });
    };

    const handleSelectNone = () => {
        filteredColumns.forEach((col) => {
            const columnId = col.attribute?.id;
            if (columnId && getColumnVisibility(columnId)) {
                onColumnVisibilityChange(columnId, false);
            }
        });
    };

    // Check if all/none are selected
    const allSelected = filteredColumns.every((col) => {
        const columnId = col.attribute?.id;
        return columnId ? getColumnVisibility(columnId) : true;
    });

    const noneSelected = filteredColumns.every((col) => {
        const columnId = col.attribute?.id;
        return columnId ? !getColumnVisibility(columnId) : false;
    });

    return (
        <div
            className="column-visibility-popover"
            ref={popoverRef}
            role="dialog"
            aria-label="Column Visibility"
        >
            <div className="column-visibility-header">
                <h4>Column Visibility</h4>
                <button
                    type="button"
                    className="close-button"
                    onClick={onClose}
                    aria-label="Close column visibility"
                >
                    ×
                </button>
            </div>

            {/* Search input */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px"
                    }}
                    aria-label="Search columns"
                />
            </div>

            {/* Select All/None controls */}
            <div
                style={{
                    padding: "8px 16px",
                    borderBottom: "1px solid #e5e7eb",
                    background: "#f9fafb"
                }}
            >
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        disabled={allSelected}
                        style={{
                            padding: "4px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            background: allSelected ? "#e5e7eb" : "#ffffff",
                            cursor: allSelected ? "not-allowed" : "pointer",
                            fontSize: "12px"
                        }}
                        aria-label="Select all visible columns"
                    >
                        Select All
                    </button>
                    <button
                        type="button"
                        onClick={handleSelectNone}
                        disabled={noneSelected}
                        style={{
                            padding: "4px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            background: noneSelected ? "#e5e7eb" : "#ffffff",
                            cursor: noneSelected ? "not-allowed" : "pointer",
                            fontSize: "12px"
                        }}
                        aria-label="Deselect all visible columns"
                    >
                        Select None
                    </button>
                </div>
            </div>

            {/* Column list */}
            <div
                className="column-visibility-content"
                aria-live="polite"
                aria-label="Column visibility options"
            >
                {filteredColumns.length === 0 ? (
                    <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>
                        No columns found
                    </div>
                ) : (
                    filteredColumns.map((col) => {
                        const columnId = col.attribute?.id;
                        const headerText = col.header?.value || "Unnamed Column";
                        const isVisible = columnId ? getColumnVisibility(columnId) : true;

                        return (
                            <div key={columnId || headerText} className="column-visibility-item">
                                <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={(e) => {
                                        if (columnId) {
                                            onColumnVisibilityChange(columnId, e.target.checked);
                                        }
                                    }}
                                    aria-label={`Toggle visibility of ${headerText} column`}
                                    aria-describedby={`column-description-${
                                        columnId || headerText.replace(/\s+/g, "-")
                                    }`}
                                />
                                <span
                                    className="column-label"
                                    title={headerText}
                                    id={`column-description-${
                                        columnId || headerText.replace(/\s+/g, "-")
                                    }`}
                                >
                                    {headerText}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer with reset button */}
            <div className="filter-drawer-footer-secondary">
                <button
                    type="button"
                    className="reset-settings-btn"
                    onClick={onResetToDefault}
                    aria-label="Reset column visibility to default settings"
                >
                    Reset to Default
                </button>
            </div>
        </div>
    );
};
