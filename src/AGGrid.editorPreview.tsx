import { ReactElement } from "react";
import { AGGridPreviewProps } from "../typings/AGGridProps";

export function preview(props: AGGridPreviewProps): ReactElement {
    const {
        columns,
        pagination,
        pageSize,
        height,
        theme,
        enableViewSelector,
        enableFilterDrawer,
        customCardTemplate,
        customListTemplate
    } = props;

    const themeClass = `ag-theme-${theme}`;

    // Check if templates are available
    const hasCardTemplate = !!(customCardTemplate && customCardTemplate.trim());
    const hasListTemplate = !!(customListTemplate && customListTemplate.trim());
    const showViewSelector = enableViewSelector && (hasCardTemplate || hasListTemplate);

    return (
        <div className="aggrid-preview-container" style={{ padding: "10px" }}>
            {/* Toolbar */}
            {(showViewSelector || enableFilterDrawer) && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        background: "#f5f5f5",
                        borderBottom: "1px solid #ddd",
                        gap: "12px",
                        marginBottom: "1px"
                    }}
                >
                    {showViewSelector && (
                        <div
                            style={{
                                display: "flex",
                                gap: "4px",
                                background: "white",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                                padding: "4px"
                            }}
                        >
                            {hasCardTemplate && (
                                <div
                                    style={{
                                        padding: "8px 12px",
                                        color: "#666",
                                        borderRadius: "4px",
                                        border: "1px solid transparent"
                                    }}
                                    title="Cards view available (custom template configured)"
                                >
                                    <i className="fas fa-grid"></i> Cards
                                </div>
                            )}
                            {hasListTemplate && (
                                <div
                                    style={{
                                        padding: "8px 12px",
                                        color: "#666",
                                        borderRadius: "4px",
                                        border: "1px solid transparent"
                                    }}
                                    title="List view available (custom template configured)"
                                >
                                    <i className="fas fa-list"></i> List
                                </div>
                            )}
                            <div
                                style={{
                                    padding: "8px 12px",
                                    background: "#1976d2",
                                    color: "white",
                                    borderRadius: "4px"
                                }}
                                title="Grid view (default - always available)"
                            >
                                <i className="fas fa-table"></i> Grid
                            </div>
                        </div>
                    )}
                    {enableFilterDrawer && (
                        <div
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #ddd",
                                background: "white",
                                borderRadius: "6px",
                                color: "#666"
                            }}
                        >
                            Filters
                        </div>
                    )}
                </div>
            )}
            <div
                className={`aggrid-preview ${themeClass}`}
                style={{
                    height: `${height || 500}px`,
                    width: "100%",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    overflow: "hidden",
                    backgroundColor: "#fff"
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: "2px solid #ddd",
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                        fontSize: "14px"
                    }}
                >
                    {columns && columns.length > 0 ? (
                        columns.map((col, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: "12px",
                                    borderRight:
                                        idx < columns.length - 1 ? "1px solid #ddd" : "none",
                                    flex: col.width ? `0 0 ${col.width}px` : "1",
                                    minWidth: col.width || 150
                                }}
                            >
                                {col.header || `Column ${idx + 1}`}
                            </div>
                        ))
                    ) : (
                        <div
                            style={{
                                padding: "12px",
                                flex: "1",
                                textAlign: "center",
                                color: "#999"
                            }}
                        >
                            No columns configured
                        </div>
                    )}
                </div>

                {/* Sample Data Rows */}
                {columns && columns.length > 0 && (
                    <>
                        {[1, 2, 3].map((rowIdx) => (
                            <div
                                key={rowIdx}
                                style={{
                                    display: "flex",
                                    borderBottom: "1px solid #eee",
                                    fontSize: "13px"
                                }}
                            >
                                {columns.map((col, colIdx) => (
                                    <div
                                        key={colIdx}
                                        style={{
                                            padding: "10px 12px",
                                            borderRight:
                                                colIdx < columns.length - 1
                                                    ? "1px solid #eee"
                                                    : "none",
                                            flex: col.width ? `0 0 ${col.width}px` : "1",
                                            minWidth: col.width || 150,
                                            color: "#666"
                                        }}
                                    >
                                        {col.formatter === "link" ? (
                                            <i
                                                className="fas fa-eye"
                                                style={{ color: "#1976d2", cursor: "pointer" }}
                                            ></i>
                                        ) : (
                                            `Sample data ${rowIdx}`
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </>
                )}

                {/* Footer with pagination info */}
                {pagination && columns && columns.length > 0 && (
                    <div
                        style={{
                            padding: "12px",
                            borderTop: "1px solid #ddd",
                            fontSize: "13px",
                            color: "#666",
                            backgroundColor: "#fafafa",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <span>Page 1 of 1</span>
                        <span>Page size: {pageSize || 20}</span>
                    </div>
                )}
            </div>

            {/* Info banner */}
            <div
                style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #90caf9",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#1976d2"
                }}
            >
                <strong>Preview Mode:</strong> This is a mockup of the AG Grid. Run your app to see
                the actual grid with real data.
            </div>

            {/* Template status info */}
            {enableViewSelector && (
                <div
                    style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        backgroundColor: hasCardTemplate || hasListTemplate ? "#e8f5e9" : "#fff3e0",
                        border: `1px solid ${
                            hasCardTemplate || hasListTemplate ? "#81c784" : "#ffb74d"
                        }`,
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: hasCardTemplate || hasListTemplate ? "#2e7d32" : "#e65100"
                    }}
                >
                    <strong>View Selector Status:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                        <li>
                            <strong>Grid View:</strong> ✓ Always available
                        </li>
                        <li>
                            <strong>Cards View:</strong>{" "}
                            {hasCardTemplate
                                ? "✓ Available (custom template configured)"
                                : "✗ Hidden (no custom template)"}
                        </li>
                        <li>
                            <strong>List View:</strong>{" "}
                            {hasListTemplate
                                ? "✓ Available (custom template configured)"
                                : "✗ Hidden (no custom template)"}
                        </li>
                    </ul>
                    {!hasCardTemplate && !hasListTemplate && (
                        <div style={{ marginTop: "8px", fontStyle: "italic" }}>
                            💡 Tip: Add HTML templates in the &quot;View Options&quot; tab to enable
                            Cards/List views
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function getPreviewCss(): string {
    return `
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
        
        .aggrid-preview-container {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Arial, sans-serif;
        }
        
        .aggrid-preview {
            display: flex;
            flex-direction: column;
        }
        
        .aggrid-preview .fa-eye {
            font-size: 16px;
            color: #1976d2;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        
        .aggrid-preview .fa-eye:hover {
            color: #1565c0;
        }
    `;
}
