import {
    getColumnDataType,
    inferTypeFromValues,
    formatDateValue,
    parseValueForSorting,
    sortDistinctValues
} from "../filterUtils";

// Mocking the ColumnsType interface structure for tests
// We don't need the full real interface, just the parts the functions touch.
const mockColumn = (overrides: any = {}) => ({
    header: { value: "Test Column" },
    attribute: { type: "String", ...overrides.attribute },
    ...overrides
});

describe("filterUtils", () => {
    describe("getColumnDataType", () => {
        it("returns explicit dataType when provided", () => {
            const col = mockColumn({ dataType: "date" });
            expect(getColumnDataType(col as any)).toBe("date");
        });

        it("returns 'string' when explicit dataType is 'string'", () => {
            const col = mockColumn({ dataType: "string" });
            expect(getColumnDataType(col as any)).toBe("string");
        });

        it("infers 'date' from formatter", () => {
            const col = mockColumn({ formatter: "dateShort" });
            expect(getColumnDataType(col as any)).toBe("date");
        });

        it("infers 'number' from formatter", () => {
            const col = mockColumn({ formatter: "currency" });
            expect(getColumnDataType(col as any)).toBe("number");
        });

        it("infers 'boolean' from formatter", () => {
            const col = mockColumn({ formatter: "yesNo" });
            expect(getColumnDataType(col as any)).toBe("boolean");
        });

        it("infers types from Mendix attribute types when no formatter/explicit type exists", () => {
            expect(getColumnDataType(mockColumn({ attribute: { type: "DateTime" } }) as any)).toBe(
                "date"
            );
            expect(getColumnDataType(mockColumn({ attribute: { type: "Integer" } }) as any)).toBe(
                "number"
            );
            expect(getColumnDataType(mockColumn({ attribute: { type: "Decimal" } }) as any)).toBe(
                "number"
            );
            expect(getColumnDataType(mockColumn({ attribute: { type: "Boolean" } }) as any)).toBe(
                "boolean"
            );
            expect(getColumnDataType(mockColumn({ attribute: { type: "String" } }) as any)).toBe(
                "string"
            );
        });
    });

    describe("inferTypeFromValues", () => {
        it("returns 'string' for empty arrays", () => {
            expect(inferTypeFromValues([])).toBe("string");
        });

        it("detects 'date' from string values", () => {
            const values = ["2023-01-01", "2023-05-20", "2021-12-31"];
            expect(inferTypeFromValues(values)).toBe("date");
        });

        it("detects 'date' from slash format", () => {
            const values = ["1/1/2023", "12/31/2022"];
            expect(inferTypeFromValues(values)).toBe("date");
        });

        it("detects 'number' from numeric strings", () => {
            const values = ["10", "10.5", "-500"];
            expect(inferTypeFromValues(values)).toBe("number");
        });

        it("detects 'boolean' from various string representations", () => {
            expect(inferTypeFromValues(["true", "false"])).toBe("boolean");
            expect(inferTypeFromValues(["Yes", "No", "yes"])).toBe("boolean");
        });

        it("defaults to 'string' for mixed or unrecognized data", () => {
            const values = ["2023-01-01", "Banana", "100"];
            expect(inferTypeFromValues(values)).toBe("string");
        });
    });

    describe("formatDateValue", () => {
        it("formats a valid date string correctly", () => {
            // Using a specific time to avoid timezone rollovers causing flaky tests
            // (e.g., midnight in UTC might be previous day in EST)
            const input = "2023-12-25T12:00:00";
            const result = formatDateValue(input);

            // Based on your implementation: "DayOfWeek Month/Day/Year"
            expect(result).toContain("12/25/2023");
            expect(result).toContain("Mon"); // Dec 25 2023 was a Monday
        });

        it("returns original value if invalid date", () => {
            const input = "Not a date";
            expect(formatDateValue(input)).toBe("Not a date");
        });
    });

    describe("parseValueForSorting", () => {
        it("parses numbers correctly", () => {
            expect(parseValueForSorting("10.5", "number")).toBe(10.5);
            expect(parseValueForSorting("0", "number")).toBe(0);
        });

        it("parses dates to timestamps", () => {
            const input = "2023-01-01T00:00:00.000Z";
            const result = parseValueForSorting(input, "date");
            expect(typeof result).toBe("number");
            expect(result).toBeGreaterThan(0);
        });

        it("parses booleans to 0/1", () => {
            expect(parseValueForSorting("true", "boolean")).toBe(1);
            expect(parseValueForSorting("false", "boolean")).toBe(0);
        });

        it("returns original value for strings", () => {
            expect(parseValueForSorting("abc", "string")).toBe("abc");
        });
    });

    describe("sortDistinctValues", () => {
        it("sorts numbers numerically, not alphabetically", () => {
            // Alphabetical sort would place "10" before "2"
            const values = ["2", "10", "1", "20"];
            const sorted = sortDistinctValues(values, "number");
            expect(sorted).toEqual(["1", "2", "10", "20"]);
        });

        it("sorts dates chronologically", () => {
            const values = ["2023-01-01", "2020-01-01", "2022-01-01"];
            const sorted = sortDistinctValues(values, "date");
            expect(sorted).toEqual(["2020-01-01", "2022-01-01", "2023-01-01"]);
        });

        it("sorts booleans (false/no comes before true/yes)", () => {
            const values = ["true", "false"];
            const sorted = sortDistinctValues(values, "boolean");
            expect(sorted).toEqual(["false", "true"]);
        });

        it("sorts strings alphabetically", () => {
            const values = ["Zebra", "Apple", "Mango"];
            const sorted = sortDistinctValues(values, "string");
            expect(sorted).toEqual(["Apple", "Mango", "Zebra"]);
        });
    });
});
