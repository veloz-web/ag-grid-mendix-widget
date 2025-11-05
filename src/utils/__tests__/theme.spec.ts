import { getThemeClassName } from "../theme";

describe("theme utils", () => {
    describe("getThemeClassName", () => {
        it("returns default theme for invalid theme names", () => {
            expect(getThemeClassName("invalid")).toBe("ag-theme-material");
            expect(getThemeClassName("")).toBe("ag-theme-material");
        });

        it("returns correct theme class for valid themes", () => {
            expect(getThemeClassName("alpine")).toBe("ag-theme-alpine");
            expect(getThemeClassName("balham")).toBe("ag-theme-balham");
            expect(getThemeClassName("material")).toBe("ag-theme-material");
            expect(getThemeClassName("quartz")).toBe("ag-theme-quartz");
        });

        it("returns light theme when variant is light", () => {
            expect(getThemeClassName("alpine", "light")).toBe("ag-theme-alpine");
            expect(getThemeClassName("balham", "light")).toBe("ag-theme-balham");
        });

        it("returns dark theme when variant is dark", () => {
            expect(getThemeClassName("alpine", "dark")).toBe("ag-theme-alpine-dark");
            expect(getThemeClassName("balham", "dark")).toBe("ag-theme-balham-dark");
            expect(getThemeClassName("material", "dark")).toBe("ag-theme-material-dark");
        });

        it("returns light theme when variant is auto and prefersDark is false", () => {
            expect(getThemeClassName("alpine", "auto", false)).toBe("ag-theme-alpine");
            expect(getThemeClassName("balham", "auto", false)).toBe("ag-theme-balham");
        });

        it("returns dark theme when variant is auto and prefersDark is true", () => {
            expect(getThemeClassName("alpine", "auto", true)).toBe("ag-theme-alpine-dark");
            expect(getThemeClassName("balham", "auto", true)).toBe("ag-theme-balham-dark");
        });

        it("defaults to auto variant with prefersDark false", () => {
            expect(getThemeClassName("alpine")).toBe("ag-theme-alpine");
            expect(getThemeClassName("alpine", undefined, undefined)).toBe("ag-theme-alpine");
        });

        it("handles undefined theme name", () => {
            expect(getThemeClassName(undefined)).toBe("ag-theme-material");
        });
    });
});
