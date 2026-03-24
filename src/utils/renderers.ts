import { ColumnsType, FormatterEnum } from "../columnTypes";
import { ValueStatus } from "mendix";
import { renderLink, applyFormatter, AttributeType } from "./formatters";

/**
 * Renderer functions for AG Grid components
 * These functions handle the rendering/formatting of cell values
 */

/**
 * Creates a link renderer for AG Grid cells
 */
export const createLinkRenderer = (
    linkUrlPattern?: string,
    linkText?: string,
    linkAction?: any,
    item?: any
) => {
    return (value: any) => {
        try {
            // If there's a linkAction, create an accessible button with per-row context
            if (linkAction && item) {
                const rowAction = linkAction.get(item);

                if (rowAction && rowAction.canExecute) {
                    const rawValue = value;
                    const displayText = linkText
                        ? linkText.replace(/\$\{value\}/g, String(rawValue ?? ""))
                        : String(rawValue ?? "");

                    return `<button type="button" class="aggrid-link-button" onclick="event.preventDefault(); event.stopPropagation();">${
                        displayText || '<span class="fas fa-eye"></span>'
                    }</button>`;
                }
            }

            // Fallback to legacy URL pattern
            if (linkUrlPattern) {
                const htmlString = renderLink(value, linkUrlPattern, linkText);
                return `<span dangerouslySetInnerHTML={{__html: "${htmlString.replace(
                    /"/g,
                    '\\"'
                )}"}}></span>`;
            }

            return String(value || "");
        } catch (e) {
            console.error("Error rendering link:", e);
            return String(value || "");
        }
    };
};

/**
 * Creates a value formatter for AG Grid cells
 */
export const createValueFormatter = (
    formatter: FormatterEnum = "none",
    attributeType: AttributeType = "String",
    customPrefix?: string,
    customSuffix?: string
) => {
    return (value: any) => {
        try {
            if (value === null || value === undefined) return "";
            return applyFormatter(value, formatter, attributeType, customPrefix, customSuffix);
        } catch (e) {
            console.error("Error in formatter:", e);
            return String(value || "");
        }
    };
};

/**
 * Evaluates template strings with column data
 */
export const evaluateTemplate = (template: string, item: any, columns: ColumnsType[]): string => {
    return template.replace(/\$\{([^}]+)\}/g, (match, attrId) => {
        const col = columns.find((c) => c.attribute?.id === attrId);
        if (!col || !col.attribute) return match; // keep placeholder if not found
        const value = col.attribute.get(item);
        return value.status === ValueStatus.Available ? String(value.value ?? "") : "";
    });
};

/**
 * Determines cell alignment based on column configuration
 */
export const getCellAlignment = (col: ColumnsType): string => {
    // If explicit alignment is set and not auto, use it
    if (col.alignment && col.alignment !== "auto") {
        return col.alignment;
    }

    // Auto alignment logic based on data type and formatter
    const formatter = col.formatter || "none";
    const attributeType = col.attribute?.type || "String";

    // Links, status badges, and actions are centered
    if (formatter === "link") {
        return "center";
    }

    // Numbers and dates are right-aligned
    if (
        attributeType === "Integer" ||
        attributeType === "Long" ||
        attributeType === "Decimal" ||
        attributeType === "DateTime" ||
        formatter === "currency" ||
        formatter === "currencyEUR" ||
        formatter === "currencyGBP" ||
        formatter === "percentage" ||
        formatter === "number" ||
        formatter === "decimal2" ||
        formatter.startsWith("date") ||
        formatter === "time"
    ) {
        return "right";
    }

    // Text and everything else is left-aligned (default)
    return "left";
};

/**
 * Formats a card field value for display
 */
export const formatCardFieldValue = (
    col: ColumnsType,
    rawValue: any,
    attributeType: AttributeType,
    item: any,
    _columns: ColumnsType[]
): { formattedValue: string | any; isHtml: boolean } => {
    if (col.formatter === "link") {
        // If there's a linkAction, use that (proper Mendix navigation)
        if (col.linkAction) {
            const action = col.linkAction.get(item);

            if (action && action.canExecute) {
                const displayText = col.linkText
                    ? col.linkText.replace(/\$\{value\}/g, String(rawValue ?? ""))
                    : String(rawValue ?? "");

                return {
                    formattedValue: {
                        type: "button",
                        props: {
                            type: "button",
                            className: "aggrid-link-button",
                            onClick: (e: any) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Defer execution to next tick for React-only mode compatibility
                                setTimeout(() => {
                                    action.execute();
                                }, 0);
                            }
                        },
                        children: displayText || {
                            type: "span",
                            props: { className: "fas fa-eye" }
                        }
                    },
                    isHtml: false
                };
            } else {
                const htmlString = renderLink(rawValue, col.linkUrlPattern, col.linkText);
                return { formattedValue: htmlString, isHtml: true };
            }
        } else {
            // Fallback to legacy URL pattern
            const htmlString = renderLink(rawValue, col.linkUrlPattern, col.linkText);
            return { formattedValue: htmlString, isHtml: true };
        }
    } else {
        const formattedValue = applyFormatter(
            rawValue,
            col.formatter || "none",
            attributeType,
            col.customPrefix,
            col.customSuffix
        );
        return { formattedValue, isHtml: false };
    }
};
