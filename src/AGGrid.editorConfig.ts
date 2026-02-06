import { Properties, Problem } from "@mendix/pluggable-widgets-tools";
import { AGGridPreviewProps } from "../typings/AGGridProps";

export function getProperties(
    values: AGGridPreviewProps,
    defaultProperties: Properties
): Properties {
    return defaultProperties;
}

export function getPreview(values: AGGridPreviewProps): any {
    const children: any[] = [
        {
            type: "Container",
            children: [
                {
                    type: "Text",
                    content: "AG Grid",
                    fontColor: "#555",
                    fontSize: 14
                },
                {
                    type: "Text",
                    content: `${values.columns.length} column(s) configured`,
                    fontColor: "#888",
                    fontSize: 12
                }
            ]
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

    if (values.rowModelType === "serverSide") {
        const blockSize = values.cacheBlockSize || 100;
        const maxBlocks = values.maxBlocksInCache || 0;
        const maxRequests = values.maxConcurrentRequests || 2;
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
        children: values.columns.map((col, index) => ({
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
