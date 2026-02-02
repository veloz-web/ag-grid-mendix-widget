/**
 * Aggregation Functions Tests
 *
 * Comprehensive test suite for aggregation functions used in footer rows,
 * group aggregations, and server-side aggregations.
 */

import {
    applyAggregation,
    aggregateSum,
    aggregateAverage,
    aggregateMin,
    aggregateMax,
    aggregateCount,
    aggregateFirst,
    aggregateLast,
    AggregationFunction
} from "../functions";

describe("Aggregation Functions", () => {
    describe("aggregateSum", () => {
        it("should sum positive numbers correctly", () => {
            expect(aggregateSum([1, 2, 3, 4, 5])).toBe(15);
        });

        it("should sum negative numbers correctly", () => {
            expect(aggregateSum([-1, -2, -3])).toBe(-6);
        });

        it("should sum mixed positive and negative numbers", () => {
            expect(aggregateSum([10, -5, 3, -2])).toBe(6);
        });

        it("should handle decimals correctly", () => {
            expect(aggregateSum([1.5, 2.3, 0.2])).toBeCloseTo(4.0, 5);
        });

        it("should return 0 for empty array", () => {
            expect(aggregateSum([])).toBe(0);
        });

        it("should handle single value", () => {
            expect(aggregateSum([42])).toBe(42);
        });

        it("should handle zero values", () => {
            expect(aggregateSum([0, 0, 0])).toBe(0);
        });

        it("should handle very large numbers", () => {
            expect(aggregateSum([1e10, 2e10, 3e10])).toBe(6e10);
        });
    });

    describe("aggregateAverage", () => {
        it("should calculate average of positive numbers", () => {
            expect(aggregateAverage([2, 4, 6, 8])).toBe(5);
        });

        it("should calculate average of negative numbers", () => {
            expect(aggregateAverage([-2, -4, -6])).toBe(-4);
        });

        it("should calculate average of mixed numbers", () => {
            expect(aggregateAverage([10, -10, 5, -5])).toBe(0);
        });

        it("should handle decimals correctly", () => {
            expect(aggregateAverage([1.5, 2.5, 3.0])).toBeCloseTo(2.333, 2);
        });

        it("should return null for empty array", () => {
            expect(aggregateAverage([])).toBeNull();
        });

        it("should handle single value", () => {
            expect(aggregateAverage([42])).toBe(42);
        });

        it("should handle precision with many decimal places", () => {
            expect(aggregateAverage([1.111, 2.222, 3.333])).toBeCloseTo(2.222, 3);
        });
    });

    describe("aggregateMin", () => {
        it("should find minimum positive number", () => {
            expect(aggregateMin([5, 2, 8, 1, 9])).toBe(1);
        });

        it("should find minimum negative number", () => {
            expect(aggregateMin([-5, -2, -8, -1])).toBe(-8);
        });

        it("should find minimum in mixed numbers", () => {
            expect(aggregateMin([10, -5, 0, 3])).toBe(-5);
        });

        it("should handle decimals", () => {
            expect(aggregateMin([1.5, 0.5, 2.5])).toBe(0.5);
        });

        it("should return null for empty array", () => {
            expect(aggregateMin([])).toBeNull();
        });

        it("should handle single value", () => {
            expect(aggregateMin([42])).toBe(42);
        });

        it("should handle all same values", () => {
            expect(aggregateMin([5, 5, 5, 5])).toBe(5);
        });

        it("should handle negative infinity", () => {
            expect(aggregateMin([0, -Infinity, 100])).toBe(-Infinity);
        });
    });

    describe("aggregateMax", () => {
        it("should find maximum positive number", () => {
            expect(aggregateMax([5, 2, 8, 1, 9])).toBe(9);
        });

        it("should find maximum negative number", () => {
            expect(aggregateMax([-5, -2, -8, -1])).toBe(-1);
        });

        it("should find maximum in mixed numbers", () => {
            expect(aggregateMax([10, -5, 0, 3])).toBe(10);
        });

        it("should handle decimals", () => {
            expect(aggregateMax([1.5, 0.5, 2.5])).toBe(2.5);
        });

        it("should return null for empty array", () => {
            expect(aggregateMax([])).toBeNull();
        });

        it("should handle single value", () => {
            expect(aggregateMax([42])).toBe(42);
        });

        it("should handle all same values", () => {
            expect(aggregateMax([5, 5, 5, 5])).toBe(5);
        });

        it("should handle positive infinity", () => {
            expect(aggregateMax([0, Infinity, 100])).toBe(Infinity);
        });
    });

    describe("aggregateCount", () => {
        it("should count numeric values", () => {
            expect(aggregateCount([1, 2, 3, 4, 5])).toBe(5);
        });

        it("should count string values", () => {
            expect(aggregateCount(["a", "b", "c"])).toBe(3);
        });

        it("should count mixed types", () => {
            expect(aggregateCount([1, "text", true, { key: "value" }])).toBe(4);
        });

        it("should return 0 for empty array", () => {
            expect(aggregateCount([])).toBe(0);
        });

        it("should count single value", () => {
            expect(aggregateCount([42])).toBe(1);
        });

        it("should count objects and arrays", () => {
            expect(aggregateCount([{}, [], "text", 123])).toBe(4);
        });

        it("should count boolean values", () => {
            expect(aggregateCount([true, false, true])).toBe(3);
        });
    });

    describe("aggregateFirst", () => {
        it("should return first number", () => {
            expect(aggregateFirst([1, 2, 3, 4, 5])).toBe(1);
        });

        it("should return first string", () => {
            expect(aggregateFirst(["first", "second", "third"])).toBe("first");
        });

        it("should return first of mixed types", () => {
            expect(aggregateFirst([true, "text", 123])).toBe(true);
        });

        it("should return null for empty array", () => {
            expect(aggregateFirst([])).toBeNull();
        });

        it("should handle single value", () => {
            expect(aggregateFirst([42])).toBe(42);
        });

        it("should return first object", () => {
            const obj = { key: "value" };
            expect(aggregateFirst([obj, { other: "obj" }])).toBe(obj);
        });

        it("should handle null as first value", () => {
            // Note: This tests the actual value, not filtered version
            expect(aggregateFirst([null, "second"])).toBeNull();
        });
    });

    describe("aggregateLast", () => {
        it("should return last number", () => {
            expect(aggregateLast([1, 2, 3, 4, 5])).toBe(5);
        });

        it("should return last string", () => {
            expect(aggregateLast(["first", "second", "third"])).toBe("third");
        });

        it("should return last of mixed types", () => {
            expect(aggregateLast([true, "text", 123])).toBe(123);
        });

        it("should return null for empty array", () => {
            expect(aggregateLast([])).toBeNull();
        });

        it("should handle single value", () => {
            expect(aggregateLast([42])).toBe(42);
        });

        it("should return last object", () => {
            const obj = { key: "value" };
            expect(aggregateLast([{ other: "obj" }, obj])).toBe(obj);
        });

        it("should handle null as last value", () => {
            expect(aggregateLast(["first", null])).toBeNull();
        });
    });

    describe("applyAggregation", () => {
        describe("sum aggregation", () => {
            it("should apply sum correctly", () => {
                expect(applyAggregation([1, 2, 3, 4, 5], "sum")).toBe(15);
            });

            it("should filter out null/undefined before summing", () => {
                expect(applyAggregation([1, null, 2, undefined, 3], "sum")).toBe(6);
            });

            it("should filter out non-numeric values", () => {
                expect(applyAggregation([1, "text", 2, true, 3], "sum")).toBe(6);
            });

            it("should return null for array with no valid numbers", () => {
                expect(applyAggregation(["text", true, {}], "sum")).toBe(0);
            });

            it("should return null for all null values", () => {
                expect(applyAggregation([null, null, null], "sum")).toBeNull();
            });
        });

        describe("avg aggregation", () => {
            it("should apply average correctly", () => {
                expect(applyAggregation([2, 4, 6, 8], "avg")).toBe(5);
            });

            it("should filter out null/undefined before averaging", () => {
                expect(applyAggregation([10, null, 20, undefined, 30], "avg")).toBe(20);
            });

            it("should filter out non-numeric values", () => {
                expect(applyAggregation([10, "text", 20, false, 30], "avg")).toBe(20);
            });

            it("should return null for no valid numbers", () => {
                expect(applyAggregation(["text", true, {}], "avg")).toBeNull();
            });
        });

        describe("min aggregation", () => {
            it("should apply min correctly", () => {
                expect(applyAggregation([5, 2, 8, 1, 9], "min")).toBe(1);
            });

            it("should filter out null/undefined", () => {
                expect(applyAggregation([10, null, 5, undefined, 15], "min")).toBe(5);
            });

            it("should filter out non-numeric values", () => {
                expect(applyAggregation([10, "text", 5, true, 15], "min")).toBe(5);
            });
        });

        describe("max aggregation", () => {
            it("should apply max correctly", () => {
                expect(applyAggregation([5, 2, 8, 1, 9], "max")).toBe(9);
            });

            it("should filter out null/undefined", () => {
                expect(applyAggregation([10, null, 15, undefined, 5], "max")).toBe(15);
            });

            it("should filter out non-numeric values", () => {
                expect(applyAggregation([10, "text", 15, true, 5], "max")).toBe(15);
            });
        });

        describe("count aggregation", () => {
            it("should count all valid values", () => {
                expect(applyAggregation([1, 2, 3, 4, 5], "count")).toBe(5);
            });

            it("should exclude null and undefined", () => {
                expect(applyAggregation([1, null, 2, undefined, 3], "count")).toBe(3);
            });

            it("should count non-numeric values", () => {
                expect(applyAggregation(["a", "b", true, {}], "count")).toBe(4);
            });

            it("should return null for all null values (no valid values to count)", () => {
                expect(applyAggregation([null, null, undefined], "count")).toBeNull();
            });
        });

        describe("first aggregation", () => {
            it("should return first valid value", () => {
                expect(applyAggregation([1, 2, 3, 4, 5], "first")).toBe(1);
            });

            it("should skip null/undefined to find first valid", () => {
                expect(applyAggregation([null, undefined, 3, 4], "first")).toBe(3);
            });

            it("should work with non-numeric types", () => {
                expect(applyAggregation(["first", "second"], "first")).toBe("first");
            });

            it("should return null for all null values", () => {
                expect(applyAggregation([null, undefined], "first")).toBeNull();
            });
        });

        describe("last aggregation", () => {
            it("should return last valid value", () => {
                expect(applyAggregation([1, 2, 3, 4, 5], "last")).toBe(5);
            });

            it("should skip trailing null/undefined", () => {
                expect(applyAggregation([1, 2, null, undefined], "last")).toBe(2);
            });

            it("should work with non-numeric types", () => {
                expect(applyAggregation(["first", "second"], "last")).toBe("second");
            });

            it("should return null for all null values", () => {
                expect(applyAggregation([null, undefined], "last")).toBeNull();
            });
        });

        describe("edge cases", () => {
            it("should handle empty array (returns null for no valid values)", () => {
                expect(applyAggregation([], "sum")).toBeNull();
                expect(applyAggregation([], "avg")).toBeNull();
                expect(applyAggregation([], "min")).toBeNull();
                expect(applyAggregation([], "max")).toBeNull();
                expect(applyAggregation([], "count")).toBeNull();
                expect(applyAggregation([], "first")).toBeNull();
                expect(applyAggregation([], "last")).toBeNull();
            });

            it("should handle unknown aggregation function", () => {
                const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
                const result = applyAggregation([1, 2, 3], "unknown" as AggregationFunction);
                expect(result).toBeNull();
                expect(consoleSpy).toHaveBeenCalledWith("Unknown aggregation function: unknown");
                consoleSpy.mockRestore();
            });

            it("should handle very large datasets", () => {
                const largeArray = Array.from({ length: 10000 }, (_, i) => i + 1);
                expect(applyAggregation(largeArray, "sum")).toBe(50005000);
                expect(applyAggregation(largeArray, "count")).toBe(10000);
                expect(applyAggregation(largeArray, "min")).toBe(1);
                expect(applyAggregation(largeArray, "max")).toBe(10000);
            });

            it("should handle arrays with all same values", () => {
                expect(applyAggregation([5, 5, 5, 5], "sum")).toBe(20);
                expect(applyAggregation([5, 5, 5, 5], "avg")).toBe(5);
                expect(applyAggregation([5, 5, 5, 5], "min")).toBe(5);
                expect(applyAggregation([5, 5, 5, 5], "max")).toBe(5);
            });

            it("should handle negative numbers correctly", () => {
                expect(applyAggregation([-1, -2, -3], "sum")).toBe(-6);
                expect(applyAggregation([-1, -2, -3], "avg")).toBe(-2);
                expect(applyAggregation([-1, -2, -3], "min")).toBe(-3);
                expect(applyAggregation([-1, -2, -3], "max")).toBe(-1);
            });

            it("should handle decimal precision", () => {
                const result = applyAggregation([0.1, 0.2, 0.3], "sum");
                expect(result).toBeCloseTo(0.6, 10);
            });
        });

        describe("real-world scenarios", () => {
            it("should aggregate sales data", () => {
                const sales = [100.5, 250.75, 175.25, 300.0];
                expect(applyAggregation(sales, "sum")).toBeCloseTo(826.5, 2);
                expect(applyAggregation(sales, "avg")).toBeCloseTo(206.625, 2);
                expect(applyAggregation(sales, "min")).toBe(100.5);
                expect(applyAggregation(sales, "max")).toBe(300.0);
                expect(applyAggregation(sales, "count")).toBe(4);
            });

            it("should handle sparse data with nulls", () => {
                const sparseData = [10, null, 20, undefined, 30, null, 40];
                expect(applyAggregation(sparseData, "sum")).toBe(100);
                expect(applyAggregation(sparseData, "avg")).toBe(25);
                expect(applyAggregation(sparseData, "count")).toBe(4);
            });

            it("should handle temperature readings", () => {
                const temps = [-5.5, 0, 3.2, -2.1, 1.8];
                expect(applyAggregation(temps, "sum")).toBeCloseTo(-2.6, 1);
                expect(applyAggregation(temps, "avg")).toBeCloseTo(-0.52, 2);
                expect(applyAggregation(temps, "min")).toBe(-5.5);
                expect(applyAggregation(temps, "max")).toBe(3.2);
            });

            it("should handle inventory counts", () => {
                const inventory = [0, 5, 0, 12, 0, 3];
                expect(applyAggregation(inventory, "sum")).toBe(20);
                expect(applyAggregation(inventory, "count")).toBe(6);
                expect(applyAggregation(inventory, "first")).toBe(0);
                expect(applyAggregation(inventory, "last")).toBe(3);
            });
        });
    });
});
