import { Properties } from "@mendix/pluggable-widgets-tools";
import { AGGridPreviewProps } from "../typings/AGGridProps";

export function getProperties(
    values: AGGridPreviewProps,
    defaultProperties: Properties
): Properties {
    return defaultProperties;
}

export function getPreview(values: AGGridPreviewProps): any {
    return {
        type: "Container",
        borders: true,
        children: [
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
            },
            {
                type: "Container",
                children: values.columns.map((col, index) => ({
                    type: "Text",
                    content: `Column ${index + 1}: ${col.header || "Unnamed"}`,
                    fontColor: "#666",
                    fontSize: 11
                }))
            }
        ]
    };
}
