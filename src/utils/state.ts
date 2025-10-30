// src/utils/state.js

/**
 * Gets the default sort model from column configurations.
 * @param {Array} columns - The widget's column props.
 * @returns {Array} The default sort model.
 */
export const getDefaultSortModel = (columns = []) => {
    const sortedColumns = columns
        .filter((col) => col.defaultSort && col.defaultSort !== "none" && col.attribute?.id)
        .map((col) => ({
            colId: col.attribute.id,
            sort: col.defaultSort,
            sortIndex: col.sortIndex ?? 999 // Default to end if no index specified
        }))
        .sort((a, b) => a.sortIndex - b.sortIndex); // Sort by sortIndex

    return sortedColumns.map(({ colId, sort }) => ({ colId, sort }));
};

/**
 * Gets the default column visibility from column configurations.
 * @param {Array} columns - The widget's column props.
 * @returns {Record<string, boolean>} The default visibility state.
 */
export const getDefaultColumnVisibility = (columns = []) => {
    const visibility = {};
    columns.forEach((col) => {
        if (col.attribute?.id) {
            visibility[col.attribute.id] = !col.hidden; // Default to visible unless explicitly hidden
        }
    });
    return visibility;
};

/**
 * Gets the default column order from column configurations.
 * @param {Array} columns - The widget's column props.
 * @returns {string[]} The default column order.
 */
export const getDefaultColumnOrder = (columns = []) => {
    return columns.filter((col) => col.attribute?.id).map((col) => col.attribute.id);
};
