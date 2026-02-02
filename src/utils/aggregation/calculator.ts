/**
 * Aggregation Calculator
 *
 * Calculates aggregations for grid data (client-side, server-side, and groups).
 * Used for pinned bottom rows and group row aggregations.
 */

import { ValueStatus } from "mendix";
import { ColumnsType } from "../../../typings/AGGridProps";
import { applyAggregation, type AggregationFunction } from "./functions";

export interface AggregationConfig {
    enableAggregationFooter: boolean;
    columns: ColumnsType[];
    rowData: any[];
}

/**
 * Calculate aggregations for pinned bottom row (client-side data).
 *
 * This creates a footer row showing aggregated values for columns that have
 * aggregation enabled.
 *
 * @param config - Aggregation configuration
 * @returns Array with single aggregation row, or undefined if no aggregations
 */
export function calculatePinnedBottomRow(
    config: AggregationConfig
): Array<Record<string, any>> | undefined {
    const { enableAggregationFooter, columns, rowData } = config;

    if (!enableAggregationFooter || !rowData || rowData.length === 0) {
        return undefined;
    }

    const aggregationRow: Record<string, any> = {};
    let hasAnyAggregation = false;

    columns.forEach((col) => {
        if (col.enableAggregation && col.aggregationFunction && col.attribute?.id) {
            hasAnyAggregation = true;

            // Extract values from row data
            const values = extractColumnValues(rowData, col);

            // Apply aggregation function
            const result = applyAggregation(values, col.aggregationFunction as AggregationFunction);

            aggregationRow[col.attribute.id] = result;
        }
    });

    return hasAnyAggregation ? [aggregationRow] : undefined;
}

/**
 * Extract values from a column across all rows.
 *
 * @param rowData - Array of row objects
 * @param column - Column configuration
 * @returns Array of values
 */
function extractColumnValues(rowData: any[], column: ColumnsType): any[] {
    if (!column.attribute) {
        return [];
    }

    return rowData
        .map((item) => {
            const value = column.attribute!.get(item);
            if (value?.status === ValueStatus.Available) {
                return value.value;
            }
            return null;
        })
        .filter((v) => v !== null && v !== undefined);
}

/**
 * Calculate aggregations for a specific group of rows.
 *
 * This is used when row grouping is enabled to show aggregations within each group.
 *
 * @param groupData - Array of rows in the group
 * @param columns - Column configurations
 * @returns Aggregation result object
 */
export function calculateGroupAggregations(
    groupData: any[],
    columns: ColumnsType[]
): Record<string, any> {
    const aggregations: Record<string, any> = {};

    columns.forEach((col) => {
        if (col.enableAggregation && col.aggregationFunction && col.attribute?.id) {
            const values = extractColumnValues(groupData, col);
            const result = applyAggregation(values, col.aggregationFunction as AggregationFunction);
            aggregations[col.attribute.id] = result;
        }
    });

    return aggregations;
}

/**
 * Calculate server-side aggregations (placeholder for future implementation).
 *
 * This would call a Mendix microflow to compute aggregations on the server,
 * useful for very large datasets.
 *
 * @param microflowName - Name of the microflow to call
 * @param columns - Columns to aggregate
 * @param filters - Active filters
 * @returns Promise resolving to aggregation results
 */
export async function calculateServerSideAggregations(
    microflowName: string,
    _columns: ColumnsType[],
    _filters: any[]
): Promise<Record<string, any> | null> {
    // TODO: Implement server-side aggregation
    // This would:
    // 1. Build aggregation request JSON
    // 2. Call Mendix microflow
    // 3. Parse response
    // 4. Return aggregation values

    console.warn("Server-side aggregations not yet implemented. Microflow:", microflowName);
    return null;
}
