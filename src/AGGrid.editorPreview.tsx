import { ReactElement } from "react";
import { AGGridPreviewProps } from "../typings/AGGridProps";
import { evaluateTemplate } from "./utils/renderers";
import { ValueStatus } from "mendix";
import { validateSortConfiguration } from "./utils/data";

export function preview(props: AGGridPreviewProps): ReactElement {
    const {
        columns,
        pagination,
        pageSize,
        height,
        theme,
        rowModelType,
        rowBuffer,
        suppressRowVirtualisation,
        cacheBlockSize,
        maxBlocksInCache,
        maxConcurrentRequests,
        rowClassRules,
        enableViewSelector,
        enableFilterDrawer,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enableColumnMenus,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enableHeaderFilterButtons,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enableFloatingFilters,
        customCardTemplate,
        customListTemplate,
        customFormatters,
        enablePolling,
        pollingInterval,
        enableNotifications
    } = props;

    const themeClass = `ag-theme-${theme}`;

    // Check if templates are available
    const hasCardTemplate = !!(customCardTemplate && customCardTemplate.trim());
    const hasListTemplate = !!(customListTemplate && customListTemplate.trim());
    const showViewSelector = enableViewSelector && (hasCardTemplate || hasListTemplate);

    // Check for filter configurations
    const filterableColumns = (columns || []).filter(
        (col) => col.filter && col.filterLocation === "drawer"
    );
    const toolbarFilters = (columns || []).filter(
        (col) => col.filter && col.filterLocation === "toolbar"
    );
    const hasDrawerFilters = enableFilterDrawer && filterableColumns.length > 0;
    const hasToolbarFilters = toolbarFilters.length > 0;

    // Validate custom formatter references in columns
    const formatterNames: string[] = [];
    (customFormatters || []).forEach((formatter) => {
        const name = ((formatter && formatter.formatterName) || "").trim();
        if (name && formatterNames.indexOf(name) === -1) {
            formatterNames.push(name);
        }
    });

    // Debug logging
    console.log("EditorPreview - Available formatters:", formatterNames);
    console.log(
        "EditorPreview - Columns:",
        (columns || []).map((c) => ({
            header: c.header,
            customFormatterName: c.customFormatterName,
            hasValue: !!c.customFormatterName && c.customFormatterName.trim().length > 0
        }))
    );

    const columnsWithInvalidFormatters = (columns || []).filter((col) => {
        const name = (col.customFormatterName || "").trim();
        return name && formatterNames.indexOf(name) === -1;
    });
    console.log(
        "EditorPreview - Columns with invalid formatters:",
        columnsWithInvalidFormatters.map((c) => ({
            header: c.header,
            customFormatterName: c.customFormatterName
        }))
    );

    const hasFormatterErrors = columnsWithInvalidFormatters.length > 0;

    // Virtual scrolling hints
    const showVirtualScrollingWarning = Boolean(suppressRowVirtualisation);
    const showRowBufferHint = typeof rowBuffer === "number" && rowBuffer > 30;
    const showServerSideCacheHint =
        rowModelType === "serverSide" &&
        (typeof cacheBlockSize === "number" || typeof maxBlocksInCache === "number");
    const showRowClassRulesHint = Boolean(rowClassRules && rowClassRules.trim());
    let rowClassRulesError: string | null = null;
    if (showRowClassRulesHint) {
        try {
            const parsed = JSON.parse(rowClassRules as string);
            if (
                !(
                    (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ||
                    Array.isArray(parsed)
                )
            ) {
                rowClassRulesError = "Row Class Rules JSON must be an object or array.";
            }
        } catch (e: any) {
            rowClassRulesError = e?.message
                ? `Row Class Rules JSON error: ${e.message}`
                : "Row Class Rules JSON is invalid.";
        }
    }

    // Validate sort configuration
    const sortValidation = validateSortConfiguration(columns || []);

    // Prepare preview columns for template rendering
    const previewColumns = (columns || []).map((c: any) => ({
        header: c.header,
        attribute: {
            id: c.attribute,
            get: (_: any) => ({ status: ValueStatus.Available, value: `Sample ${c.attribute}` })
        }
    }));

    return (
        <div className="aggrid-preview-container" style={{ padding: "10px" }}>
            {/* Sort Configuration Validation - TOP PRIORITY */}
            {!sortValidation.valid && (
                <div
                    style={{
                        marginBottom: "10px",
                        padding: "12px 16px",
                        backgroundColor: "#ffebee",
                        border: "2px solid #d32f2f",
                        borderRadius: "4px",
                        fontSize: "13px",
                        color: "#c62828"
                    }}
                >
                    <strong>🚫 Sort Configuration Error:</strong>
                    <p style={{ margin: "8px 0 0 0" }}>{sortValidation.error}</p>
                </div>
            )}

            {/* Custom Formatter Validation - MOVED TO TOP FOR VISIBILITY */}
            {hasFormatterErrors && (
                <div
                    style={{
                        marginBottom: "10px",
                        padding: "12px 16px",
                        backgroundColor: "#ffebee",
                        border: "2px solid #ef5350",
                        borderRadius: "4px",
                        fontSize: "13px",
                        color: "#c62828"
                    }}
                >
                    <strong>⚠️ Custom Formatter Errors:</strong>
                    <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                        {columnsWithInvalidFormatters.map((col, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>
                                Column <strong>&quot;{col.header || "Unknown"}&quot;</strong>{" "}
                                references formatter{" "}
                                <strong>&quot;{col.customFormatterName}&quot;</strong> which does
                                not exist
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: "8px", fontStyle: "italic", fontSize: "12px" }}>
                        💡 Tip: Check the &quot;Custom Formatters&quot; tab. Available formatters:{" "}
                        {formatterNames.length > 0
                            ? formatterNames.join(", ")
                            : "(none configured)"}
                    </div>
                </div>
            )}

            {/* Virtual Scrolling Hints */}
            {(showVirtualScrollingWarning || showRowBufferHint || showServerSideCacheHint) && (
                <div
                    style={{
                        marginBottom: "10px",
                        padding: "12px 16px",
                        backgroundColor: "#fff8e1",
                        border: "1px solid #f9a825",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#6d4c41"
                    }}
                >
                    <strong>⚡ Virtual Scrolling Tips:</strong>
                    <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                        {showVirtualScrollingWarning && (
                            <li>
                                Row virtualisation is disabled. This renders all rows in the DOM and
                                is only recommended for small datasets or print layouts.
                            </li>
                        )}
                        {showRowBufferHint && (
                            <li>
                                Row Buffer is set to {rowBuffer}. Higher values improve fast
                                scrolling but increase DOM size and memory usage.
                            </li>
                        )}
                        {showServerSideCacheHint && (
                            <li>
                                Server-side cache: block size {cacheBlockSize || 100}, max blocks{" "}
                                {maxBlocksInCache || 0}, concurrent requests {maxConcurrentRequests || 2}.
                                Tune these to balance server load vs. scroll smoothness.
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {showRowClassRulesHint && (
                <div
                    style={{
                        marginBottom: "10px",
                        padding: "12px 16px",
                        backgroundColor: rowClassRulesError ? "#ffebee" : "#e3f2fd",
                        border: rowClassRulesError ? "1px solid #ef5350" : "1px solid #64b5f6",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: rowClassRulesError ? "#c62828" : "#1e3a5f"
                    }}
                >
                    <strong>{rowClassRulesError ? "⚠️ Row Class Rules Error:" : "🎯 Row Class Rules:"}</strong>
                    {rowClassRulesError ? (
                        <div style={{ marginTop: "6px" }}>{rowClassRulesError}</div>
                    ) : (
                        <div style={{ marginTop: "6px" }}>
                            Rules are enabled. Each rule that evaluates to true adds its class name.
                            Use JSON object or array format as documented in <code>ROW_CLASS_GUIDE.md</code>.
                        </div>
                    )}
                </div>
            )}

            {/* Toolbar */}
            {(showViewSelector || hasDrawerFilters || hasToolbarFilters) && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        background: "#f5f5f5",
                        borderBottom: "1px solid #ddd",
                        gap: "12px",
                        marginBottom: "1px",
                        flexWrap: "wrap"
                    }}
                >
                    {/* Left side: View Selector */}
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

                    {/* Center/Right side: Filters */}
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexWrap: "wrap"
                        }}
                    >
                        {/* Toolbar Filters */}
                        {hasToolbarFilters && (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {toolbarFilters.map((col, idx) => (
                                    <div
                                        key={idx}
                                        className="toolbar-filter"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "6px 10px",
                                            border: "1px solid #ddd",
                                            background: "white",
                                            borderRadius: "4px",
                                            fontSize: "13px",
                                            color: "#666",
                                            transition: "border-color 0.2s ease"
                                        }}
                                        title={`Toolbar filter for ${col.header || col.attribute}`}
                                    >
                                        <i
                                            className="fas fa-filter"
                                            style={{ fontSize: "12px" }}
                                        ></i>
                                        <span>{col.header || col.attribute}</span>
                                        <select
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                color: "#666",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}
                                            disabled
                                        >
                                            <option>All values</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Filter Drawer Button */}
                        {hasDrawerFilters && (
                            <div
                                style={{
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    background: "white",
                                    borderRadius: "6px",
                                    color: "#666",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "13px"
                                }}
                                title={`Filter drawer with ${
                                    filterableColumns.length
                                } filterable column${
                                    filterableColumns.length === 1 ? "" : "s"
                                }: ${filterableColumns
                                    .map((c) => c.header || c.attribute)
                                    .join(", ")}`}
                            >
                                <i className="fas fa-sliders-h"></i>
                                Filters ({filterableColumns.length})
                            </div>
                        )}
                    </div>
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

            {/* Card Template Preview */}
            {hasCardTemplate && (
                <div
                    style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        backgroundColor: "#f3e5f5",
                        border: "1px solid #ba68c8",
                        borderRadius: "4px",
                        fontSize: "12px"
                    }}
                >
                    <strong style={{ color: "#6a1b9a" }}>Card Template Preview:</strong>
                    <div
                        style={{
                            marginTop: "8px",
                            padding: "8px",
                            backgroundColor: "#fff",
                            border: "1px solid #e1bee7",
                            borderRadius: "4px"
                        }}
                    >
                        {(() => {
                            try {
                                const html = evaluateTemplate(
                                    customCardTemplate || "",
                                    {},
                                    previewColumns as any
                                );
                                return <div dangerouslySetInnerHTML={{ __html: html }} />;
                            } catch (e) {
                                return (
                                    <div style={{ color: "#c62828", fontStyle: "italic" }}>
                                        ⚠️ Invalid template syntax
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            )}

            {/* List Template Preview */}
            {hasListTemplate && (
                <div
                    style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        backgroundColor: "#e8f5e9",
                        border: "1px solid #81c784",
                        borderRadius: "4px",
                        fontSize: "12px"
                    }}
                >
                    <strong style={{ color: "#2e7d32" }}>List Template Preview:</strong>
                    <div
                        style={{
                            marginTop: "8px",
                            padding: "8px",
                            backgroundColor: "#fff",
                            border: "1px solid #c8e6c9",
                            borderRadius: "4px"
                        }}
                    >
                        {(() => {
                            try {
                                const html = evaluateTemplate(
                                    customListTemplate || "",
                                    {},
                                    previewColumns as any
                                );
                                return <div dangerouslySetInnerHTML={{ __html: html }} />;
                            } catch (e) {
                                return (
                                    <div style={{ color: "#c62828", fontStyle: "italic" }}>
                                        ⚠️ Invalid template syntax
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            )}

            {/* Filter Configuration Status */}
            {(hasDrawerFilters || hasToolbarFilters || enableFilterDrawer) && (
                <div
                    style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        backgroundColor:
                            hasDrawerFilters || hasToolbarFilters ? "#e8f5e9" : "#fff3e0",
                        border: `1px solid ${
                            hasDrawerFilters || hasToolbarFilters ? "#81c784" : "#ffb74d"
                        }`,
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: hasDrawerFilters || hasToolbarFilters ? "#2e7d32" : "#e65100"
                    }}
                >
                    <strong>Filter Configuration Status:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                        <li>
                            <strong>Filter Drawer:</strong>{" "}
                            {hasDrawerFilters
                                ? `✓ Available (${filterableColumns.length} column${
                                      filterableColumns.length === 1 ? "" : "s"
                                  })`
                                : enableFilterDrawer
                                ? "⚠ Enabled but no columns configured for drawer"
                                : "✗ Disabled"}
                        </li>
                        <li>
                            <strong>Toolbar Filters:</strong>{" "}
                            {hasToolbarFilters
                                ? `✓ ${toolbarFilters.length} column${
                                      toolbarFilters.length === 1 ? "" : "s"
                                  } configured`
                                : "✗ No columns configured for toolbar"}
                        </li>
                    </ul>
                    {hasDrawerFilters && (
                        <div style={{ marginTop: "8px", fontStyle: "italic" }}>
                            💡 Drawer columns:{" "}
                            {filterableColumns.map((c) => c.header || c.attribute).join(", ")}
                        </div>
                    )}
                    {hasToolbarFilters && (
                        <div style={{ marginTop: "8px", fontStyle: "italic" }}>
                            💡 Toolbar columns:{" "}
                            {toolbarFilters.map((c) => c.header || c.attribute).join(", ")}
                        </div>
                    )}
                    {enableFilterDrawer && !hasDrawerFilters && !hasToolbarFilters && (
                        <div style={{ marginTop: "8px", fontStyle: "italic" }}>
                            💡 Tip: Set column &quot;Filter Location&quot; to &quot;Filter
                            Drawer&quot; or &quot;Toolbar&quot; to enable filtering
                        </div>
                    )}
                </div>
            )}

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

            {/* Polling & Notifications Status */}
            {(enablePolling || enableNotifications) && (
                <div
                    style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#f3e5f5",
                        border: "1px solid #ba68c8",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#6a1b9a"
                    }}
                >
                    <strong>Real-time Data Updates:</strong>
                    <div
                        style={{
                            marginTop: "6px",
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <i
                                className="fas fa-sync-alt"
                                style={{
                                    fontSize: "14px",
                                    color: enablePolling ? "#7b1fa2" : "#999"
                                }}
                            ></i>
                            <strong>Polling:</strong>
                            <span style={{ color: enablePolling ? "#7b1fa2" : "#999" }}>
                                {enablePolling ? (
                                    <>
                                        ✓ ON (every{" "}
                                        {pollingInterval ? `${pollingInterval / 1000}s` : "5s"})
                                    </>
                                ) : (
                                    "✗ OFF"
                                )}
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <i
                                className="fas fa-bell"
                                style={{
                                    fontSize: "14px",
                                    color: enableNotifications ? "#7b1fa2" : "#999"
                                }}
                            ></i>
                            <strong>Notifications:</strong>
                            <span style={{ color: enableNotifications ? "#7b1fa2" : "#999" }}>
                                {enableNotifications ? "✓ ON" : "✗ OFF"}
                            </span>
                        </div>
                    </div>
                    {enablePolling && !enableNotifications && (
                        <div
                            style={{
                                marginTop: "8px",
                                fontStyle: "italic",
                                fontSize: "11px",
                                color: "#6a1b9a"
                            }}
                        >
                            💡 Tip: Enable &quot;Notifications&quot; to show toast alerts when new
                            data is detected
                        </div>
                    )}
                    {!enablePolling && enableNotifications && (
                        <div
                            style={{
                                marginTop: "8px",
                                fontStyle: "italic",
                                fontSize: "11px",
                                color: "#ff6f00"
                            }}
                        >
                            ⚠️ Warning: Notifications require polling to be enabled
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function getPreviewCss(): string {
    return `
       
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
        
        .aggrid-preview .toolbar-filter select:focus {
            outline: none;
        }
        
        .aggrid-preview .toolbar-filter:hover {
            border-color: #1976d2;
        }
        
        .aggrid-preview .fa-filter {
            color: #1976d2;
        }
        
        .aggrid-preview .fa-sliders-h {
            color: #1976d2;
        }
        
        .aggrid-preview-container .fa-sync-alt,
        .aggrid-preview-container .fa-bell {
            transition: transform 0.2s ease;
        }
        
        .aggrid-preview-container .fa-sync-alt:hover {
            transform: rotate(180deg);
        }
        
        .aggrid-preview-container .fa-bell:hover {
            transform: scale(1.1);
        }
    `;
}
