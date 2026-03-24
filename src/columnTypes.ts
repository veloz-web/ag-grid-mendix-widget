/**
 * Column type definitions extracted from the Mendix widget XML schema.
 *
 * These types are generated into `typings/AGGridProps.d.ts` by the Mendix
 * pluggable-widgets-tools code-generator, but the current tool version (10.24.x)
 * omits them from its output.  Defining them here keeps the codebase stable
 * regardless of tool version, since this file is never overwritten.
 */
import { DynamicValue, ListAttributeValue, ListActionValue } from "mendix";
import { Big } from "big.js";

// ─── Column sub-property enums ────────────────────────────────────────────────

export type DataTypeEnum = "auto" | "boolean" | "date" | "number" | "string";

export type AlignmentEnum = "auto" | "left" | "center" | "right";

export type WidthTypeEnum = "auto" | "flex" | "fixed";

export type PinnedEnum = "none" | "left" | "right";

export type DefaultSortEnum = "none" | "asc" | "desc";

export type FilterLocationEnum = "none" | "drawer" | "toolbar";

export type AggregationFunctionEnum = "sum" | "min" | "max" | "avg" | "count" | "first" | "last";

export type FormatterEnum =
    | "none"
    | "currency"
    | "currencyEUR"
    | "currencyGBP"
    | "percentage"
    | "number"
    | "decimal2"
    | "dateShort"
    | "dateLong"
    | "dateISO"
    | "dateDMY"
    | "dateMDY"
    | "dateYMD"
    | "dateTime"
    | "time"
    | "yesNo"
    | "trueFalse"
    | "uppercase"
    | "lowercase"
    | "capitalize"
    | "customPrefix"
    | "link";

export type EditorTypeEnum =
    | "text"
    | "number"
    | "date"
    | "datetime"
    | "boolean"
    | "select"
    | "richSelect";

// ─── Runtime column type (AGGridContainerProps.columns[]) ─────────────────────

export interface ColumnsType {
    header: DynamicValue<string>;
    attribute: ListAttributeValue<string | Big | boolean | Date>;
    dataType: DataTypeEnum;
    hidden: boolean;
    alignment: AlignmentEnum;
    widthType: WidthTypeEnum;
    width: number;
    flex: number;
    minWidth: number;
    maxWidth: number;
    resizable: boolean;
    draggable: boolean;
    pinned: PinnedEnum;
    pinnable: boolean;
    wrapText: boolean;
    sortable: boolean;
    defaultSort: DefaultSortEnum;
    sortIndex: number;
    includeInSort: boolean;
    filter: boolean;
    filterLocation: FilterLocationEnum;
    useDateRange: boolean;
    useRelativeRange: boolean;
    floatingFilter: boolean;
    enableAggregation: boolean;
    aggregationFunction: AggregationFunctionEnum;
    enableRowGroup: boolean;
    rowGroupIndex: number;
    showRowGroup: boolean;
    formatter: FormatterEnum;
    customFormatterName: string;
    customPrefix: string;
    customSuffix: string;
    template: string;
    editable: boolean;
    editorType: EditorTypeEnum;
    selectOptions: string;
    validationRequired: boolean;
    validationMinValue: string;
    validationMaxValue: string;
    validationPattern: string;
    linkAction?: ListActionValue;
    linkUrlPattern: string;
    linkText: string;
    statusMapping: string;
}

// ─── Preview column type (AGGridPreviewProps.columns[]) ───────────────────────

export interface ColumnsPreviewType {
    header: string;
    attribute: string;
    dataType: DataTypeEnum;
    hidden: boolean;
    alignment: AlignmentEnum;
    widthType: WidthTypeEnum;
    width: number | null;
    flex: number | null;
    minWidth: number | null;
    maxWidth: number | null;
    resizable: boolean;
    draggable: boolean;
    pinned: PinnedEnum;
    pinnable: boolean;
    wrapText: boolean;
    sortable: boolean;
    defaultSort: DefaultSortEnum;
    sortIndex: number | null;
    includeInSort: boolean;
    filter: boolean;
    filterLocation: FilterLocationEnum;
    useDateRange: boolean;
    useRelativeRange: boolean;
    floatingFilter: boolean;
    enableAggregation: boolean;
    aggregationFunction: AggregationFunctionEnum;
    enableRowGroup: boolean;
    rowGroupIndex: number | null;
    showRowGroup: boolean;
    formatter: FormatterEnum;
    customFormatterName: string;
    customPrefix: string;
    customSuffix: string;
    template: string;
    editable: boolean;
    editorType: EditorTypeEnum;
    selectOptions: string;
    validationRequired: boolean;
    validationMinValue: string;
    validationMaxValue: string;
    validationPattern: string;
    linkAction: {} | null;
    linkUrlPattern: string;
    linkText: string;
    statusMapping: string;
}
