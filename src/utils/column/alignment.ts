/**
 * Column Alignment Utilities
 *
 * Determines the horizontal text alignment for grid columns based on:
 * - Explicit alignment configuration
 * - Data type (numbers/dates = right, booleans = center, text = left)
 * - Formatter type (links/badges = center)
 */

import { ColumnsType } from "../../../typings/AGGridProps";

export type CellAlignment = "left" | "center" | "right";

/**
 * Determine cell alignment for a column based on its configuration.
 *
 * Priority:
 * 1. Explicit alignment setting (if not "auto")
 * 2. Explicit data type
 * 3. Formatter type
 * 4. Attribute type
 * 5. Default to "left"
 *
 * @param col - Column configuration
 * @returns Cell alignment value
 */
export function getCellAlignment(col: ColumnsType): CellAlignment {
    // If explicit alignment is set and not auto, use it
    if (col.alignment && col.alignment !== "auto") {
        return col.alignment as CellAlignment;
    }

    const explicitDataType = col.dataType && col.dataType !== "auto" ? col.dataType : null;

    // Explicit data type takes precedence
    if (explicitDataType === "number" || explicitDataType === "date") {
        return "right";
    }
    if (explicitDataType === "boolean") {
        return "center";
    }

    // Auto alignment logic based on formatter and attribute type
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
}

/**
 * Get CSS class name for header alignment
 */
export function getHeaderAlignmentClass(alignment: CellAlignment): string {
    return `ag-header-cell-${alignment}`;
}

/**
 * Get CSS styles for cell alignment
 */
export function getCellAlignmentStyle(alignment: CellAlignment): { textAlign: CellAlignment } {
    return { textAlign: alignment };
}
