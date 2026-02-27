/**
 * Column Mapping Utilities
 *
 * Maps Mendix column configurations to AG Grid ColDef objects.
 * Handles formatters, renderers, filters, widths, and other column properties.
 */

import React from "react";
import type { ColDef } from "ag-grid-community";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../../typings/AGGridProps";
import { renderLink, applyFormatter } from "../formatters";
import { evaluateTemplate } from "../renderers";
import { CustomFormatterRegistry } from "../customFormatters";
import { getCellAlignment, getCellAlignmentStyle, getHeaderAlignmentClass } from "./alignment";

type EditorType = "text" | "number" | "date" | "datetime" | "boolean" | "select" | "richSelect";

function parseSelectOptions(selectOptions?: string): string[] {
    if (!selectOptions || !selectOptions.trim()) {
        return [];
    }
    try {
        const parsed = JSON.parse(selectOptions);
        if (Array.isArray(parsed)) {
            return parsed
                .map((option) => {
                    if (typeof option === "string" || typeof option === "number") {
                        return String(option);
                    }
                    if (option && typeof option === "object" && "value" in option) {
                        return String(option.value);
                    }
                    return "";
                })
                .filter(Boolean);
        }
    } catch (e) {
        console.error("[AG Grid] Invalid selectOptions JSON:", selectOptions, e);
    }
    return [];
}

function parseEditorValue(value: any, editorType: EditorType): any {
    if (value === null || value === undefined) return value;
    switch (editorType) {
        case "number": {
            const num = Number(value);
            return Number.isNaN(num) ? value : num;
        }
        case "date":
        case "datetime": {
            const date = value instanceof Date ? value : new Date(value);
            return isNaN(date.getTime()) ? value : date;
        }
        case "boolean":
            return value === true || value === "true" || value === 1 || value === "1";
        default:
            return value;
    }
}

function validateEditorValue(value: any, col: ColumnsType, editorType: EditorType): boolean {
    const isEmpty = value === null || value === undefined || value === "";
    if (col.validationRequired && isEmpty) return false;

    if (isEmpty) return true;

    if (
        col.validationMinValue !== undefined &&
        col.validationMinValue !== null &&
        col.validationMinValue !== ""
    ) {
        const min = Number(col.validationMinValue);
        const current =
            editorType === "date" || editorType === "datetime"
                ? new Date(value).getTime()
                : Number(value);
        if (!Number.isNaN(min) && !Number.isNaN(current) && current < min) return false;
    }

    if (
        col.validationMaxValue !== undefined &&
        col.validationMaxValue !== null &&
        col.validationMaxValue !== ""
    ) {
        const max = Number(col.validationMaxValue);
        const current =
            editorType === "date" || editorType === "datetime"
                ? new Date(value).getTime()
                : Number(value);
        if (!Number.isNaN(max) && !Number.isNaN(current) && current > max) return false;
    }

    if (col.validationPattern) {
        try {
            const regex = new RegExp(col.validationPattern);
            if (!regex.test(String(value))) return false;
        } catch (e) {
            console.error("[AG Grid] Invalid validation regex:", col.validationPattern, e);
        }
    }

    return true;
}

/**
 * Maps a single Mendix column configuration to an AG Grid ColDef.
 *
 * This function handles:
 * - Basic column properties (header, field, sortable, resizable)
 * - Value getters and formatters
 * - Aggregation functions
 * - Row grouping configuration
 * - Data type handling
 * - Filtering configuration
 * - Width settings (fixed, flex, auto)
 * - Pinning configuration
 * - Cell alignment
 * - Custom formatters and renderers
 * - Link/action rendering
 * - Template evaluation
 *
 * @param col - Mendix column configuration
 * @param columns - All columns (needed for template evaluation)
 * @param customFormatterRegistry - Registry of custom formatters
 * @returns AG Grid column definition
 */
export function mapMendixColumnToColDef(
    col: ColumnsType,
    columns: ColumnsType[],
    customFormatterRegistry?: CustomFormatterRegistry
): ColDef {
    const isFilterEnabled = col.filter !== false;
    const explicitDataType = col.dataType && col.dataType !== "auto" ? col.dataType : null;

    const colDef: ColDef = {
        headerName: col.header?.value || "",
        field: col.attribute?.id || "",
        sortable: col.sortable,
        resizable: col.resizable,
        suppressMovable: col.draggable === false, // AG Grid uses suppressMovable (inverted logic)
        valueGetter: (params) => {
            try {
                const item = params.data;
                if (!item) return "";

                if (col.template) {
                    return evaluateTemplate(col.template, item, columns);
                }

                if (!col.attribute) return "";
                const value = col.attribute.get(item);
                if (value.status !== ValueStatus.Available) return "";
                return value.value;
            } catch (e) {
                console.error("Error in valueGetter:", e);
                return "";
            }
        }
    };

    const editorType = (col.editorType || "text") as EditorType;
    const isEditable = Boolean(col.editable) && !col.template;

    if (col.editable && col.template) {
        console.warn(
            `[AG Grid] Column "${col.header?.value}" is editable but uses a template. ` +
                "Templates are not editable."
        );
    }

    if (isEditable) {
        colDef.editable = true;

        switch (editorType) {
            case "number":
                colDef.cellEditor = "agNumberCellEditor";
                colDef.cellEditorParams = {
                    min:
                        col.validationMinValue !== undefined && col.validationMinValue !== ""
                            ? Number(col.validationMinValue)
                            : undefined,
                    max:
                        col.validationMaxValue !== undefined && col.validationMaxValue !== ""
                            ? Number(col.validationMaxValue)
                            : undefined
                };
                break;
            case "date":
            case "datetime":
                colDef.cellEditor = "agDateCellEditor";
                break;
            case "boolean":
                colDef.cellEditor = "agCheckboxCellEditor";
                break;
            case "select": {
                colDef.cellEditor = "agSelectCellEditor";
                const values = parseSelectOptions(col.selectOptions);
                colDef.cellEditorParams = { values };
                break;
            }
            case "richSelect": {
                colDef.cellEditor = "agRichSelectCellEditor";
                const values = parseSelectOptions(col.selectOptions);
                colDef.cellEditorParams = { values };
                break;
            }
            default:
                colDef.cellEditor = "agTextCellEditor";
                break;
        }

        colDef.valueParser = (params) => parseEditorValue(params.newValue, editorType);
        colDef.valueSetter = (params) => {
            const parsedValue = parseEditorValue(params.newValue, editorType);
            if (!validateEditorValue(parsedValue, col, editorType)) {
                return false;
            }

            const item = params.data;
            if (!item) return false;

            const attributeId = col.attribute?.id || params.colDef?.field;
            if (attributeId) {
                if (typeof item.set === "function") {
                    item.set(attributeId, parsedValue);
                } else {
                    item[attributeId] = parsedValue;
                }
                return true;
            }

            return false;
        };
    }

    // Add aggregation function if enabled
    if (col.enableAggregation && col.aggregationFunction) {
        colDef.aggFunc = col.aggregationFunction;
    }

    // Add row grouping if enabled
    if (col.enableRowGroup) {
        colDef.rowGroup = true;
        if (col.rowGroupIndex !== undefined && col.rowGroupIndex !== 999) {
            colDef.rowGroupIndex = col.rowGroupIndex;
        }
        if (col.showRowGroup) {
            colDef.showRowGroup = true;
        }
    }

    // Set data type
    if (explicitDataType) {
        if (explicitDataType === "string") {
            colDef.cellDataType = "text";
        } else {
            colDef.cellDataType = explicitDataType;
        }
    }

    // Configure filtering
    const usesDateLikeFilter = Boolean(
        isFilterEnabled && (col.useDateRange || col.useRelativeRange || explicitDataType === "date")
    );

    if (usesDateLikeFilter) {
        colDef.filter = "agDateColumnFilter";
        colDef.filterParams = {
            ...(colDef.filterParams || {}),
            comparator: (filterLocalDateAtMidnight: Date, cellValue: any) => {
                if (!cellValue) {
                    return -1;
                }

                let cellDate: Date;
                if (cellValue instanceof Date) {
                    cellDate = cellValue;
                } else {
                    const parsed = new Date(cellValue);
                    if (isNaN(parsed.getTime())) {
                        return -1;
                    }
                    cellDate = parsed;
                }

                const cellComparable = Date.UTC(
                    cellDate.getFullYear(),
                    cellDate.getMonth(),
                    cellDate.getDate()
                );
                const filterComparable = Date.UTC(
                    filterLocalDateAtMidnight.getFullYear(),
                    filterLocalDateAtMidnight.getMonth(),
                    filterLocalDateAtMidnight.getDate()
                );

                if (cellComparable === filterComparable) {
                    return 0;
                }

                return cellComparable < filterComparable ? -1 : 1;
            }
        };
    } else {
        colDef.filter = isFilterEnabled;
    }

    // Apply width settings
    if (col.widthType === "flex") {
        colDef.flex = col.flex || 1;
        colDef.minWidth = col.minWidth || 50;
        if (col.maxWidth && col.maxWidth > 0) {
            colDef.maxWidth = col.maxWidth;
        }
    } else if (col.widthType === "auto") {
        colDef.minWidth = col.minWidth || 50;
        if (col.maxWidth && col.maxWidth > 0) {
            colDef.maxWidth = col.maxWidth;
        }
    } else {
        colDef.width = col.width || 150;
    }

    // Apply pinning configuration
    if (col.pinned && col.pinned !== "none") {
        colDef.pinned = col.pinned;
    }

    if (!col.pinnable) {
        colDef.lockPinned = true; // Prevent end users from changing the pin state when disabled
    }

    // Apply floating filter
    if (col.floatingFilter && isFilterEnabled) {
        colDef.floatingFilter = true;
    }

    // Apply text alignment
    const alignment = getCellAlignment(col);
    colDef.cellStyle = getCellAlignmentStyle(alignment);
    colDef.headerClass = getHeaderAlignmentClass(alignment);

    // Handle hidden columns
    if (col.hidden) {
        colDef.hide = true;
    }

    // Handle text wrapping
    // When wrapText is enabled, AG Grid wraps text within the cell.
    // autoHeight tells AG Grid to measure the cell and expand the row to fit.
    if (col.wrapText) {
        colDef.wrapText = true;
        colDef.autoHeight = true;
    }

    // Handle template columns
    if (col.template) {
        colDef.sortable = false;
        colDef.filter = false;
    }

    // --- Apply Cell Renderers (using JSX) or Value Formatters ---
    const effectiveFormatter = col.customFormatterName || col.formatter;
    const customFormatterNameTrimmed = col.customFormatterName?.trim();

    if (customFormatterNameTrimmed && customFormatterNameTrimmed.length > 0) {
        // --- Custom Formatter ---
        if (customFormatterRegistry && customFormatterRegistry.has(customFormatterNameTrimmed)) {
            colDef.cellRenderer = (params: any) => {
                try {
                    const htmlString = customFormatterRegistry.execute(customFormatterNameTrimmed, {
                        value: params.value,
                        item: params.data,
                        column: col
                    });
                    // Use JSX for dangerouslySetInnerHTML
                    return React.createElement("span", {
                        dangerouslySetInnerHTML: { __html: htmlString }
                    });
                } catch (e) {
                    console.error(
                        `Error rendering custom formatter "${customFormatterNameTrimmed}":`,
                        e
                    );
                    return String(params.value || "");
                }
            };
        } else {
            // Custom formatter not found - show error
            console.error(
                `[AG Grid] Custom formatter "${customFormatterNameTrimmed}" not found for column "${col.header?.value}". ` +
                    `Available formatters: ${
                        customFormatterRegistry
                            ? customFormatterRegistry.getFormatterNames().join(", ")
                            : "none"
                    }`
            );
            // Render error message in cell using JSX
            colDef.cellRenderer = () =>
                React.createElement(
                    "span",
                    {
                        style: { color: "red", fontStyle: "italic" },
                        title: `Custom formatter "${customFormatterNameTrimmed}" not found`
                    },
                    `⚠️ Formatter not found: ${customFormatterNameTrimmed}`
                );
        }
    } else if (effectiveFormatter === "link") {
        // --- Link/Action Renderer ---
        colDef.cellRenderer = (params: any) => {
            try {
                // 1. Mendix Action (Preferred)
                if (col.linkAction && params.data) {
                    const rowAction = col.linkAction.get(params.data);

                    if (rowAction && rowAction.canExecute) {
                        const rawValue = params.value;
                        const displayText = col.linkText
                            ? col.linkText.replace(/\$\{value\}/g, String(rawValue ?? ""))
                            : String(rawValue ?? "");

                        const handleAction = (e: React.MouseEvent | React.KeyboardEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTimeout(() => {
                                rowAction.execute();
                            }, 0);
                        };

                        // Render as accessible button using JSX
                        return React.createElement(
                            "button",
                            {
                                type: "button",
                                className: "aggrid-link-button",
                                onClick: handleAction,
                                onKeyDown: (e: React.KeyboardEvent) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleAction(e);
                                    }
                                }
                            },
                            displayText || React.createElement("span", { className: "fas fa-eye" })
                        );
                    }
                }

                // 2. Legacy URL Pattern (Fallback)
                if (col.linkUrlPattern) {
                    const htmlString = renderLink(params.value, col.linkUrlPattern, col.linkText);
                    return React.createElement("span", {
                        dangerouslySetInnerHTML: { __html: htmlString }
                    });
                }

                return String(params.value || "");
            } catch (e) {
                console.error("Error rendering link:", e);
                return String(params.value || "");
            }
        };
    } else {
        // --- Default Value Formatter (for text, numbers, dates) ---
        colDef.valueFormatter = (params) => {
            try {
                if (params.value === null || params.value === undefined) return "";
                return applyFormatter(
                    params.value,
                    col.formatter || "none",
                    (col.attribute?.type || "String") as any,
                    col.customPrefix,
                    col.customSuffix
                );
            } catch (e) {
                console.error("Error in formatter:", e);
                return String(params.value || "");
            }
        };
    }

    return colDef;
}

/**
 * Build column definitions from Mendix columns with visibility and ordering applied.
 *
 * @param columns - Mendix column configurations
 * @param columnVisibility - Map of column IDs to visibility state
 * @param columnOrder - Ordered array of column IDs
 * @param customFormatterRegistry - Registry of custom formatters
 * @param rowHeightMode - Row height mode (auto mode enables wrapText/autoHeight on all columns)
 * @returns Array of AG Grid column definitions
 */
export function buildColumnDefs(
    columns: ColumnsType[],
    columnVisibility: Record<string, boolean>,
    columnOrder: string[],
    customFormatterRegistry?: CustomFormatterRegistry,
    rowHeightMode?: "fixed" | "auto" | "custom"
): ColDef[] {
    // Filter visible columns
    const visibleColumns = columns.filter((col) => {
        if (!col.attribute?.id) return true; // Show columns without attributes
        return columnVisibility[col.attribute.id] !== false;
    });

    // Apply column order if provided
    let orderedColumns = visibleColumns;
    if (columnOrder && columnOrder.length > 0) {
        const orderMap = new Map(columnOrder.map((id, index) => [id, index]));
        orderedColumns = visibleColumns.sort((a, b) => {
            const aId = a.attribute?.id || "";
            const bId = b.attribute?.id || "";
            const aIndex = orderMap.get(aId) ?? 999;
            const bIndex = orderMap.get(bId) ?? 999;
            return aIndex - bIndex;
        });
    }

    // Map to AG Grid ColDef
    const colDefs = orderedColumns.map((col) =>
        mapMendixColumnToColDef(col, columns, customFormatterRegistry)
    );

    // If row height mode is "auto", enable wrapText and autoHeight on ALL columns
    if (rowHeightMode === "auto") {
        console.log(
            "[AGGrid] Row height mode is 'auto' - enabling wrapText and autoHeight on all columns"
        );
        colDefs.forEach((colDef, idx) => {
            colDef.wrapText = true;
            colDef.autoHeight = true;
            if (idx === 0) {
                console.log("[AGGrid] Sample column def:", {
                    field: colDef.field,
                    wrapText: colDef.wrapText,
                    autoHeight: colDef.autoHeight
                });
            }
        });
        console.log(`[AGGrid] Set autoHeight=true on ${colDefs.length} columns`);
    }

    return colDefs;
}
