import { ReactElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";
import { DynamicView } from "./CardView";
import { applyFormatter, renderStatusBadge, renderLink } from "../utils/formatters";
import { CustomFormatterRegistry } from "../utils/customFormatters";

interface CustomTemplateViewProps {
    rowData: any[];
    columns: ColumnsType[];
    template: string;
    onRowClick?: any;
    className?: string;
    customFormatterRegistry?: CustomFormatterRegistry;
}

export function CustomTemplateView(props: CustomTemplateViewProps): ReactElement {
    const {
        rowData,
        columns,
        template,
        onRowClick,
        className = "aggrid-custom-template-view",
        customFormatterRegistry
    } = props;

    // If no template provided, render the fallback view
    if (!template || template.trim() === "") {
        return <DynamicView rowData={rowData} columns={columns} onRowClick={onRowClick} />;
    }

    // Additional safety check: ensure we have valid data
    if (!rowData || !Array.isArray(rowData) || !columns || !Array.isArray(columns)) {
        return (
            <div className={className}>
                <div className="error">Invalid data configuration</div>
            </div>
        );
    }

    const handleItemClick = (item: any) => {
        if (!onRowClick) {
            return;
        }

        // For ListActionValue, get the action for the specific item
        const action = onRowClick.get(item);

        // Check if the action can be executed and execute it
        if (action && action.canExecute) {
            // Defer execution to next tick for React-only mode compatibility
            setTimeout(() => {
                action.execute();
            }, 0);
        }
    };

    const processTemplate = (template: string, item: any): string => {
        let processed = template;

        // Find all {{...}} placeholders (including function-style)
        const placeholders = template.match(/\{\{([^}]+)\}\}/g) || [];

        // Create a cache for attribute values to avoid multiple .get() calls
        const valueCache: { [key: string]: any } = {};

        placeholders.forEach((placeholder) => {
            const content = placeholder.slice(2, -2).trim(); // Remove {{ }} and trim

            // Check if it's a function-style formatter: functionName("FieldName")
            const functionMatch = content.match(/^(\w+)\s*\(\s*["']([^"']+)["']\s*\)$/);

            let fieldName: string;
            let formatterName: string | undefined;

            if (functionMatch) {
                // Function-style: {{statusBadge("Status")}}
                formatterName = functionMatch[1];
                fieldName = functionMatch[2];
            } else {
                // Simple field reference: {{Status}}
                fieldName = content;
                formatterName = undefined;
            }

            const column = columns.find((col) => col.header?.value === fieldName);

            if (column?.attribute) {
                const cacheKey = column.attribute.id;

                if (!(cacheKey in valueCache)) {
                    try {
                        valueCache[cacheKey] = column.attribute.get(item);
                    } catch (error) {
                        console.warn(`Error accessing attribute ${cacheKey}:`, error);
                        valueCache[cacheKey] = { status: "error" };
                    }
                }

                const value = valueCache[cacheKey];
                let displayValue = "";

                if (value && value.status === ValueStatus.Available) {
                    // Only apply formatter if explicitly requested via function syntax
                    // Simple {{FieldName}} returns raw value, {{formatter("FieldName")}} applies formatting
                    if (formatterName && formatterName !== "none") {
                        // First check if it's a custom formatter
                        if (customFormatterRegistry && customFormatterRegistry.has(formatterName)) {
                            displayValue = customFormatterRegistry.execute(formatterName, {
                                value: value.value,
                                item,
                                column
                            });
                        }
                        // Handle built-in HTML-returning formatters
                        else if (formatterName === "statusBadge") {
                            displayValue = renderStatusBadge(value.value, column.statusMapping);
                        } else if (formatterName === "link") {
                            displayValue = renderLink(
                                value.value,
                                column.linkUrlPattern,
                                column.linkText
                            );
                        } else {
                            // Standard text formatters
                            displayValue = applyFormatter(
                                value.value,
                                formatterName as any,
                                (column.attribute.type || "String") as any,
                                column.customPrefix,
                                column.customSuffix
                            );
                        }
                    } else {
                        // No formatter specified - return raw value
                        displayValue = String(value.value ?? "");
                    }
                }

                processed = processed.replace(placeholder, displayValue);
            } else {
                // Keep placeholder if field not found
                processed = processed.replace(placeholder, placeholder);
            }
        });

        return processed;
    };

    return (
        <div className={className}>
            {rowData.map((item, idx) => {
                let processedHtml = "";
                try {
                    processedHtml = processTemplate(template, item);
                } catch (error) {
                    console.warn("Error processing template:", error);
                    processedHtml = '<div class="error">Error rendering item</div>';
                }

                return (
                    <div
                        key={idx}
                        className="aggrid-custom-item"
                        onClick={() => handleItemClick(item)}
                        dangerouslySetInnerHTML={{
                            __html: processedHtml
                        }}
                    />
                );
            })}
            {rowData.length === 0 && <div className="no-data">No records found</div>}
        </div>
    );
}
