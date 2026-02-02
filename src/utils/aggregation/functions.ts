/**
 * Aggregation Functions
 *
 * Individual aggregation function implementations that can be reused across
 * client-side, server-side, and group aggregations.
 */

export type AggregationFunction = "sum" | "min" | "max" | "avg" | "count" | "first" | "last";

/**
 * Apply an aggregation function to an array of values.
 *
 * @param values - Array of values to aggregate
 * @param func - Aggregation function to apply
 * @returns Aggregated result or null if no valid values
 */
export function applyAggregation(values: any[], func: AggregationFunction): number | any | null {
    // Filter out null and undefined values
    const validValues = values.filter((v) => v !== null && v !== undefined);

    if (validValues.length === 0) {
        return null;
    }

    // For numeric aggregations, filter to only numbers
    const numericValues = validValues.filter((v) => typeof v === "number");

    switch (func) {
        case "sum":
            return aggregateSum(numericValues);
        case "avg":
            return aggregateAverage(numericValues);
        case "min":
            return aggregateMin(numericValues);
        case "max":
            return aggregateMax(numericValues);
        case "count":
            return aggregateCount(validValues);
        case "first":
            return aggregateFirst(validValues);
        case "last":
            return aggregateLast(validValues);
        default:
            console.warn(`Unknown aggregation function: ${func}`);
            return null;
    }
}

/**
 * Calculate the sum of numeric values.
 */
export function aggregateSum(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0);
}

/**
 * Calculate the average of numeric values.
 */
export function aggregateAverage(values: number[]): number | null {
    if (values.length === 0) return null;
    const sum = aggregateSum(values);
    return sum / values.length;
}

/**
 * Find the minimum value.
 */
export function aggregateMin(values: number[]): number | null {
    if (values.length === 0) return null;
    return Math.min(...values);
}

/**
 * Find the maximum value.
 */
export function aggregateMax(values: number[]): number | null {
    if (values.length === 0) return null;
    return Math.max(...values);
}

/**
 * Count the number of values.
 */
export function aggregateCount(values: any[]): number {
    return values.length;
}

/**
 * Return the first value.
 */
export function aggregateFirst(values: any[]): any | null {
    return values.length > 0 ? values[0] : null;
}

/**
 * Return the last value.
 */
export function aggregateLast(values: any[]): any | null {
    return values.length > 0 ? values[values.length - 1] : null;
}
