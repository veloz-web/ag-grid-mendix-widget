import { ReactElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../columnTypes";
import { DynamicView } from "./CardView";
import { applyFormatter, renderLink } from "../utils/formatters";
import { CustomFormatterRegistry } from "../utils/customFormatters";

interface CustomTemplateViewProps {
    rowData: any[];
    columns: ColumnsType[];
    template: string;
    onRowClick?: any;
    onRowDoubleClick?: any;
    className?: string;
    customFormatterRegistry?: CustomFormatterRegistry;
}

export function CustomTemplateView(props: CustomTemplateViewProps): ReactElement {
    const {
        rowData,
        columns,
        template,
        onRowClick,
        onRowDoubleClick,
        className = "aggrid-custom-template-view",
        customFormatterRegistry
    } = props;

    // If no template provided, render the fallback view
    if (!template || template.trim() === "") {
        return (
            <DynamicView
                rowData={rowData}
                columns={columns}
                onRowClick={onRowClick}
                onRowDoubleClick={onRowDoubleClick}
            />
        );
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

    const handleItemDoubleClick = (item: any) => {
        if (!onRowDoubleClick) {
            return;
        }

        const action = onRowDoubleClick.get(item);

        if (action && action.canExecute) {
            setTimeout(() => {
                action.execute();
            }, 0);
        }
    };

    const processTemplate = (template: string, item: any): string => {
        let processed = template;

        // Handle conditional blocks first (before simple placeholders)
        processed = processConditionalBlocks(processed, item);

        // Then handle simple placeholders (excluding conditional syntax)
        const placeholders = processed.match(/\{\{([^#/][^}]*)\}\}/g) || [];

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
                        else if (formatterName === "link") {
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

    const processConditionalBlocks = (template: string, item: any): string => {
        let result = template;

        // Handle {{#if condition}}content{{else}}alternative{{/if}}
        const conditionalWithElseRegex =
            /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;

        result = result.replace(
            conditionalWithElseRegex,
            (match, condition, ifContent, elseContent) => {
                if (evaluateCondition(condition.trim(), item)) {
                    return processConditionalBlocks(ifContent, item);
                } else {
                    return processConditionalBlocks(elseContent, item);
                }
            }
        );

        // Handle {{#if condition}}content{{/if}}
        const conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

        result = result.replace(conditionalRegex, (match, condition, content) => {
            if (evaluateCondition(condition.trim(), item)) {
                // Process nested conditionals in the content
                return processConditionalBlocks(content, item);
            }
            return "";
        });

        return result;
    };

    const evaluateCondition = (condition: string, item: any): boolean => {
        const comparisonMatch = condition.match(/^(\w+)\s*(==|!=)\s*["']([^"']+)["']$/);
        if (comparisonMatch) {
            const [, fieldName, operator, expectedValue] = comparisonMatch;
            const column = columns.find((col) => col.header?.value === fieldName);

            if (column?.attribute) {
                try {
                    const value = column.attribute.get(item);
                    if (value && value.status === ValueStatus.Available) {
                        const actualValue = String(value.value);
                        return operator === "=="
                            ? actualValue === expectedValue
                            : actualValue !== expectedValue;
                    }
                } catch {
                    return false;
                }
            }
            return false;
        }

        // Handle compound conditions with && and ||
        if (condition.includes(" && ") || condition.includes(" || ")) {
            return evaluateCompoundCondition(condition, item);
        }

        // Try simple conditions (field existence, string methods, etc.)
        return evaluateSimpleCondition(condition, item);
    };

    const evaluateCompoundCondition = (condition: string, item: any): boolean => {
        // Handle && (AND) operator first, then || (OR)
        // This follows operator precedence: && has higher precedence than ||

        // Split by || first, then handle each part
        const orParts = condition.split(" || ").map((part) => part.trim());

        // If there are || parts, evaluate each and return true if any is true
        if (orParts.length > 1) {
            return orParts.some((part) => evaluateCompoundCondition(part, item));
        }

        // Handle && operator
        const andParts = condition.split(" && ").map((part) => part.trim());

        // If there are && parts, evaluate each and return true only if all are true
        if (andParts.length > 1) {
            return andParts.every((part) => evaluateSimpleCondition(part, item));
        }

        // Single condition
        return evaluateSimpleCondition(condition, item);
    };

    const evaluateSimpleCondition = (condition: string, item: any): boolean => {
        // Handle string method calls WITHOUT explicit comparison: FieldName.method(args)
        const methodOnlyMatch = condition.match(/^(.+?)\.(\w+)\(([^)]*)\)$/);
        if (methodOnlyMatch) {
            const [, fieldName, methodName, methodArgs] = methodOnlyMatch;
            const column = columns.find((col) => col.header?.value === fieldName);

            if (column?.attribute) {
                try {
                    const value = column.attribute.get(item);
                    if (value && value.status === ValueStatus.Available) {
                        const stringValue = String(value.value);
                        let methodResult: any;

                        // Parse method arguments
                        const args = methodArgs
                            .split(",")
                            .map((arg) => arg.trim().replace(/^["']|["']$/g, ""));

                        // Execute string methods safely
                        switch (methodName) {
                            case "startsWith":
                                methodResult = stringValue.startsWith(args[0] || "");
                                break;
                            case "endsWith":
                                methodResult = stringValue.endsWith(args[0] || "");
                                break;
                            case "substring":
                                const start = parseInt(args[0], 10) || 0;
                                const end = args[1] ? parseInt(args[1], 10) : undefined;
                                methodResult =
                                    end !== undefined
                                        ? stringValue.substring(start, end)
                                        : stringValue.substring(start);
                                break;
                            case "length":
                                methodResult = stringValue.length;
                                break;
                            case "includes":
                                methodResult = stringValue.includes(args[0] || "");
                                break;
                            default:
                                return false; // Unknown method
                        }

                        // Return boolean result directly for method calls
                        return Boolean(methodResult);
                    }
                } catch {
                    return false;
                }
            }
            return false;
        }

        // Handle string method calls WITH explicit comparison: FieldName.method(args) == "value"
        const methodCallMatch = condition.match(
            /^(.+?)\.(\w+)\(([^)]*)\)\s*(==|!=)\s*["']([^"']+)["']$/
        );
        if (methodCallMatch) {
            const [, fieldName, methodName, methodArgs, operator, expectedValue] = methodCallMatch;
            const column = columns.find((col) => col.header?.value === fieldName);

            if (column?.attribute) {
                try {
                    const value = column.attribute.get(item);
                    if (value && value.status === ValueStatus.Available) {
                        const stringValue = String(value.value);
                        let methodResult: any;

                        // Parse method arguments
                        const args = methodArgs
                            .split(",")
                            .map((arg) => arg.trim().replace(/^["']|["']$/g, ""));

                        // Execute string methods safely
                        switch (methodName) {
                            case "startsWith":
                                methodResult = stringValue.startsWith(args[0] || "");
                                break;
                            case "endsWith":
                                methodResult = stringValue.endsWith(args[0] || "");
                                break;
                            case "substring":
                                const start = parseInt(args[0], 10) || 0;
                                const end = args[1] ? parseInt(args[1], 10) : undefined;
                                methodResult =
                                    end !== undefined
                                        ? stringValue.substring(start, end)
                                        : stringValue.substring(start);
                                break;
                            case "length":
                                methodResult = stringValue.length;
                                break;
                            case "includes":
                                methodResult = stringValue.includes(args[0] || "");
                                break;
                            default:
                                return false; // Unknown method
                        }

                        const actualValue = String(methodResult);
                        return operator === "=="
                            ? actualValue === expectedValue
                            : actualValue !== expectedValue;
                    }
                } catch {
                    return false;
                }
            }
            return false;
        }

        // Simple field existence check (field has a non-empty value)
        if (!condition.includes("==") && !condition.includes("!=") && !condition.includes(".")) {
            const column = columns.find((col) => col.header?.value === condition);
            if (column?.attribute) {
                try {
                    const value = column.attribute.get(item);
                    if (value && value.status === ValueStatus.Available) {
                        // Special handling for boolean fields
                        if (column.attribute.type === "Boolean") {
                            return value.value === true;
                        }
                        // For other field types, check for non-empty values
                        return (
                            value.value !== null && value.value !== undefined && value.value !== ""
                        );
                    }
                } catch {
                    return false;
                }
            }
            return false;
        }

        // Parse comparison conditions: FieldName == "value" or FieldName != "value"
        const comparisonMatch = condition.match(/^(\w+)\s*(==|!=)\s*["']([^"']+)["']$/);
        if (comparisonMatch) {
            const [, fieldName, operator, expectedValue] = comparisonMatch;
            const column = columns.find((col) => col.header?.value === fieldName);

            if (column?.attribute) {
                try {
                    const value = column.attribute.get(item);
                    if (value && value.status === ValueStatus.Available) {
                        const actualValue = String(value.value);
                        return operator === "=="
                            ? actualValue === expectedValue
                            : actualValue !== expectedValue;
                    }
                } catch {
                    return false;
                }
            }
        }

        return false;
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
                        key={item.id ?? idx}
                        className="aggrid-custom-item"
                        onClick={() => handleItemClick(item)}
                        onDoubleClick={() => handleItemDoubleClick(item)}
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
