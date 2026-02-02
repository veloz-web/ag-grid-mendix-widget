// src/utils/aggregation/__tests__/calculator.spec.ts
/**
 * Comprehensive tests for aggregation calculator
 * Tests pinned bottom row, group aggregations, and server-side aggregations
 */

import { ValueStatus } from "mendix";
import {
    calculatePinnedBottomRow,
    calculateGroupAggregations,
    calculateServerSideAggregations,
    AggregationConfig
} from "../calculator";
import * as aggregationFunctions from "../functions";

// Mock the aggregation functions
jest.mock("../functions");

const mockApplyAggregation = aggregationFunctions.applyAggregation as jest.MockedFunction<
    typeof aggregationFunctions.applyAggregation
>;

describe("Aggregation Calculator", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("calculatePinnedBottomRow", () => {
        const mockColumns = [
            {
                attribute: {
                    id: "amount",
                    get: jest.fn()
                },
                enableAggregation: true,
                aggregationFunction: "sum"
            },
            {
                attribute: {
                    id: "quantity",
                    get: jest.fn()
                },
                enableAggregation: true,
                aggregationFunction: "avg"
            },
            {
                attribute: {
                    id: "name",
                    get: jest.fn()
                },
                enableAggregation: false
            }
        ] as any[];

        const mockRowData = [
            { id: 1, amount: 100, quantity: 5 },
            { id: 2, amount: 200, quantity: 10 },
            { id: 3, amount: 150, quantity: 7 }
        ];

        describe("Basic Functionality", () => {
            it("should calculate aggregations for enabled columns", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: mockColumns,
                    rowData: mockRowData
                };

                // Mock column value extraction
                mockColumns[0].attribute.get.mockImplementation((item) => ({
                    status: ValueStatus.Available,
                    value: item.amount
                }));

                mockColumns[1].attribute.get.mockImplementation((item) => ({
                    status: ValueStatus.Available,
                    value: item.quantity
                }));

                // Mock aggregation results
                mockApplyAggregation
                    .mockReturnValueOnce(450) // sum of amounts
                    .mockReturnValueOnce(7.33); // avg of quantities

                const result = calculatePinnedBottomRow(config);

                expect(result).toEqual([
                    {
                        amount: 450,
                        quantity: 7.33
                    }
                ]);

                expect(mockApplyAggregation).toHaveBeenCalledTimes(2);
                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 200, 150], "sum");
                expect(mockApplyAggregation).toHaveBeenCalledWith([5, 10, 7], "avg");
            });

            it("should return single-element array with aggregation row", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [mockColumns[0]],
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 100
                });

                mockApplyAggregation.mockReturnValue(300);

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(1);
                expect(result![0]).toHaveProperty("amount");
            });

            it("should skip columns without aggregation enabled", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: mockColumns,
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 100
                });

                mockColumns[1].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 5
                });

                mockApplyAggregation.mockReturnValue(100);

                const result = calculatePinnedBottomRow(config);

                // Should not include 'name' column (enableAggregation: false)
                expect(result![0]).not.toHaveProperty("name");
            });
        });

        describe("Feature Flag", () => {
            it("should return undefined when footer is disabled", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: false,
                    columns: mockColumns,
                    rowData: mockRowData
                };

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeUndefined();
                expect(mockApplyAggregation).not.toHaveBeenCalled();
            });

            it("should return undefined when no row data", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: mockColumns,
                    rowData: []
                };

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeUndefined();
            });

            it("should return undefined when row data is null", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: mockColumns,
                    rowData: null as any
                };

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeUndefined();
            });

            it("should return undefined when no columns have aggregation enabled", () => {
                const columnsWithoutAgg = [
                    {
                        attribute: { id: "name", get: jest.fn() },
                        enableAggregation: false
                    }
                ] as any[];

                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: columnsWithoutAgg,
                    rowData: mockRowData
                };

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeUndefined();
            });
        });

        describe("Value Extraction", () => {
            it("should filter out null values", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [mockColumns[0]],
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 100 })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: null })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 150 });

                mockApplyAggregation.mockReturnValue(250);

                calculatePinnedBottomRow(config);

                // Should only pass non-null values
                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 150], "sum");
            });

            it("should filter out undefined values", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [mockColumns[0]],
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 100 })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: undefined })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 150 });

                mockApplyAggregation.mockReturnValue(250);

                calculatePinnedBottomRow(config);

                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 150], "sum");
            });

            it("should handle unavailable values", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [mockColumns[0]],
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 100 })
                    .mockReturnValueOnce({ status: ValueStatus.Unavailable })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 150 });

                mockApplyAggregation.mockReturnValue(250);

                calculatePinnedBottomRow(config);

                // Should only use available values
                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 150], "sum");
            });

            it("should handle loading values", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [mockColumns[0]],
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 100 })
                    .mockReturnValueOnce({ status: ValueStatus.Loading })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 150 });

                mockApplyAggregation.mockReturnValue(250);

                calculatePinnedBottomRow(config);

                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 150], "sum");
            });

            it("should return empty array for column without attribute", () => {
                const columnWithoutAttr = [
                    {
                        enableAggregation: true,
                        aggregationFunction: "sum"
                    }
                ] as any[];

                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: columnWithoutAttr,
                    rowData: mockRowData
                };

                mockApplyAggregation.mockReturnValue(0);

                const result = calculatePinnedBottomRow(config);

                // Column without attribute should result in no aggregations
                expect(result).toBeUndefined();
                expect(mockApplyAggregation).not.toHaveBeenCalled();
            });
        });

        describe("Aggregation Functions", () => {
            it("should support sum aggregation", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [mockColumns[0]],
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 100
                });

                mockApplyAggregation.mockReturnValue(300);

                calculatePinnedBottomRow(config);

                expect(mockApplyAggregation).toHaveBeenCalledWith(expect.any(Array), "sum");
            });

            it("should support avg aggregation", () => {
                const avgColumn = {
                    ...mockColumns[1],
                    aggregationFunction: "avg"
                };

                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [avgColumn],
                    rowData: mockRowData
                };

                avgColumn.attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 10
                });

                mockApplyAggregation.mockReturnValue(10);

                calculatePinnedBottomRow(config);

                expect(mockApplyAggregation).toHaveBeenCalledWith(expect.any(Array), "avg");
            });

            it("should support multiple different aggregation functions", () => {
                const multiColumns = [
                    {
                        attribute: { id: "col1", get: jest.fn() },
                        enableAggregation: true,
                        aggregationFunction: "sum"
                    },
                    {
                        attribute: { id: "col2", get: jest.fn() },
                        enableAggregation: true,
                        aggregationFunction: "min"
                    },
                    {
                        attribute: { id: "col3", get: jest.fn() },
                        enableAggregation: true,
                        aggregationFunction: "max"
                    }
                ] as any[];

                multiColumns.forEach((col) => {
                    col.attribute.get.mockReturnValue({
                        status: ValueStatus.Available,
                        value: 100
                    });
                });

                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: multiColumns,
                    rowData: mockRowData
                };

                mockApplyAggregation.mockReturnValue(100);

                calculatePinnedBottomRow(config);

                expect(mockApplyAggregation).toHaveBeenNthCalledWith(1, expect.any(Array), "sum");
                expect(mockApplyAggregation).toHaveBeenNthCalledWith(2, expect.any(Array), "min");
                expect(mockApplyAggregation).toHaveBeenNthCalledWith(3, expect.any(Array), "max");
            });
        });

        describe("Edge Cases", () => {
            it("should handle empty columns array", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [],
                    rowData: mockRowData
                };

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeUndefined();
            });

            it("should handle columns missing aggregation function", () => {
                const incompleteColumn = [
                    {
                        attribute: { id: "amount", get: jest.fn() },
                        enableAggregation: true
                        // Missing aggregationFunction
                    }
                ] as any[];

                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: incompleteColumn,
                    rowData: mockRowData
                };

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeUndefined();
            });

            it("should handle columns missing attribute id", () => {
                const columnWithoutId = [
                    {
                        attribute: { get: jest.fn() },
                        enableAggregation: true,
                        aggregationFunction: "sum"
                    }
                ] as any[];

                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: columnWithoutId,
                    rowData: mockRowData
                };

                const result = calculatePinnedBottomRow(config);

                expect(result).toBeUndefined();
            });

            it("should handle all values being filtered out", () => {
                const config: AggregationConfig = {
                    enableAggregationFooter: true,
                    columns: [mockColumns[0]],
                    rowData: mockRowData
                };

                mockColumns[0].attribute.get.mockReturnValue({
                    status: ValueStatus.Unavailable
                });

                mockApplyAggregation.mockReturnValue(0);

                const result = calculatePinnedBottomRow(config);

                // Should call aggregation with empty array
                expect(mockApplyAggregation).toHaveBeenCalledWith([], "sum");
                expect(result).toEqual([{ amount: 0 }]);
            });
        });
    });

    describe("calculateGroupAggregations", () => {
        const mockColumns = [
            {
                attribute: {
                    id: "sales",
                    get: jest.fn()
                },
                enableAggregation: true,
                aggregationFunction: "sum"
            },
            {
                attribute: {
                    id: "count",
                    get: jest.fn()
                },
                enableAggregation: true,
                aggregationFunction: "count"
            },
            {
                attribute: {
                    id: "name",
                    get: jest.fn()
                },
                enableAggregation: false
            }
        ] as any[];

        const mockGroupData = [
            { id: 1, sales: 100 },
            { id: 2, sales: 200 },
            { id: 3, sales: 150 }
        ];

        describe("Basic Functionality", () => {
            it("should calculate aggregations for group data", () => {
                mockColumns[0].attribute.get.mockImplementation((item) => ({
                    status: ValueStatus.Available,
                    value: item.sales
                }));

                mockColumns[1].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 1
                });

                mockApplyAggregation.mockReturnValueOnce(450).mockReturnValueOnce(3);

                const result = calculateGroupAggregations(mockGroupData, mockColumns);

                expect(result).toEqual({
                    sales: 450,
                    count: 3
                });

                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 200, 150], "sum");
                expect(mockApplyAggregation).toHaveBeenCalledWith([1, 1, 1], "count");
            });

            it("should return object with aggregation results", () => {
                mockColumns[0].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 100
                });

                mockApplyAggregation.mockReturnValue(300);

                const result = calculateGroupAggregations(mockGroupData, mockColumns);

                expect(typeof result).toBe("object");
                expect(result).toHaveProperty("sales");
            });

            it("should skip columns without aggregation enabled", () => {
                mockColumns[0].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 100
                });

                mockColumns[1].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 1
                });

                mockApplyAggregation.mockReturnValue(100);

                const result = calculateGroupAggregations(mockGroupData, mockColumns);

                expect(result).not.toHaveProperty("name");
            });
        });

        describe("Empty and Edge Cases", () => {
            it("should handle empty group data", () => {
                mockColumns[0].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 100
                });

                mockColumns[1].attribute.get.mockReturnValue({
                    status: ValueStatus.Available,
                    value: 1
                });

                mockApplyAggregation.mockReturnValue(0);

                const result = calculateGroupAggregations([], mockColumns);

                // With empty data, should still call aggregations but with empty arrays
                expect(mockApplyAggregation).toHaveBeenCalledWith([], "sum");
                expect(mockApplyAggregation).toHaveBeenCalledWith([], "count");
                expect(result).toEqual({
                    sales: 0,
                    count: 0
                });
            });

            it("should handle empty columns array", () => {
                const result = calculateGroupAggregations(mockGroupData, []);

                expect(result).toEqual({});
                expect(mockApplyAggregation).not.toHaveBeenCalled();
            });

            it("should handle columns without aggregation function", () => {
                const incompleteColumns = [
                    {
                        attribute: { id: "sales", get: jest.fn() },
                        enableAggregation: true
                    }
                ] as any[];

                const result = calculateGroupAggregations(mockGroupData, incompleteColumns);

                expect(result).toEqual({});
            });

            it("should return empty object when no columns have aggregation", () => {
                const noAggColumns = [
                    {
                        attribute: { id: "name", get: jest.fn() },
                        enableAggregation: false
                    }
                ] as any[];

                const result = calculateGroupAggregations(mockGroupData, noAggColumns);

                expect(result).toEqual({});
            });
        });

        describe("Value Extraction", () => {
            it("should filter null values in group data", () => {
                mockColumns[0].attribute.get
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 100 })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: null })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 150 });

                mockApplyAggregation.mockReturnValue(250);

                calculateGroupAggregations(mockGroupData, [mockColumns[0]]);

                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 150], "sum");
            });

            it("should filter unavailable values in group data", () => {
                mockColumns[0].attribute.get
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 100 })
                    .mockReturnValueOnce({ status: ValueStatus.Unavailable })
                    .mockReturnValueOnce({ status: ValueStatus.Available, value: 150 });

                mockApplyAggregation.mockReturnValue(250);

                calculateGroupAggregations(mockGroupData, [mockColumns[0]]);

                expect(mockApplyAggregation).toHaveBeenCalledWith([100, 150], "sum");
            });
        });

        describe("Multiple Aggregations", () => {
            it("should handle multiple aggregation types in one call", () => {
                const multiAggColumns = [
                    {
                        attribute: { id: "col1", get: jest.fn() },
                        enableAggregation: true,
                        aggregationFunction: "sum"
                    },
                    {
                        attribute: { id: "col2", get: jest.fn() },
                        enableAggregation: true,
                        aggregationFunction: "avg"
                    },
                    {
                        attribute: { id: "col3", get: jest.fn() },
                        enableAggregation: true,
                        aggregationFunction: "count"
                    }
                ] as any[];

                multiAggColumns.forEach((col) => {
                    col.attribute.get.mockReturnValue({
                        status: ValueStatus.Available,
                        value: 100
                    });
                });

                mockApplyAggregation.mockReturnValue(100);

                const result = calculateGroupAggregations(mockGroupData, multiAggColumns);

                expect(result).toEqual({
                    col1: 100,
                    col2: 100,
                    col3: 100
                });

                expect(mockApplyAggregation).toHaveBeenCalledTimes(3);
            });
        });
    });

    describe("calculateServerSideAggregations", () => {
        it("should log warning for unimplemented feature", async () => {
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

            await calculateServerSideAggregations("MyMicroflow", [], []);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "Server-side aggregations not yet implemented. Microflow:",
                "MyMicroflow"
            );

            consoleWarnSpy.mockRestore();
        });

        it("should return null", async () => {
            jest.spyOn(console, "warn").mockImplementation();

            const result = await calculateServerSideAggregations("MyMicroflow", [], []);

            expect(result).toBeNull();
        });

        it("should accept microflow name parameter", async () => {
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

            await calculateServerSideAggregations("CustomMicroflow", [], []);

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.any(String), "CustomMicroflow");

            consoleWarnSpy.mockRestore();
        });

        it("should be async function", () => {
            const result = calculateServerSideAggregations("Test", [], []);

            expect(result).toBeInstanceOf(Promise);
        });
    });
});
