import { FormatterEnum } from "../columnTypes";

// Status mapping interface for status badges
export interface StatusMapping {
    value: string | number | boolean;
    label?: string;
    className?: string;
    style?: string;
}

// Currency codes supported
export type CurrencyCode = "USD" | "EUR" | "GBP";

// Date format options
export type DateFormat =
    | "MM/DD/YYYY"
    | "DD/MM/YYYY"
    | "YYYY-MM-DD"
    | "YYYY/MM/DD"
    | "long"
    | "datetime"
    | "time";

// Attribute types from Mendix
export type AttributeType = "String" | "Boolean" | "DateTime" | "Decimal" | "Long" | "Integer";

/**
 * Renders a link with custom URL and text patterns
 */
export const renderLink = (
    value: any,
    urlPattern: string | undefined,
    linkTextPattern: string | undefined
): string => {
    try {
        // Handle empty or undefined URL pattern
        if (!urlPattern || typeof urlPattern !== "string" || urlPattern.trim() === "") {
            console.warn("Link URL pattern is empty or invalid, returning plain value:", value);
            return String(value || "");
        }

        // Replace ${value} placeholder with actual value
        const url = urlPattern.replace(/\$\{value\}/g, String(value || ""));

        // Determine link text
        let displayText: string;
        if (
            linkTextPattern &&
            typeof linkTextPattern === "string" &&
            linkTextPattern.trim() !== ""
        ) {
            // Replace ${value} in link text pattern
            displayText = linkTextPattern.replace(/\$\{value\}/g, String(value || ""));
        } else {
            // Use the value as display text
            displayText = String(value || "");
        }

        // Return HTML anchor tag that prevents navigation but allows bubbling to parent handlers
        const passiveHandlers = `data-passive-link="true" onclick="event.preventDefault();" onkeydown="if(event.key===' '||event.key==='Spacebar'){event.preventDefault(); event.target.click();}"`;

        return `<a href="${url}" class="aggrid-link" ${passiveHandlers}><span class="fa fa-eye"></span> <span class="sr-only">${displayText}</span></a>`;
    } catch (e) {
        console.error("Error in renderLink:", e);
        console.error("URL pattern was:", urlPattern);
        console.error("Value was:", value);
        return String(value || "");
    }
};

/**
 * Applies a formatter to a value based on the formatter type
 */
export const applyFormatter = (
    value: any,
    formatter: FormatterEnum,
    attributeType: AttributeType,
    customPrefix?: string,
    customSuffix?: string
): string => {
    if (value === null || value === undefined) return "";

    try {
        switch (formatter) {
            case "customPrefix":
                const prefix = customPrefix || "";
                const suffix = customSuffix || "";
                return `${prefix}${String(value)}${suffix}`;
            case "currency":
                return formatCurrency(value, "USD");
            case "currencyEUR":
                return formatCurrency(value, "EUR");
            case "currencyGBP":
                return formatCurrency(value, "GBP");
            case "percentage":
                const numVal = Number(value);
                return isNaN(numVal) ? String(value) : `${numVal.toFixed(2)}%`;
            case "number":
                const num = Number(value);
                return isNaN(num) ? String(value) : num.toLocaleString();
            case "decimal2":
                const dec = Number(value);
                return isNaN(dec) ? String(value) : dec.toFixed(2);
            case "dateShort":
            case "dateMDY":
                return formatDate(value, "MM/DD/YYYY");
            case "dateLong":
                return formatDate(value, "long");
            case "dateISO":
            case "dateYMD":
                return formatDate(value, "YYYY-MM-DD");
            case "dateDMY":
                return formatDate(value, "DD/MM/YYYY");
            case "dateTime":
                return formatDate(value, "datetime");
            case "time":
                return formatDate(value, "time");
            case "yesNo":
                return value ? "Yes" : "No";
            case "trueFalse":
                return value ? "True" : "False";
            case "uppercase":
                return String(value).toUpperCase();
            case "lowercase":
                return String(value).toLowerCase();
            case "capitalize":
                const str = String(value);
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            case "none":
            default:
                return formatValue(value, attributeType);
        }
    } catch (e) {
        console.error("Error applying formatter:", formatter, "Error:", e);
        return String(value);
    }
};

/**
 * Formats a value as currency
 */
export const formatCurrency = (value: any, currency: CurrencyCode): string => {
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numValue);
};

/**
 * Formats a value as a date
 */
export const formatDate = (value: any, format: DateFormat): string => {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return String(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    switch (format) {
        case "MM/DD/YYYY":
            return `${month}/${day}/${year}`;
        case "DD/MM/YYYY":
            return `${day}/${month}/${year}`;
        case "YYYY-MM-DD":
            return `${year}-${month}-${day}`;
        case "YYYY/MM/DD":
            return `${year}/${month}/${day}`;
        case "long":
            return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        case "datetime":
            return date.toLocaleString();
        case "time":
            return date.toLocaleTimeString();
        default:
            return date.toLocaleDateString();
    }
};

/**
 * Formats a value based on its attribute type
 */
export const formatValue = (value: any, type: AttributeType): string => {
    if (value === null || value === undefined) return "";

    switch (type) {
        case "Boolean":
            return value ? "Yes" : "No";
        case "DateTime":
            return value instanceof Date ? value.toLocaleString() : String(value);
        case "Decimal":
        case "Long":
        case "Integer":
            return String(value);
        default:
            return String(value);
    }
};

/**
 * Compares two values for sorting purposes
 */
export const compareValuesForSort = (a: any, b: any): number => {
    if (a === b) {
        return 0;
    }

    if (a === null || a === undefined) {
        return 1;
    }

    if (b === null || b === undefined) {
        return -1;
    }

    if (a instanceof Date && b instanceof Date) {
        return Math.sign(a.getTime() - b.getTime());
    }

    const aNumber = typeof a === "number" ? a : Number(a);
    const bNumber = typeof b === "number" ? b : Number(b);

    if (!isNaN(aNumber) && !isNaN(bNumber)) {
        return Math.sign(aNumber - bNumber);
    }

    return String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: "base"
    });
};
