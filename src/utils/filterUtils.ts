import { ColumnsType } from "../columnTypes";

/**
 * Get the data type of a column based on its attribute type
 */
export function getColumnDataType(column: ColumnsType): "date" | "number" | "boolean" | "string" {
    const explicitType = column.dataType && column.dataType !== "auto" ? column.dataType : null;
    if (explicitType === "date" || explicitType === "number" || explicitType === "boolean") {
        return explicitType;
    }
    if (explicitType === "string") {
        return "string";
    }

    if (!column.attribute) return "string";

    // Check the formatter enum for date-related formatters
    if (column.formatter) {
        const dateFormatters = [
            "dateShort",
            "dateLong",
            "dateISO",
            "dateDMY",
            "dateMDY",
            "dateYMD",
            "dateTime",
            "time"
        ];
        if (dateFormatters.includes(column.formatter)) {
            return "date";
        }

        const numberFormatters = [
            "currency",
            "currencyEUR",
            "currencyGBP",
            "percentage",
            "number",
            "decimal2"
        ];
        if (numberFormatters.includes(column.formatter)) {
            return "number";
        }

        const booleanFormatters = ["yesNo", "trueFalse"];
        if (booleanFormatters.includes(column.formatter)) {
            return "boolean";
        }
    }

    // Try to infer from the attribute type at runtime
    const attrType = (column.attribute as any).type;
    if (attrType === "DateTime") return "date";
    if (attrType === "Integer" || attrType === "Long" || attrType === "Decimal") return "number";
    if (attrType === "Boolean") return "boolean";

    return "string";
}

/**
 * Infer data type from actual values when column metadata isn't conclusive
 */
export function inferTypeFromValues(values: string[]): "date" | "number" | "boolean" | "string" {
    if (values.length === 0) return "string";

    const samples = values.slice(0, Math.min(5, values.length));

    const allDates = samples.every((v) => {
        const date = new Date(v);
        return !isNaN(date.getTime()) && v.match(/\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{2,4}/);
    });
    if (allDates) return "date";

    const allNumbers = samples.every((v) => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    if (allNumbers) return "number";

    const allBooleans = samples.every(
        (v) =>
            v.toLowerCase() === "true" ||
            v.toLowerCase() === "false" ||
            v.toLowerCase() === "yes" ||
            v.toLowerCase() === "no"
    );
    if (allBooleans) return "boolean";

    return "string";
}

/**
 * Format a date value for display
 */
export function formatDateValue(value: string): string {
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOfWeek = days[date.getDay()];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        return `${dayOfWeek} ${month}/${day}/${year}`;
    } catch {
        return value;
    }
}

/**
 * Parse a value to its appropriate type for sorting
 */
export function parseValueForSorting(
    value: string,
    dataType: "date" | "number" | "boolean" | "string"
): any {
    if (!value) return value;

    switch (dataType) {
        case "date":
            const dateVal = new Date(value);
            return isNaN(dateVal.getTime()) ? value : dateVal.getTime();
        case "number":
            const numVal = parseFloat(value);
            return isNaN(numVal) ? value : numVal;
        case "boolean":
            return value.toLowerCase() === "true" ? 1 : 0;
        default:
            return value;
    }
}

/**
 * Sort distinct values based on their data type
 */
export function sortDistinctValues(
    values: string[],
    dataType: "date" | "number" | "boolean" | "string"
): string[] {
    return [...values].sort((a, b) => {
        const parsedA = parseValueForSorting(a, dataType);
        const parsedB = parseValueForSorting(b, dataType);

        if (parsedA < parsedB) return -1;
        if (parsedA > parsedB) return 1;
        return 0;
    });
}
