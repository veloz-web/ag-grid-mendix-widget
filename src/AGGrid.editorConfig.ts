import { Properties, Problem } from "@mendix/pluggable-widgets-tools";
import { hidePropertiesIn } from "@mendix/pluggable-widgets-tools/dist/utils/PageEditorUtils";
import { AGGridPreviewProps } from "../typings/AGGridProps";

export function getProperties(
    values: AGGridPreviewProps,
    defaultProperties: Properties
): Properties {
    // Hide version/build info from the properties panel — shown in design preview only
    hidePropertiesIn(defaultProperties, values, [
        "agGridVersion",
        "agGridVersionDate",
        "widgetBuildDate",
        "widgetBuildCommit"
    ]);
    return defaultProperties;
}

export function getPreview(values: AGGridPreviewProps): any {
    // `columns` is defined in AGGrid.xml but omitted from AGGridPreviewProps by the
    // Mendix code-gen tool; cast once here so the rest of the function stays typed.
    const columns: Array<{ header?: string }> = (values as any).columns ?? [];
    const versionLabel = values.agGridVersion ? `AG Grid v${values.agGridVersion}` : "AG Grid";
    const dateLabel = values.agGridVersionDate ? ` · synced ${values.agGridVersionDate}` : "";
    const buildLabel = values.widgetBuildDate
        ? `Built ${values.widgetBuildDate}${
              values.widgetBuildCommit ? ` · ${values.widgetBuildCommit}` : ""
          }`
        : "";

    const children: any[] = [
        {
            type: "Container",
            children: [
                {
                    type: "Text",
                    content: `${versionLabel}${dateLabel}`,
                    fontColor: "#555",
                    fontSize: 14
                },
                buildLabel && {
                    type: "Text",
                    content: buildLabel,
                    fontColor: "#999",
                    fontSize: 11
                },
                {
                    type: "Text",
                    content: `${columns.length} column(s) configured`,
                    fontColor: "#888",
                    fontSize: 12
                }
            ].filter(Boolean)
        }
    ];

    // Show polling configuration if enabled
    if (values.enablePolling) {
        const intervalSeconds = values.pollingInterval || 60;
        const actualInterval = Math.max(intervalSeconds, 10); // Enforce 10 second minimum

        children.push({
            type: "Container",
            children: [
                {
                    type: "Text",
                    content: `⏱ Polling: Every ${actualInterval} seconds`,
                    fontColor: values.enableNotifications ? "#28a745" : "#888",
                    fontSize: 11
                },
                values.enableNotifications && {
                    type: "Text",
                    content: "🔔 Notifications enabled",
                    fontColor: "#28a745",
                    fontSize: 11
                }
            ].filter(Boolean)
        });
    }

    // Virtual scrolling configuration hints
    if (values.suppressRowVirtualisation) {
        children.push({
            type: "Container",
            children: [
                {
                    type: "Text",
                    content:
                        "⚠️ Virtual scrolling disabled (all rows render in DOM). Use only for small datasets.",
                    fontColor: "#b85c00",
                    fontSize: 11
                }
            ]
        });
    }

    if (values.rowBuffer && values.rowBuffer > 30) {
        children.push({
            type: "Container",
            children: [
                {
                    type: "Text",
                    content: `ℹ️ Row Buffer set to ${values.rowBuffer}. Higher values improve scrolling but use more memory.`,
                    fontColor: "#6d4c41",
                    fontSize: 11
                }
            ]
        });
    }

    if ((values as any).rowModelType === "serverSide") {
        const blockSize = (values as any).cacheBlockSize || 100;
        const maxBlocks = (values as any).maxBlocksInCache || 0;
        const maxRequests = (values as any).maxConcurrentRequests || 2;
        children.push({
            type: "Container",
            children: [
                {
                    type: "Text",
                    content: `🧱 Server cache: block ${blockSize}, max blocks ${maxBlocks}, concurrent ${maxRequests}`,
                    fontColor: "#555",
                    fontSize: 11
                }
            ]
        });
    }

    children.push({
        type: "Container",
        children: columns.map((col, index) => ({
            type: "Text",
            content: `Column ${index + 1}: ${col.header || "Unnamed"}`,
            fontColor: "#666",
            fontSize: 11
        }))
    });

    return {
        type: "Container",
        borders: true,
        children
    };
}

export function validate(values: AGGridPreviewProps): Problem[] {
    const errors: Problem[] = [];

    // Validate DOM Layout conflicts
    if (values.domLayout === "autoHeight" || values.domLayout === "print") {
        if (values.pagination) {
            errors.push({
                property: "domLayout",
                message: `DOM Layout "${values.domLayout}" conflicts with Pagination. ${
                    values.domLayout === "autoHeight" ? "Auto Height" : "Print"
                } mode shows all rows at once, making pagination ineffective. Set DOM Layout to "Normal" or disable Pagination.`,
                severity: "error"
            });
            errors.push({
                property: "pagination",
                message: `Pagination conflicts with DOM Layout "${values.domLayout}". Disable Pagination or set DOM Layout to "Normal".`,
                severity: "error"
            });
        }

        if (!values.suppressRowVirtualisation) {
            errors.push({
                property: "domLayout",
                message: `DOM Layout "${
                    values.domLayout
                }" requires Row Virtualization to be disabled. ${
                    values.domLayout === "autoHeight" ? "Auto Height" : "Print"
                } mode renders ALL rows in the DOM at once. Enable "Disable Virtualisation" setting or set DOM Layout to "Normal".`,
                severity: "error"
            });
            errors.push({
                property: "suppressRowVirtualisation",
                message: `Row Virtualization must be disabled when DOM Layout is "${values.domLayout}". Enable "Disable Virtualisation" or set DOM Layout to "Normal".`,
                severity: "error"
            });
        }

        if ((values as any).rowModelType === "serverSide") {
            errors.push({
                property: "domLayout",
                message: `DOM Layout "${values.domLayout}" is incompatible with Server-Side row model. Server-Side is designed for large datasets with lazy loading, but ${values.domLayout} loads all rows at once. Set DOM Layout to "Normal" or use Client-Side row model.`,
                severity: "error"
            });
            errors.push({
                property: "rowModelType",
                message: `Server-Side row model conflicts with DOM Layout "${values.domLayout}". Use Client-Side row model or set DOM Layout to "Normal".`,
                severity: "error"
            });
        }
    }

    if (values.rowClassMode === "mapping" && !values.rowClassAttribute) {
        errors.push({
            property: "rowClassAttribute",
            message: "Row Class Attribute is required when Row Class Mode is Mapping.",
            severity: "error"
        });
    }

    if (values.rowClassRules && values.rowClassRules.trim()) {
        try {
            const parsed = JSON.parse(values.rowClassRules);
            const isValid =
                (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ||
                Array.isArray(parsed);
            if (!isValid) {
                errors.push({
                    property: "rowClassRules",
                    message: "Row Class Rules JSON must be an object or array.",
                    severity: "error"
                });
            }
        } catch (e: any) {
            errors.push({
                property: "rowClassRules",
                message: e?.message
                    ? `Row Class Rules JSON error: ${e.message}`
                    : "Row Class Rules JSON is invalid.",
                severity: "error"
            });
        }
    }

    return errors;
}
