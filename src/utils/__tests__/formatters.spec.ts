import {
    renderLink,
    applyFormatter,
    formatCurrency,
    formatDate,
    formatValue,
    compareValuesForSort
} from "../formatters";

describe("formatters utils", () => {
    describe("renderLink", () => {
        it("returns plain value for empty URL pattern", () => {
            const result = renderLink("test", "", "link text");
            expect(result).toBe("test");
        });

        // eslint-disable-next-line no-template-curly-in-string
        it("replaces ${value} placeholder in URL", () => {
            // eslint-disable-next-line no-template-curly-in-string
            const result = renderLink("test-value", "https://example.com/${value}", "View");
            expect(result).toBe(
                '<a href="https://example.com/test-value" class="aggrid-link"><span class="fa fa-eye"></span> <span class="sr-only">View</span></a>'
            );
        });

        it("uses value as display text when linkTextPattern is empty", () => {
            // eslint-disable-next-line no-template-curly-in-string
            const result = renderLink("test-value", "https://example.com/${value}", "");
            expect(result).toBe(
                '<a href="https://example.com/test-value" class="aggrid-link"><span class="fa fa-eye"></span> <span class="sr-only">test-value</span></a>'
            );
        });

        // eslint-disable-next-line no-template-curly-in-string
        it("replaces ${value} placeholder in link text", () => {
            // eslint-disable-next-line no-template-curly-in-string
            const result = renderLink(
                "test-value",
                // eslint-disable-next-line no-template-curly-in-string
                "https://example.com/${value}",
                // eslint-disable-next-line no-template-curly-in-string
                "View ${value}"
            );
            expect(result).toBe(
                '<a href="https://example.com/test-value" class="aggrid-link"><span class="fa fa-eye"></span> <span class="sr-only">View test-value</span></a>'
            );
        });
    });

    describe("applyFormatter", () => {
        it("returns empty string for null/undefined", () => {
            expect(applyFormatter(null, "none", "String")).toBe("");
            expect(applyFormatter(undefined, "none", "String")).toBe("");
        });

        it("applies currency formatter", () => {
            expect(applyFormatter(123.45, "currency", "Decimal")).toBe("$123.45");
            expect(applyFormatter(123.45, "currencyEUR", "Decimal")).toBe("€123.45");
            expect(applyFormatter(123.45, "currencyGBP", "Decimal")).toBe("£123.45");
        });

        it("applies percentage formatter", () => {
            expect(applyFormatter(0.25, "percentage", "Decimal")).toBe("0.25%");
        });

        it("applies number formatters", () => {
            expect(applyFormatter(1234.56, "number", "Decimal")).toBe("1,234.56");
            expect(applyFormatter(1234.56, "decimal2", "Decimal")).toBe("1234.56");
        });

        it("applies date formatters", () => {
            const date = new Date("2024-01-15T10:30:00Z");
            expect(applyFormatter(date, "dateMDY", "DateTime")).toBe("01/15/2024");
            expect(applyFormatter(date, "dateYMD", "DateTime")).toBe("2024-01-15");
            expect(applyFormatter(date, "dateLong", "DateTime")).toContain("January 15, 2024");
        });

        it("applies boolean formatters", () => {
            expect(applyFormatter(true, "yesNo", "Boolean")).toBe("Yes");
            expect(applyFormatter(false, "yesNo", "Boolean")).toBe("No");
            expect(applyFormatter(true, "trueFalse", "Boolean")).toBe("True");
            expect(applyFormatter(false, "trueFalse", "Boolean")).toBe("False");
        });

        it("applies text formatters", () => {
            expect(applyFormatter("hello world", "uppercase", "String")).toBe("HELLO WORLD");
            expect(applyFormatter("hello world", "lowercase", "String")).toBe("hello world");
            expect(applyFormatter("hello", "capitalize", "String")).toBe("Hello");
        });

        it("applies custom prefix/suffix", () => {
            expect(applyFormatter("test", "customPrefix", "String", "prefix-", "-suffix")).toBe(
                "prefix-test-suffix"
            );
        });

        it("handles invalid values gracefully", () => {
            expect(applyFormatter("invalid", "currency", "Decimal")).toBe("invalid");
        });
    });

    describe("formatCurrency", () => {
        it("formats valid numbers", () => {
            expect(formatCurrency(123.45, "USD")).toBe("$123.45");
            expect(formatCurrency(1000, "EUR")).toBe("€1,000.00");
            expect(formatCurrency(500.5, "GBP")).toBe("£500.50");
        });

        it("handles invalid values", () => {
            expect(formatCurrency("invalid", "USD")).toMatch("invalid");
            expect(formatCurrency(null, "USD")).toMatch("null");
        });
    });

    describe("formatDate", () => {
        const testDate = new Date("2024-01-15T14:30:45Z");

        it("formats dates in different formats", () => {
            expect(formatDate(testDate, "MM/DD/YYYY")).toBe("01/15/2024");
            expect(formatDate(testDate, "DD/MM/YYYY")).toBe("15/01/2024");
            expect(formatDate(testDate, "YYYY-MM-DD")).toBe("2024-01-15");
            expect(formatDate(testDate, "YYYY/MM/DD")).toBe("2024/01/15");
        });

        it("formats long date", () => {
            const result = formatDate(testDate, "long");
            expect(result).toContain("January 15, 2024");
        });

        it("formats datetime and time", () => {
            const datetimeResult = formatDate(testDate, "datetime");
            expect(datetimeResult).toContain("1/15/2024");

            const timeResult = formatDate(testDate, "time");
            expect(timeResult).toContain("2:30:45");
        });

        it("handles invalid dates", () => {
            expect(formatDate("invalid", "MM/DD/YYYY")).toMatch("invalid");
            expect(formatDate(null, "MM/DD/YYYY")).toMatch("null");
        });
    });

    describe("formatValue", () => {
        it("returns empty string for null/undefined", () => {
            expect(formatValue(null, "String")).toBe("");
            expect(formatValue(undefined, "Boolean")).toBe("");
        });

        it("formats boolean values", () => {
            expect(formatValue(true, "Boolean")).toBe("Yes");
            expect(formatValue(false, "Boolean")).toBe("No");
        });

        it("formats other types as strings", () => {
            expect(formatValue(123, "Integer")).toBe("123");
            expect(formatValue("test", "String")).toBe("test");
            expect(formatValue(new Date("2024-01-01"), "DateTime")).toContain("2024");
        });
    });

    describe("compareValuesForSort", () => {
        it("handles null/undefined values", () => {
            expect(compareValuesForSort(null, "a")).toBe(1);
            expect(compareValuesForSort("a", null)).toBe(-1);
            expect(compareValuesForSort(null, null)).toBe(0);
        });

        it("compares numbers", () => {
            expect(compareValuesForSort(1, 2)).toBe(-1);
            expect(compareValuesForSort(2, 1)).toBe(1);
            expect(compareValuesForSort(1, 1)).toBe(0);
        });

        it("compares numeric strings", () => {
            expect(compareValuesForSort("1", "2")).toBe(-1);
            expect(compareValuesForSort("10", "2")).toBe(-1); // Numeric comparison
        });

        it("compares dates", () => {
            const date1 = new Date("2024-01-01");
            const date2 = new Date("2024-01-02");
            expect(compareValuesForSort(date1, date2)).toBe(-1);
            expect(compareValuesForSort(date2, date1)).toBe(1);
        });

        it("compares strings lexicographically", () => {
            expect(compareValuesForSort("apple", "banana")).toBe(-1);
            expect(compareValuesForSort("banana", "apple")).toBe(1);
            expect(compareValuesForSort("apple", "apple")).toBe(0);
        });
    });
});
