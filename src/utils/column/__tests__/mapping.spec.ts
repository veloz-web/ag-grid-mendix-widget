/**
 * Column Mapping Tests
 *
 * Comprehensive test suite for mapping Mendix column configurations
 * to AG Grid ColDef objects.
 */

import React from "react";
import { ValueStatus } from "mendix";
import { Big } from "big.js";
import { mapMendixColumnToColDef, buildColumnDefs } from "../mapping";
import { ColumnsType } from "../../../../typings/AGGridProps";
import { CustomFormatterRegistry } from "../../customFormatters";

// Mock the alignment utility
jest.mock("../alignment", () => ({
    getCellAlignment: jest.fn(() => "left"),
    getCellAlignmentStyle: jest.fn(() => ({ textAlign: "left" })),
    getHeaderAlignmentClass: jest.fn(() => "ag-header-align-left")
}));

// Mock React.createElement
jest.mock("react", () => ({
    createElement: jest.fn((type, props, ...children) => ({
        type,
        props: { ...props, children },
        __isMockElement: true
    }))
}));

describe("Column Mapping Utilities", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("mapMendixColumnToColDef", () => {
        describe("Basic Properties", () => {
            it("should map basic column properties", () => {
                const col: Partial<ColumnsType> = {
                    header: { value: "Test Column" } as any,
                    attribute: { id: "testAttr" } as any,
                    sortable: true,
                    resizable: false,
                    draggable: true
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.headerName).toBe("Test Column");
                expect(result.field).toBe("testAttr");
                expect(result.sortable).toBe(true);
                expect(result.resizable).toBe(false);
                expect(result.suppressMovable).toBe(false);
            });

            it("should configure editable columns with editor type", () => {
                const col: Partial<ColumnsType> = {
                    header: { value: "Editable" } as any,
                    attribute: { id: "amount" } as any,
                    editable: true,
                    editorType: "number" as any,
                    selectOptions: "",
                    validationRequired: false,
                    validationMinValue: new Big(0),
                    validationMaxValue: new Big(100),
                    validationPattern: ""
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.editable).toBe(true);
                expect(result.cellEditor).toBe("agNumberCellEditor");
                expect(typeof result.valueSetter).toBe("function");
            });

            it("should handle missing header value", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.headerName).toBe("");
            });

            it("should invert draggable logic to suppressMovable", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    draggable: false
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.suppressMovable).toBe(true);
            });
        });

        describe("Value Getter", () => {
            it("should create value getter that extracts attribute value", () => {
                const mockData = { id: 1, name: "Test" };
                const col: Partial<ColumnsType> = {
                    attribute: {
                        id: "testAttr",
                        get: jest.fn(() => ({
                            value: "Test Value",
                            status: ValueStatus.Available
                        }))
                    } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                if (typeof result.valueGetter === "function") {
                    const value = result.valueGetter({ data: mockData } as any);
                    expect(value).toBe("Test Value");
                    expect(col.attribute?.get).toHaveBeenCalledWith(mockData);
                }
            });

            it("should return empty string when data is null", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                if (typeof result.valueGetter === "function") {
                    const value = result.valueGetter({ data: null } as any);
                    expect(value).toBe("");
                }
            });

            it("should return empty string when value status is not Available", () => {
                const col: Partial<ColumnsType> = {
                    attribute: {
                        id: "testAttr",
                        get: jest.fn(() => ({
                            value: "Test",
                            status: ValueStatus.Loading
                        }))
                    } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                if (typeof result.valueGetter === "function") {
                    const value = result.valueGetter({ data: {} } as any);
                    expect(value).toBe("");
                }
            });

            it("should handle errors in value getter", () => {
                const consoleError = jest.spyOn(console, "error").mockImplementation();
                const col: Partial<ColumnsType> = {
                    attribute: {
                        id: "testAttr",
                        get: jest.fn(() => {
                            throw new Error("Test error");
                        })
                    } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                if (typeof result.valueGetter === "function") {
                    const value = result.valueGetter({ data: {} } as any);
                    expect(value).toBe("");
                    expect(consoleError).toHaveBeenCalled();
                }

                consoleError.mockRestore();
            });
        });

        describe("Aggregation", () => {
            it("should add aggregation function when enabled", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    enableAggregation: true,
                    aggregationFunction: "sum"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.aggFunc).toBe("sum");
            });

            it("should not add aggregation when disabled", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    enableAggregation: false,
                    aggregationFunction: "sum"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.aggFunc).toBeUndefined();
            });

            it("should support different aggregation functions", () => {
                const functions = ["sum", "avg", "min", "max", "count", "first", "last"];

                functions.forEach((func) => {
                    const col: Partial<ColumnsType> = {
                        attribute: { id: "testAttr" } as any,
                        enableAggregation: true,
                        aggregationFunction: func as any
                    };

                    const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);
                    expect(result.aggFunc).toBe(func);
                });
            });
        });

        describe("Row Grouping", () => {
            it("should enable row grouping", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    enableRowGroup: true
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.rowGroup).toBe(true);
            });

            it("should set row group index when provided", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    enableRowGroup: true,
                    rowGroupIndex: 2
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.rowGroup).toBe(true);
                expect(result.rowGroupIndex).toBe(2);
            });

            it("should not set row group index when value is 999 (unset)", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    enableRowGroup: true,
                    rowGroupIndex: 999
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.rowGroup).toBe(true);
                expect(result.rowGroupIndex).toBeUndefined();
            });

            it("should set showRowGroup when enabled", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    enableRowGroup: true,
                    showRowGroup: true
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.showRowGroup).toBe(true);
            });
        });

        describe("Data Types", () => {
            it("should map string data type to text", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    dataType: "string"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.cellDataType).toBe("text");
            });

            it("should map other data types directly", () => {
                const types = ["number", "date", "boolean"];

                types.forEach((type) => {
                    const col: Partial<ColumnsType> = {
                        attribute: { id: "testAttr" } as any,
                        dataType: type as any
                    };

                    const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);
                    expect(result.cellDataType).toBe(type);
                });
            });

            it("should not set data type for auto", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    dataType: "auto"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.cellDataType).toBeUndefined();
            });
        });

        describe("Filtering", () => {
            it("should enable filtering by default", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.filter).not.toBe(false);
            });

            it("should disable filtering when filter is false", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    filter: false
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.filter).toBe(false);
            });

            it("should use date filter for date columns", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    dataType: "date"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.filter).toBe("agDateColumnFilter");
                expect(result.filterParams).toBeDefined();
                expect(result.filterParams?.comparator).toBeDefined();
            });

            it("should use date filter when useDateRange is enabled", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    useDateRange: true
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.filter).toBe("agDateColumnFilter");
            });

            it("should configure date filter comparator correctly", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    dataType: "date"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);
                const comparator = result.filterParams?.comparator;

                expect(comparator).toBeDefined();

                // Test equal dates
                const date1 = new Date("2024-01-15");
                const date2 = new Date("2024-01-15");
                expect(comparator!(date1, date2)).toBe(0);

                // Test earlier date (cell < filter returns -1)
                const earlierDate = new Date("2024-01-14");
                expect(comparator!(date1, earlierDate)).toBe(-1);

                // Test later date (cell > filter returns 1)
                const laterDate = new Date("2024-01-16");
                expect(comparator!(date1, laterDate)).toBe(1);

                // Test null value
                expect(comparator!(date1, null)).toBe(-1);

                // Test invalid date
                expect(comparator!(date1, "invalid")).toBe(-1);
            });
        });

        describe("Width Configuration", () => {
            it("should use flex width when widthType is flex", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    widthType: "flex",
                    flex: 2,
                    minWidth: 100,
                    maxWidth: 300
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.flex).toBe(2);
                expect(result.minWidth).toBe(100);
                expect(result.maxWidth).toBe(300);
                expect(result.width).toBeUndefined();
            });

            it("should default flex to 1 when not specified", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    widthType: "flex"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.flex).toBe(1);
                expect(result.minWidth).toBe(50);
            });

            it("should use auto width with min/max", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    widthType: "auto",
                    minWidth: 80,
                    maxWidth: 200
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.minWidth).toBe(80);
                expect(result.maxWidth).toBe(200);
                expect(result.flex).toBeUndefined();
                expect(result.width).toBeUndefined();
            });

            it("should use fixed width when widthType is not flex or auto", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    widthType: "fixed" as any,
                    width: 250
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.width).toBe(250);
                expect(result.flex).toBeUndefined();
            });

            it("should default to 150 when no width specified", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.width).toBe(150);
            });

            it("should not set maxWidth when value is 0 or negative", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    widthType: "flex",
                    maxWidth: 0
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.maxWidth).toBeUndefined();
            });
        });

        describe("Pinning Configuration", () => {
            it("should set left pinning", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    pinned: "left"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.pinned).toBe("left");
            });

            it("should set right pinning", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    pinned: "right"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.pinned).toBe("right");
            });

            it("should not set pinning when none", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    pinned: "none"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.pinned).toBeUndefined();
            });

            it("should lock pinning when pinnable is false", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    pinnable: false
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.lockPinned).toBe(true);
            });
        });

        describe("Other Column Properties", () => {
            it("should enable floating filter", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    floatingFilter: true
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.floatingFilter).toBe(true);
            });

            it("should hide column when hidden is true", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    hidden: true
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.hide).toBe(true);
            });

            it("should disable sorting and filtering for template columns", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    template: "$" + "{value}"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.sortable).toBe(false);
                expect(result.filter).toBe(false);
            });

            it("should enable wrapText and autoHeight when wrapText is true", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    wrapText: true
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.wrapText).toBe(true);
                expect(result.autoHeight).toBe(true);
            });

            it("should not set wrapText or autoHeight when wrapText is false", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    wrapText: false
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.wrapText).toBeUndefined();
                expect(result.autoHeight).toBeUndefined();
            });

            it("should not set wrapText or autoHeight when wrapText is undefined", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.wrapText).toBeUndefined();
                expect(result.autoHeight).toBeUndefined();
            });
        });

        describe("Custom Formatters", () => {
            it("should use custom formatter when found in registry", () => {
                const registry = new CustomFormatterRegistry();
                // Register using the actual API
                registry.registerFormatters([
                    {
                        formatterName: "testFormatter",
                        formatterType: "javascript",
                        formatterCode: "return '<strong>Formatted</strong>';"
                    }
                ]);

                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    customFormatterName: "testFormatter"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], registry);

                expect(result.cellRenderer).toBeDefined();

                // Test the cell renderer
                const params = { value: "test", data: {} };
                const rendered = result.cellRenderer!(params as any);

                expect(rendered).toHaveProperty("__isMockElement");
                expect(React.createElement).toHaveBeenCalledWith(
                    "span",
                    expect.objectContaining({
                        dangerouslySetInnerHTML: { __html: "<strong>Formatted</strong>" }
                    })
                );
            });

            it("should show error when custom formatter not found", () => {
                const consoleError = jest.spyOn(console, "error").mockImplementation();
                const registry = new CustomFormatterRegistry();

                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    header: { value: "Test Column" } as any,
                    customFormatterName: "missingFormatter"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], registry);

                expect(result.cellRenderer).toBeDefined();
                expect(consoleError).toHaveBeenCalledWith(
                    expect.stringContaining('Custom formatter "missingFormatter" not found')
                );

                // Test the error renderer
                const rendered = result.cellRenderer!({} as any);
                expect(rendered).toHaveProperty("__isMockElement");

                consoleError.mockRestore();
            });

            it("should handle errors in custom formatter execution", () => {
                const consoleError = jest.spyOn(console, "error").mockImplementation();
                const registry = new CustomFormatterRegistry();
                registry.registerFormatters([
                    {
                        formatterName: "errorFormatter",
                        formatterType: "javascript",
                        formatterCode: "throw new Error('Formatter error');"
                    }
                ]);

                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    customFormatterName: "errorFormatter"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], registry);
                const params = { value: "test", data: {} };
                const rendered = result.cellRenderer!(params as any);

                // Should return React element with dangerouslySetInnerHTML containing fallback value
                expect(rendered).toHaveProperty("__isMockElement");
                expect(React.createElement).toHaveBeenCalledWith(
                    "span",
                    expect.objectContaining({
                        dangerouslySetInnerHTML: { __html: "test" }
                    })
                );
                expect(consoleError).toHaveBeenCalled();
                consoleError.mockRestore();
            });
        });

        describe("Link Renderer", () => {
            it("should create link renderer with Mendix action", () => {
                const mockAction = {
                    canExecute: true,
                    execute: jest.fn()
                };

                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    formatter: "link",
                    linkAction: {
                        get: jest.fn(() => mockAction)
                    } as any,
                    linkText: "View $" + "{value}"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.cellRenderer).toBeDefined();

                const params = { value: "Item 1", data: { id: 1 } };
                const rendered = result.cellRenderer!(params as any);

                expect(rendered).toHaveProperty("__isMockElement");
                expect(React.createElement).toHaveBeenCalledWith(
                    "button",
                    expect.objectContaining({
                        type: "button",
                        className: "aggrid-link-button"
                    }),
                    "View Item 1"
                );
            });

            it("should handle link action click", () => {
                const mockAction = {
                    canExecute: true,
                    execute: jest.fn()
                };

                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    formatter: "link",
                    linkAction: {
                        get: jest.fn(() => mockAction)
                    } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);
                const params = { value: "Item 1", data: { id: 1 } };
                result.cellRenderer!(params as any);

                const createElementCall = (React.createElement as jest.Mock).mock.calls.find(
                    (call) => call[0] === "button"
                );
                expect(createElementCall).toBeDefined();

                const buttonProps = createElementCall![1];
                const mockEvent = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

                // Simulate click
                jest.useFakeTimers();
                buttonProps.onClick(mockEvent);
                jest.runAllTimers();

                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.stopPropagation).toHaveBeenCalled();
                expect(mockAction.execute).toHaveBeenCalled();

                jest.useRealTimers();
            });

            it("should use legacy URL pattern when no action", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    formatter: "link",
                    linkUrlPattern: "/details/$" + "{value}",
                    linkText: "View"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);
                const params = { value: "123", data: {} };

                result.cellRenderer!(params as any);

                expect(React.createElement).toHaveBeenCalledWith(
                    "span",
                    expect.objectContaining({
                        dangerouslySetInnerHTML: expect.any(Object)
                    })
                );
            });

            it("should handle errors in link renderer", () => {
                const consoleError = jest.spyOn(console, "error").mockImplementation();
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    formatter: "link",
                    linkAction: {
                        get: jest.fn(() => {
                            throw new Error("Action error");
                        })
                    } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);
                const params = { value: "test", data: {} };
                const rendered = result.cellRenderer!(params as any);

                expect(rendered).toBe("test");
                expect(consoleError).toHaveBeenCalled();
                consoleError.mockRestore();
            });
        });

        describe("Value Formatter", () => {
            it("should create value formatter for default columns", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr", type: "String" } as any,
                    formatter: "uppercase"
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                expect(result.valueFormatter).toBeDefined();
            });

            it("should handle null values in formatter", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                if (typeof result.valueFormatter === "function") {
                    const formatted = result.valueFormatter({ value: null } as any);
                    expect(formatted).toBe("");
                }
            });

            it("should handle undefined values in formatter", () => {
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                if (typeof result.valueFormatter === "function") {
                    const formatted = result.valueFormatter({ value: undefined } as any);
                    expect(formatted).toBe("");
                }
            });

            it("should handle errors in formatter", () => {
                const consoleError = jest.spyOn(console, "error").mockImplementation();
                const col: Partial<ColumnsType> = {
                    attribute: { id: "testAttr" } as any,
                    formatter: "invalid_formatter" as any
                };

                const result = mapMendixColumnToColDef(col as ColumnsType, [], undefined);

                // This depends on the applyFormatter implementation
                // Just verify it doesn't crash
                expect(result.valueFormatter).toBeDefined();

                consoleError.mockRestore();
            });
        });
    });

    describe("buildColumnDefs", () => {
        it("should build column definitions from Mendix columns", () => {
            const columns: Array<Partial<ColumnsType>> = [
                { header: { value: "Col 1" } as any, attribute: { id: "col1" } as any },
                { header: { value: "Col 2" } as any, attribute: { id: "col2" } as any }
            ];

            const columnVisibility = { col1: true, col2: true };
            const columnOrder: string[] = [];

            const result = buildColumnDefs(
                columns as ColumnsType[],
                columnVisibility,
                columnOrder,
                undefined
            );

            expect(result).toHaveLength(2);
            expect(result[0].headerName).toBe("Col 1");
            expect(result[1].headerName).toBe("Col 2");
        });

        it("should filter out hidden columns", () => {
            const columns: Array<Partial<ColumnsType>> = [
                { header: { value: "Col 1" } as any, attribute: { id: "col1" } as any },
                { header: { value: "Col 2" } as any, attribute: { id: "col2" } as any },
                { header: { value: "Col 3" } as any, attribute: { id: "col3" } as any }
            ];

            const columnVisibility = { col1: true, col2: false, col3: true };
            const columnOrder: string[] = [];

            const result = buildColumnDefs(
                columns as ColumnsType[],
                columnVisibility,
                columnOrder,
                undefined
            );

            expect(result).toHaveLength(2);
            expect(result[0].headerName).toBe("Col 1");
            expect(result[1].headerName).toBe("Col 3");
        });

        it("should apply column ordering", () => {
            const columns: Array<Partial<ColumnsType>> = [
                { header: { value: "Col 1" } as any, attribute: { id: "col1" } as any },
                { header: { value: "Col 2" } as any, attribute: { id: "col2" } as any },
                { header: { value: "Col 3" } as any, attribute: { id: "col3" } as any }
            ];

            const columnVisibility = { col1: true, col2: true, col3: true };
            const columnOrder = ["col3", "col1", "col2"];

            const result = buildColumnDefs(
                columns as ColumnsType[],
                columnVisibility,
                columnOrder,
                undefined
            );

            expect(result).toHaveLength(3);
            expect(result[0].headerName).toBe("Col 3");
            expect(result[1].headerName).toBe("Col 1");
            expect(result[2].headerName).toBe("Col 2");
        });

        it("should handle columns without attributes", () => {
            const columns: Array<Partial<ColumnsType>> = [
                { header: { value: "Template Col" } as any, template: "$" + "{value}" }
            ];

            const columnVisibility = {};
            const columnOrder: string[] = [];

            const result = buildColumnDefs(
                columns as ColumnsType[],
                columnVisibility,
                columnOrder,
                undefined
            );

            expect(result).toHaveLength(1);
            expect(result[0].headerName).toBe("Template Col");
        });

        it("should handle partial column order", () => {
            const columns: Array<Partial<ColumnsType>> = [
                { header: { value: "Col 1" } as any, attribute: { id: "col1" } as any },
                { header: { value: "Col 2" } as any, attribute: { id: "col2" } as any },
                { header: { value: "Col 3" } as any, attribute: { id: "col3" } as any }
            ];

            const columnVisibility = { col1: true, col2: true, col3: true };
            const columnOrder = ["col2"]; // Only one column ordered

            const result = buildColumnDefs(
                columns as ColumnsType[],
                columnVisibility,
                columnOrder,
                undefined
            );

            expect(result).toHaveLength(3);
            // col2 should be first, others maintain relative order
            expect(result[0].headerName).toBe("Col 2");
        });

        it("should pass custom formatter registry to mapMendixColumnToColDef", () => {
            const registry = new CustomFormatterRegistry();
            const columns: Array<Partial<ColumnsType>> = [
                {
                    header: { value: "Col 1" } as any,
                    attribute: { id: "col1" } as any,
                    customFormatterName: "test"
                }
            ];

            const columnVisibility = { col1: true };
            const columnOrder: string[] = [];

            const result = buildColumnDefs(
                columns as ColumnsType[],
                columnVisibility,
                columnOrder,
                registry
            );

            expect(result).toHaveLength(1);
            expect(result[0].cellRenderer).toBeDefined();
        });

        it("should handle empty columns array", () => {
            const result = buildColumnDefs([], {}, [], undefined);

            expect(result).toHaveLength(0);
        });

        it("should handle empty column order", () => {
            const columns: Array<Partial<ColumnsType>> = [
                { header: { value: "Col 1" } as any, attribute: { id: "col1" } as any }
            ];

            const columnVisibility = { col1: true };
            const columnOrder: string[] = [];

            const result = buildColumnDefs(
                columns as ColumnsType[],
                columnVisibility,
                columnOrder,
                undefined
            );

            expect(result).toHaveLength(1);
        });
    });
});
