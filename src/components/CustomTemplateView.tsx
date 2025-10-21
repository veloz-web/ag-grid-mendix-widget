import { ReactElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";
import { DynamicView } from "./CardView";
import { applyFormatter } from "../utils/formatters";

interface CustomTemplateViewProps {
    rowData: any[];
    columns: ColumnsType[];
    template: string;
    onRowClick?: any;
    className?: string;
}

export function CustomTemplateView(props: CustomTemplateViewProps): ReactElement {
    const {
        rowData,
        columns,
        template,
        onRowClick,
        className = "aggrid-custom-template-view"
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

        // Find all {{FieldName}} placeholders
        const placeholders = template.match(/\{\{([^}]+)\}\}/g) || [];

        // Create a cache for attribute values to avoid multiple .get() calls
        const valueCache: { [key: string]: any } = {};

        placeholders.forEach((placeholder) => {
            const fieldName = placeholder.slice(2, -2); // Remove {{ }}
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
                    // Apply formatting if column has a formatter
                    if (column.formatter && column.formatter !== "none") {
                        displayValue = applyFormatter(
                            value.value,
                            column.formatter as any,
                            (column.attribute.type || "String") as any,
                            column.customPrefix,
                            column.customSuffix
                        );
                    } else {
                        displayValue = String(value.value ?? "");
                    }
                }

                processed = processed.replace(placeholder, displayValue);
            } else {
                // Keep placeholder if field not found
                processed = processed.replace(placeholder, `{{${fieldName}}}`);
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
