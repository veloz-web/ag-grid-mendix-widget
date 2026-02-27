import { ReactElement, useEffect, useRef } from "react";
import { ColumnsType } from "../../typings/AGGridProps";

interface HiddenDrawerProps {
    isOpen: boolean;
    columns: ColumnsType[];
    columnVisibility: Record<string, boolean>;
    onClose: () => void;
    onToggleColumn: (columnId: string, visible: boolean) => void;
    onResetToDefault?: () => void;
}

export function HiddenDrawer(props: HiddenDrawerProps): ReactElement | null {
    const { isOpen, columns, columnVisibility, onClose, onToggleColumn } = props;

    const drawerRef = useRef<HTMLDivElement>(null);

    // Focus management
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            drawerRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const visibleColumns = columns.filter((col) => col.attribute?.id);
    const visibleCount = visibleColumns.filter(
        (col) => columnVisibility[col.attribute!.id] !== false
    ).length;
    const totalCount = visibleColumns.length;

    return (
        <div className="aggrid-filter-drawer">
            <div className="filter-drawer-overlay" onClick={onClose} aria-hidden="true" />
            <div
                ref={drawerRef}
                className="filter-drawer-content"
                role="dialog"
                aria-modal="true"
                aria-label={`Column Visibility - ${visibleCount} of ${totalCount} columns visible`}
                tabIndex={-1}
            >
                <div className="filter-drawer-header">
                    <h3>Column Visibility</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close column visibility panel"
                        type="button"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
                <div className="filter-drawer-body">
                    <div className="filter-section">
                        <h4 className="filter-section-title">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                style={{ marginRight: "8px", verticalAlign: "middle" }}
                                aria-hidden="true"
                            >
                                <path d="M3 17V19h6v-2H3zM3 5h8v2H3V5zm10 0v2h8V5h-8zM3 9h8v2H3V9zm10 0h8v2h-8V9zM3 13h8v2H3v-2z" />
                            </svg>
                            Show/Hide Columns
                        </h4>
                        <div
                            className="column-visibility-content"
                            role="group"
                            aria-label="Column visibility options"
                        >
                            {/* Search bar */}
                            <div style={{ padding: "8px 0" }}>
                                <input
                                    aria-label="Search columns"
                                    placeholder="Search columns..."
                                    type="text"
                                    style={{ width: "100%", padding: "6px 8px" }}
                                />
                            </div>
                            {visibleColumns.map((col) => {
                                const columnId = col.attribute!.id;
                                const isVisible = columnVisibility[columnId] !== false;
                                const columnName = col.header?.value || columnId;

                                return (
                                    <label
                                        key={columnId}
                                        className="column-visibility-item"
                                        htmlFor={`column-${columnId}`}
                                    >
                                        <input
                                            id={`column-${columnId}`}
                                            type="checkbox"
                                            checked={isVisible}
                                            onChange={(e) =>
                                                onToggleColumn(columnId, e.target.checked)
                                            }
                                            aria-describedby={`column-desc-${columnId}`}
                                        />
                                        <span
                                            className="column-label"
                                            id={`column-desc-${columnId}`}
                                        >
                                            {columnName}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {visibleColumns.length === 0 && (
                            <p
                                className="no-columns-message"
                                style={{ padding: "16px", color: "#6b7280", fontStyle: "italic" }}
                            >
                                No columns available for visibility control.
                            </p>
                        )}

                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button
                                type="button"
                                aria-label="Select all visible columns"
                                onClick={() =>
                                    visibleColumns.forEach((col) => {
                                        const columnId = col.attribute?.id;
                                        if (columnId) onToggleColumn(columnId, true);
                                    })
                                }
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                aria-label="Deselect all visible columns"
                                onClick={() =>
                                    visibleColumns.forEach((col) => {
                                        const columnId = col.attribute?.id;
                                        if (columnId) onToggleColumn(columnId, false);
                                    })
                                }
                            >
                                Select None
                            </button>
                        </div>
                    </div>
                </div>
                <div className="filter-drawer-footer">
                    <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>
                        {visibleCount} of {totalCount} columns visible
                    </div>
                    <button className="apply-filters-btn" onClick={onClose} type="button">
                        Done
                    </button>
                    {typeof props.onResetToDefault === "function" && (
                        <button
                            className="reset-settings-btn"
                            onClick={props.onResetToDefault}
                            aria-label="Reset column visibility to default settings"
                            type="button"
                            style={{ marginLeft: 12 }}
                        >
                            Reset to Default
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
