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
};

export const getThemeClassName = (themeName = "material") =>
    themeMap[themeName] || themeMap.material;
