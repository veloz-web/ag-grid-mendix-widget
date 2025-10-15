import { ReactElement } from "react";
import { ColumnsType } from "../../typings/AGGridProps";

interface HiddenDrawerProps {
    isOpen: boolean;
    columns: ColumnsType[];
    columnVisibility: Record<string, boolean>;
    onClose: () => void;
    onToggleColumn: (columnId: string, visible: boolean) => void;
}

export function HiddenDrawer(props: HiddenDrawerProps): ReactElement | null {
    const { isOpen, columns, columnVisibility, onClose, onToggleColumn } = props;

    if (!isOpen) return null;

    return (
        <div className="aggrid-filter-drawer">
            <div className="filter-drawer-overlay" onClick={onClose}></div>
            <div
                className="filter-drawer-content"
                role="dialog"
                aria-modal="true"
                aria-label="Column Visibility"
            >
                <div className="filter-drawer-header">
                    <h3>Column Visibility</h3>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
                            >
                                <path d="M3 17V19h6v-2H3zM3 5h8v2H3V5zm10 0v2h8V5h-8zM3 9h8v2H3V9zm10 0h8v2h-8V9zM3 13h8v2H3v-2z" />
                            </svg>
                            Show/Hide Columns
                        </h4>
                        <div className="column-visibility-content">
                            {columns
                                .filter((col) => col.attribute?.id)
                                .map((col) => {
                                    const columnId = col.attribute!.id;
                                    const isVisible = columnVisibility[columnId] !== false;
                                    return (
                                        <label key={columnId} className="column-visibility-item">
                                            <input
                                                type="checkbox"
                                                checked={isVisible}
                                                onChange={(e) =>
                                                    onToggleColumn(columnId, e.target.checked)
                                                }
                                            />
                                            <span className="column-label">
                                                {col.header?.value || columnId}
                                            </span>
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                </div>
                <div className="filter-drawer-footer">
                    <button className="apply-filters-btn" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
