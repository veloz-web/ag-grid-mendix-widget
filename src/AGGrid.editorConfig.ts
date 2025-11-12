import { Properties } from "@mendix/pluggable-widgets-tools";
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
