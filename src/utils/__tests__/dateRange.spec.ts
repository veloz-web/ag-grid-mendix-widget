import {
    isRelativeDateRangeKey,
    resolveRelativeDateRange,
    normalizeDateInputValue,
    isDateRangeValue,
    normalizeDateRangeValue,
    toComparableDate,
    relativeDateRangeOptions
} from "../dateRange";

describe("dateRange utils", () => {
    describe("isRelativeDateRangeKey", () => {
        it("returns true for valid relative date range keys", () => {
            expect(isRelativeDateRangeKey("last7Days")).toBe(true);
            expect(isRelativeDateRangeKey("last30Days")).toBe(true);
            expect(isRelativeDateRangeKey("last365Days")).toBe(true);
        });

        it("returns false for invalid keys", () => {
            expect(isRelativeDateRangeKey("invalid")).toBe(false);
            expect(isRelativeDateRangeKey("")).toBe(false);
            expect(isRelativeDateRangeKey(null)).toBe(false);
            expect(isRelativeDateRangeKey(undefined)).toBe(false);
            expect(isRelativeDateRangeKey(123)).toBe(false);
        });
    });

    describe("resolveRelativeDateRange", () => {
        const mockDate = new Date("2024-01-15T10:00:00Z");

        it("resolves last7Days correctly", () => {
            const result = resolveRelativeDateRange("last7Days", mockDate);
            expect(result).toEqual({
                from: "2024-01-09",
                to: "2024-01-15"
            });
        });

        it("resolves last30Days correctly", () => {
            const result = resolveRelativeDateRange("last30Days", mockDate);
            expect(result).toEqual({
                from: "2023-12-17",
                to: "2024-01-15"
            });
        });

        it("returns null for invalid key", () => {
            const result = resolveRelativeDateRange("invalid" as any, mockDate);
            expect(result).toBeNull();
        });

        it("uses current date as default reference", () => {
            const result = resolveRelativeDateRange("last7Days");
            expect(result).toBeDefined();
            expect(result?.from).toBeDefined();
            expect(result?.to).toBeDefined();
        });
    });

    describe("normalizeDateInputValue", () => {
        it("returns empty string for null/undefined", () => {
            expect(normalizeDateInputValue(null)).toBe("");
            expect(normalizeDateInputValue(undefined)).toBe("");
        });

        it("extracts date part from ISO strings", () => {
            expect(normalizeDateInputValue("2024-01-15T10:00:00Z")).toBe("2024-01-15");
            expect(normalizeDateInputValue("2024-01-15")).toBe("2024-01-15");
        });

        it("formats Date objects", () => {
            const date = new Date("2024-01-15T10:00:00Z");
            expect(normalizeDateInputValue(date.toISOString())).toBe("2024-01-15");
        });

        it("returns empty string for invalid dates", () => {
            expect(normalizeDateInputValue("invalid")).toBe("");
            expect(normalizeDateInputValue("not-a-date")).toBe("");
        });
    });

    describe("isDateRangeValue", () => {
        it("returns true for objects with from/to properties", () => {
            expect(isDateRangeValue({ from: "2024-01-01" })).toBe(true);
            expect(isDateRangeValue({ to: "2024-01-31" })).toBe(true);
            expect(isDateRangeValue({ from: "2024-01-01", to: "2024-01-31" })).toBe(true);
        });

        it("returns false for invalid values", () => {
            expect(isDateRangeValue(null)).toBe(false);
            expect(isDateRangeValue(undefined)).toBe(false);
            expect(isDateRangeValue("string")).toBe(false);
            expect(isDateRangeValue(123)).toBe(false);
            expect(isDateRangeValue({})).toBe(false);
            expect(isDateRangeValue({ other: "property" })).toBe(false);
        });
    });

    describe("normalizeDateRangeValue", () => {
        it("returns null for null/undefined", () => {
            expect(normalizeDateRangeValue(null)).toBeNull();
            expect(normalizeDateRangeValue(undefined)).toBeNull();
        });

        it("normalizes date range values", () => {
            const result = normalizeDateRangeValue({
                from: "2024-01-15T10:00:00Z",
                to: "2024-01-20T15:30:00Z"
            });
            expect(result).toEqual({
                from: "2024-01-15",
                to: "2024-01-20"
            });
        });

        it("handles partial ranges", () => {
            expect(normalizeDateRangeValue({ from: "2024-01-15" })).toEqual({
                from: "2024-01-15"
            });
            expect(normalizeDateRangeValue({ to: "2024-01-20" })).toEqual({
                to: "2024-01-20"
            });
        });

        it("returns null for empty ranges", () => {
            expect(normalizeDateRangeValue({ from: "", to: "" })).toBeNull();
            expect(normalizeDateRangeValue({})).toBeNull();
        });
    });

    describe("toComparableDate", () => {
        it("returns null for null/undefined/empty", () => {
            expect(toComparableDate(null)).toBeNull();
            expect(toComparableDate(undefined)).toBeNull();
            expect(toComparableDate("")).toBeNull();
        });

        it("converts dates to UTC timestamps", () => {
            const date = new Date("2024-01-15T10:00:00Z");
            const result = toComparableDate(date);
            expect(result).toBe(Date.UTC(2024, 0, 15)); // January is 0-indexed
        });

        it("parses date strings", () => {
            expect(toComparableDate("2024-01-15")).toBe(Date.UTC(2024, 0, 15));
            expect(toComparableDate("2024-01-15T10:00:00Z")).toBe(Date.UTC(2024, 0, 15));
        });

        it("returns null for invalid dates", () => {
            expect(toComparableDate("invalid")).toBeNull();
            expect(toComparableDate("not-a-date")).toBeNull();
        });
    });

    describe("relativeDateRangeOptions", () => {
        it("contains all expected options", () => {
            expect(relativeDateRangeOptions).toHaveLength(7);
            expect(relativeDateRangeOptions).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ key: "last7Days", label: "Last 7 days", days: 7 }),
                    expect.objectContaining({ key: "last30Days", label: "Last 1 month", days: 30 }),
                    expect.objectContaining({ key: "last365Days", label: "Last 12 months", days: 365 })
                ])
            );
        });
    });
});