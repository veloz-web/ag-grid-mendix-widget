import { CustomFormatterRegistry, FormatterContext } from "../customFormatters";

describe("CustomFormatterRegistry", () => {
    let registry: CustomFormatterRegistry;

    beforeEach(() => {
        registry = new CustomFormatterRegistry();
    });

    describe("registerFormatters", () => {
        it("handles null/undefined config", () => {
            expect(() => registry.registerFormatters(null as any)).not.toThrow();
            expect(() => registry.registerFormatters(undefined as any)).not.toThrow();
        });

        it("handles empty array", () => {
            registry.registerFormatters([]);
            expect(registry.getFormatterNames()).toEqual([]);
        });

        it("registers JavaScript formatters successfully", () => {
            const formatters = [
                {
                    formatterName: "testFormatter",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value.toUpperCase();',
                    formatterConfig: undefined
                }
            ];

            registry.registerFormatters(formatters);
            expect(registry.getFormatterNames()).toEqual(["testFormatter"]);
            expect(registry.has("testFormatter")).toBe(true);
        });

        it("handles formatter config JSON", () => {
            const formatters = [
                {
                    formatterName: "configFormatter",
                    formatterType: "javascript" as const,
                    formatterCode: 'return `${value} - ${config.suffix}`;',
                    formatterConfig: '{"suffix": "test"}'
                }
            ];

            registry.registerFormatters(formatters);
            const result = registry.execute("configFormatter", { value: "hello", item: {}, column: {} });
            expect(result).toBe("hello - test");
        });

        it("handles invalid JSON config gracefully", () => {
            const formatters = [
                {
                    formatterName: "invalidConfigFormatter",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value;',
                    formatterConfig: 'invalid json'
                }
            ];

            registry.registerFormatters(formatters);
            const result = registry.execute("invalidConfigFormatter", { value: "test", item: {}, column: {} });
            expect(result).toBe("test");
        });

        it("skips formatters with compilation errors", () => {
            const formatters = [
                {
                    formatterName: "validFormatter",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value;',
                    formatterConfig: undefined
                },
                {
                    formatterName: "invalidFormatter",
                    formatterType: "javascript" as const,
                    formatterCode: 'invalid javascript syntax {{{',
                    formatterConfig: undefined
                }
            ];

            registry.registerFormatters(formatters);
            expect(registry.getFormatterNames()).toEqual(["validFormatter"]);
            expect(registry.has("invalidFormatter")).toBe(false);
        });

        it("ignores unsupported formatter types", () => {
            const formatters = [
                {
                    formatterName: "microflowFormatter",
                    formatterType: "microflow" as any,
                    formatterCode: 'some code',
                    formatterConfig: undefined
                }
            ];

            registry.registerFormatters(formatters);
            expect(registry.getFormatterNames()).toEqual([]);
        });
    });

    describe("execute", () => {
        beforeEach(() => {
            const formatters = [
                {
                    formatterName: "upperCase",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value.toUpperCase();',
                    formatterConfig: undefined
                },
                {
                    formatterName: "withConfig",
                    formatterType: "javascript" as const,
                    formatterCode: 'return `${value}-${config.prefix}`;',
                    formatterConfig: '{"prefix": "test"}'
                }
            ];
            registry.registerFormatters(formatters);
        });

        it("executes registered formatter", () => {
            const result = registry.execute("upperCase", { value: "hello", item: {}, column: {} });
            expect(result).toBe("HELLO");
        });

        it("passes context variables to formatter", () => {
            const context: FormatterContext = {
                value: "test",
                item: { id: 123 },
                column: { name: "testColumn" }
                // Note: config is passed from registration, not context
            };
            const result = registry.execute("withConfig", context);
            expect(result).toBe("test-test"); // Uses config from registration
        });

        it("returns value as string for unknown formatter", () => {
            const result = registry.execute("unknown", { value: "test", item: {}, column: {} });
            expect(result).toBe("test");
        });

        it("handles formatter execution errors", () => {
            // Create a formatter that throws an error
            const errorFormatters = [
                {
                    formatterName: "errorFormatter",
                    formatterType: "javascript" as const,
                    formatterCode: 'throw new Error("test error");',
                    formatterConfig: undefined
                }
            ];
            registry.registerFormatters(errorFormatters);

            const result = registry.execute("errorFormatter", { value: "test", item: {}, column: {} });
            expect(result).toBe("test");
        });

        it("returns empty string for null/undefined values", () => {
            const result = registry.execute("upperCase", { value: null, item: {}, column: {} });
            expect(result).toBe("");
        });
    });

    describe("has and getFormatterNames", () => {
        it("returns false for unregistered formatters", () => {
            expect(registry.has("nonexistent")).toBe(false);
        });

        it("returns true for registered formatters", () => {
            const formatters = [
                {
                    formatterName: "test",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value;',
                    formatterConfig: undefined
                }
            ];
            registry.registerFormatters(formatters);
            expect(registry.has("test")).toBe(true);
        });

        it("returns empty array initially", () => {
            expect(registry.getFormatterNames()).toEqual([]);
        });

        it("returns registered formatter names", () => {
            const formatters = [
                {
                    formatterName: "formatter1",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value;',
                    formatterConfig: undefined
                },
                {
                    formatterName: "formatter2",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value;',
                    formatterConfig: undefined
                }
            ];
            registry.registerFormatters(formatters);
            expect(registry.getFormatterNames()).toEqual(["formatter1", "formatter2"]);
        });
    });

    describe("clear", () => {
        it("removes all registered formatters", () => {
            const formatters = [
                {
                    formatterName: "test",
                    formatterType: "javascript" as const,
                    formatterCode: 'return value;',
                    formatterConfig: undefined
                }
            ];
            registry.registerFormatters(formatters);
            expect(registry.getFormatterNames()).toEqual(["test"]);

            registry.clear();
            expect(registry.getFormatterNames()).toEqual([]);
            expect(registry.has("test")).toBe(false);
        });
    });
});