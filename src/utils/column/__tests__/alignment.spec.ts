// src/utils/column/__tests__/alignment.spec.ts
/**
 * Comprehensive tests for column alignment utilities
 * Tests alignment detection based on data types, formatters, and explicit settings
 */

import {
    getCellAlignment,
    getHeaderAlignmentClass,
    getCellAlignmentStyle,
    CellAlignment
} from "../alignment";
import { ColumnsType } from "../../../columnTypes";

describe("Column Alignment Utilities", () => {
    describe("getCellAlignment", () => {
        describe("Explicit Alignment", () => {
            it("should use explicit left alignment", () => {
                const col = {
                    alignment: "left",
                    attribute: { type: "Integer" } // Would normally be right
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should use explicit right alignment", () => {
                const col = {
                    alignment: "right",
                    attribute: { type: "String" } // Would normally be left
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should use explicit center alignment", () => {
                const col = {
                    alignment: "center",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("center");
            });

            it("should ignore auto alignment and use other logic", () => {
                const col = {
                    alignment: "auto",
                    attribute: { type: "Integer" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });
        });

        describe("Explicit Data Type", () => {
            it("should right-align number data type", () => {
                const col = {
                    dataType: "number",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align date data type", () => {
                const col = {
                    dataType: "date",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should center-align boolean data type", () => {
                const col = {
                    dataType: "boolean",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("center");
            });

            it("should ignore auto data type and use attribute type", () => {
                const col = {
                    dataType: "auto",
                    attribute: { type: "Integer" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should prefer explicit data type over attribute type", () => {
                const col = {
                    dataType: "number",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });
        });

        describe("Formatter-based Alignment", () => {
            it("should center-align link formatter", () => {
                const col = {
                    formatter: "link",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("center");
            });

            it("should right-align currency formatter", () => {
                const col = {
                    formatter: "currency",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align currencyEUR formatter", () => {
                const col = {
                    formatter: "currencyEUR",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align currencyGBP formatter", () => {
                const col = {
                    formatter: "currencyGBP",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align percentage formatter", () => {
                const col = {
                    formatter: "percentage",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align number formatter", () => {
                const col = {
                    formatter: "number",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align decimal2 formatter", () => {
                const col = {
                    formatter: "decimal2",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align date formatters", () => {
                const dateFormatters = ["date", "dateTime", "dateShort", "dateLong", "dateCustom"];

                dateFormatters.forEach((formatter) => {
                    const col = {
                        formatter,
                        attribute: { type: "String" }
                    } as ColumnsType;

                    expect(getCellAlignment(col)).toBe("right");
                });
            });

            it("should right-align time formatter", () => {
                const col = {
                    formatter: "time",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should left-align none formatter", () => {
                const col = {
                    formatter: "none",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });
        });

        describe("Attribute Type-based Alignment", () => {
            it("should right-align Integer type", () => {
                const col = {
                    attribute: { type: "Integer" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align Long type", () => {
                const col = {
                    attribute: { type: "Long" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align Decimal type", () => {
                const col = {
                    attribute: { type: "Decimal" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should right-align DateTime type", () => {
                const col = {
                    attribute: { type: "DateTime" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should left-align String type", () => {
                const col = {
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should left-align Boolean type", () => {
                const col = {
                    attribute: { type: "Boolean" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should left-align unknown types", () => {
                const col = {
                    attribute: { type: "CustomType" as any }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });
        });

        describe("Priority and Precedence", () => {
            it("should prioritize explicit alignment over data type", () => {
                const col = {
                    alignment: "left",
                    dataType: "number"
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should prioritize explicit alignment over formatter", () => {
                const col = {
                    alignment: "left",
                    formatter: "currency"
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should prioritize explicit alignment over attribute type", () => {
                const col = {
                    alignment: "left",
                    attribute: { type: "Integer" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should prioritize data type over formatter", () => {
                const col = {
                    dataType: "boolean",
                    formatter: "currency"
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("center");
            });

            it("should prioritize data type over attribute type", () => {
                const col = {
                    dataType: "boolean",
                    attribute: { type: "Integer" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("center");
            });

            it("should prioritize formatter over attribute type", () => {
                const col = {
                    formatter: "link",
                    attribute: { type: "Integer" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("center");
            });
        });

        describe("Default and Edge Cases", () => {
            it("should default to left when no configuration", () => {
                const col = {} as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should default to left when attribute is missing", () => {
                const col = {
                    formatter: "none"
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should handle missing formatter", () => {
                const col = {
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should handle empty attribute type", () => {
                const col = {
                    attribute: { type: "" as any }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should handle null values", () => {
                const col = {
                    alignment: null,
                    dataType: null,
                    formatter: null,
                    attribute: null
                } as any;

                expect(getCellAlignment(col)).toBe("left");
            });

            it("should handle undefined values", () => {
                const col = {
                    alignment: undefined,
                    dataType: undefined,
                    formatter: undefined,
                    attribute: undefined
                } as any;

                expect(getCellAlignment(col)).toBe("left");
            });
        });

        describe("Complex Scenarios", () => {
            it("should handle column with all properties set", () => {
                const col = {
                    alignment: "center",
                    dataType: "number",
                    formatter: "currency",
                    attribute: { type: "String" }
                } as ColumnsType;

                // Explicit alignment wins
                expect(getCellAlignment(col)).toBe("center");
            });

            it("should handle auto alignment with number attribute", () => {
                const col = {
                    alignment: "auto",
                    attribute: { type: "Decimal" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should handle auto data type with date formatter", () => {
                const col = {
                    dataType: "auto",
                    formatter: "dateTime",
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("right");
            });

            it("should handle custom formatters", () => {
                const col = {
                    formatter: "customFormatter" as any,
                    attribute: { type: "String" }
                } as ColumnsType;

                expect(getCellAlignment(col)).toBe("left");
            });
        });
    });

    describe("getHeaderAlignmentClass", () => {
        it("should return class for left alignment", () => {
            expect(getHeaderAlignmentClass("left")).toBe("ag-header-cell-left");
        });

        it("should return class for center alignment", () => {
            expect(getHeaderAlignmentClass("center")).toBe("ag-header-cell-center");
        });

        it("should return class for right alignment", () => {
            expect(getHeaderAlignmentClass("right")).toBe("ag-header-cell-right");
        });

        it("should handle all alignment types", () => {
            const alignments: CellAlignment[] = ["left", "center", "right"];

            alignments.forEach((alignment) => {
                const className = getHeaderAlignmentClass(alignment);
                expect(className).toBe(`ag-header-cell-${alignment}`);
                expect(className).toContain("ag-header-cell-");
            });
        });
    });

    describe("getCellAlignmentStyle", () => {
        it("should return style object for left alignment", () => {
            expect(getCellAlignmentStyle("left")).toEqual({ textAlign: "left" });
        });

        it("should return style object for center alignment", () => {
            expect(getCellAlignmentStyle("center")).toEqual({ textAlign: "center" });
        });

        it("should return style object for right alignment", () => {
            expect(getCellAlignmentStyle("right")).toEqual({ textAlign: "right" });
        });

        it("should handle all alignment types", () => {
            const alignments: CellAlignment[] = ["left", "center", "right"];

            alignments.forEach((alignment) => {
                const style = getCellAlignmentStyle(alignment);
                expect(style).toHaveProperty("textAlign");
                expect(style.textAlign).toBe(alignment);
            });
        });

        it("should return object with single property", () => {
            const style = getCellAlignmentStyle("center");
            expect(Object.keys(style)).toEqual(["textAlign"]);
        });
    });

    describe("Integration Tests", () => {
        it("should work together for complete column configuration", () => {
            const col = {
                formatter: "currency",
                attribute: { type: "Decimal" }
            } as ColumnsType;

            const alignment = getCellAlignment(col);
            const headerClass = getHeaderAlignmentClass(alignment);
            const cellStyle = getCellAlignmentStyle(alignment);

            expect(alignment).toBe("right");
            expect(headerClass).toBe("ag-header-cell-right");
            expect(cellStyle).toEqual({ textAlign: "right" });
        });

        it("should handle link columns consistently", () => {
            const col = {
                formatter: "link",
                attribute: { type: "String" }
            } as ColumnsType;

            const alignment = getCellAlignment(col);
            const headerClass = getHeaderAlignmentClass(alignment);
            const cellStyle = getCellAlignmentStyle(alignment);

            expect(alignment).toBe("center");
            expect(headerClass).toBe("ag-header-cell-center");
            expect(cellStyle).toEqual({ textAlign: "center" });
        });

        it("should handle explicit overrides consistently", () => {
            const col = {
                alignment: "left",
                formatter: "currency",
                attribute: { type: "Decimal" }
            } as ColumnsType;

            const alignment = getCellAlignment(col);
            const headerClass = getHeaderAlignmentClass(alignment);
            const cellStyle = getCellAlignmentStyle(alignment);

            expect(alignment).toBe("left");
            expect(headerClass).toBe("ag-header-cell-left");
            expect(cellStyle).toEqual({ textAlign: "left" });
        });

        it("should handle default text columns consistently", () => {
            const col = {
                attribute: { type: "String" }
            } as ColumnsType;

            const alignment = getCellAlignment(col);
            const headerClass = getHeaderAlignmentClass(alignment);
            const cellStyle = getCellAlignmentStyle(alignment);

            expect(alignment).toBe("left");
            expect(headerClass).toBe("ag-header-cell-left");
            expect(cellStyle).toEqual({ textAlign: "left" });
        });
    });
});
