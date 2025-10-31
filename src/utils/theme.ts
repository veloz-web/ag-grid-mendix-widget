// src/utils/theme.js

/**
 * Gets the AG Grid theme class name based on the theme prop.
 * In AG Grid v34+, we pass class names, not theme objects.
 * @param {string} themeName - The theme name from props (e.g., "alpine", "quartz")
 * @returns {string} The corresponding theme class name (e.g., "ag-theme-alpine")
 */
const themeMap = {
    alpine: "ag-theme-alpine",
    balham: "ag-theme-balham",
    material: "ag-theme-material",
    quartz: "ag-theme-quartz"
} as const;

const darkThemeMap = {
    alpine: "ag-theme-alpine-dark",
    balham: "ag-theme-balham-dark",
    material: "ag-theme-material-dark",
    quartz: "ag-theme-quartz-dark"
} as const;

type ThemeKey = keyof typeof themeMap;
type ThemeVariant = "auto" | "light" | "dark";

const normalizeThemeKey = (themeName: string): ThemeKey => {
    return (themeName in themeMap ? themeName : "material") as ThemeKey;
};

export const getThemeClassName = (
    themeName = "material",
    variant: ThemeVariant = "auto",
    prefersDark = false
) => {
    const key = normalizeThemeKey(themeName);
    const baseClass = themeMap[key];
    const darkClass = darkThemeMap[key] || baseClass;

    if (variant === "dark") {
        return darkClass;
    }

    if (variant === "light") {
        return baseClass;
    }

    return prefersDark ? darkClass : baseClass;
};
