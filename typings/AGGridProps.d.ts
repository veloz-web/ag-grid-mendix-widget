/**
 * This file was generated from AGGrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, ListActionValue, ListAttributeValue, ListValue } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

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

export type DefaultViewEnum = "grid" | "cards" | "list";

export type MobileDefaultViewEnum = "grid" | "cards" | "list";

export type FormatterTypeEnum = "javascript" | "microflow";

export interface CustomFormattersType {
    formatterName: string;
    formatterType: FormatterTypeEnum;
    formatterCode: string;
    formatterConfig: string;
}

export type RowHeightModeEnum = "fixed" | "auto" | "custom";

export type RowClassModeEnum = "none" | "mapping" | "expression";

export type RowSelectionModeEnum = "none" | "single" | "multiple";

export type EditModeEnum = "cell" | "row";

export type ButtonStyleEnum = "default" | "primary" | "success" | "danger" | "warning" | "info";

export type ButtonIconEnum =
    | "none"
    | "plus"
    | "edit"
    | "trash"
    | "refresh"
    | "download"
    | "upload"
    | "check"
    | "close"
    | "search"
    | "settings"
    | "link"
    | "copy"
    | "save"
    | "mail"
    | "print";

export type ButtonPositionEnum = "left" | "right";

export interface ToolbarButtonsType {
    buttonLabel: string;
    buttonStyle: ButtonStyleEnum;
    buttonIcon: ButtonIconEnum;
    buttonPosition: ButtonPositionEnum;
    buttonVisible: boolean;
    buttonDisabled: boolean;
    buttonAction?: ActionValue;
}

export type PaginationPositionEnum = "bottom" | "top";

export type DomLayoutEnum = "normal" | "autoHeight" | "print";

export type AutoSizeStrategyEnum = "none" | "fitGridWidth" | "fitCellContents";

export type ThemeEnum = "alpine" | "balham" | "material" | "quartz";

export type ThemeVariantEnum = "auto" | "light" | "dark";

export type PdfPageOrientationEnum = "landscape" | "portrait";

export type ToastPositionEnum =
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight";

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

export interface CustomFormattersPreviewType {
    formatterName: string;
    formatterType: FormatterTypeEnum;
    formatterCode: string;
    formatterConfig: string;
}

export interface ToolbarButtonsPreviewType {
    buttonLabel: string;
    buttonStyle: ButtonStyleEnum;
    buttonIcon: ButtonIconEnum;
    buttonPosition: ButtonPositionEnum;
    buttonVisible: boolean;
    buttonDisabled: boolean;
    buttonAction: {} | null;
}

export interface AGGridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource: ListValue;
    enableAutoColumns: boolean;
    autoColumnExclusions: string;
    columns: ColumnsType[];
    enableColumnMenus: boolean;
    enableHeaderFilterButtons: boolean;
    enableFloatingFilters: boolean;
    showToolbar: boolean;
    enableViewSelector: boolean;
    defaultView: DefaultViewEnum;
    mobileDefaultView: MobileDefaultViewEnum;
    customCardTemplate: string;
    customListTemplate: string;
    enableFilterDrawer: boolean;
    customFormatters: CustomFormattersType[];
    rowHeightMode: RowHeightModeEnum;
    rowHeight: number;
    rowHeightExpression: string;
    maxRowHeight: number;
    rowClassMode: RowClassModeEnum;
    rowClassAttribute?: ListAttributeValue<string | Big | boolean | Date>;
    rowClassMapping: string;
    rowClassRules: string;
    rowClassDefault: string;
    rowClassExpression: string;
    rowSelectionMode: RowSelectionModeEnum;
    showSelectionCheckboxes: boolean;
    editMode: EditModeEnum;
    stopEditingWhenCellsLoseFocus: boolean;
    undoRedoCellEditing: boolean;
    enableRowDelete: boolean;
    bulkDeleteEnabled: boolean;
    deleteConfirmationEnabled: boolean;
    deleteConfirmationTitle: string;
    deleteConfirmationMessage: string;
    deleteShowInToolbar: boolean;
    deleteShowInContextMenu: boolean;
    deleteButtonLabel: string;
    deleteRequireSelection: boolean;
    enableRowAdd: boolean;
    addShowInToolbar: boolean;
    addButtonLabel: string;
    toolbarButtons: ToolbarButtonsType[];
    agGridVersion: string;
    agGridVersionDate: string;
    widgetBuildDate: string;
    widgetBuildCommit: string;
    useLocalStorage: boolean;
    showToolbarSearch: boolean;
    enableToolbarFilterSearch: boolean;
    pagination: boolean;
    pageSize: number;
    paginationPosition: PaginationPositionEnum;
    rowBuffer: number;
    suppressRowVirtualisation: boolean;
    domLayout: DomLayoutEnum;
    autoSizeStrategy: AutoSizeStrategyEnum;
    skipHeaderOnAutoSize: boolean;
    persistColumnWidths: boolean;
    height: number;
    theme: ThemeEnum;
    themeVariant: ThemeVariantEnum;
    enablePolling: boolean;
    pollingInterval: number;
    enableCsvExport: boolean;
    csvFileName: string;
    csvExportAllColumns: boolean;
    enablePdfExport: boolean;
    pdfFileName: string;
    pdfPageOrientation: PdfPageOrientationEnum;
    pdfDocumentTitle: string;
    enableNotifications: boolean;
    toastPosition: ToastPositionEnum;
    autoHideDuration: number;
    onRowClick?: ListActionValue;
    onRowDoubleClick?: ListActionValue;
    onCellEditCommit?: ListActionValue;
    onDeleteRow?: ListActionValue;
    onAddRow?: ActionValue;
}

export interface AGGridPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    dataSource: {} | { caption: string } | { type: string } | null;
    enableAutoColumns: boolean;
    autoColumnExclusions: string;
    columns: ColumnsPreviewType[];
    enableColumnMenus: boolean;
    enableHeaderFilterButtons: boolean;
    enableFloatingFilters: boolean;
    showToolbar: boolean;
    enableViewSelector: boolean;
    defaultView: DefaultViewEnum;
    mobileDefaultView: MobileDefaultViewEnum;
    customCardTemplate: string;
    customListTemplate: string;
    enableFilterDrawer: boolean;
    customFormatters: CustomFormattersPreviewType[];
    rowHeightMode: RowHeightModeEnum;
    rowHeight: number | null;
    rowHeightExpression: string;
    maxRowHeight: number | null;
    rowClassMode: RowClassModeEnum;
    rowClassAttribute: string;
    rowClassMapping: string;
    rowClassRules: string;
    rowClassDefault: string;
    rowClassExpression: string;
    rowSelectionMode: RowSelectionModeEnum;
    showSelectionCheckboxes: boolean;
    editMode: EditModeEnum;
    stopEditingWhenCellsLoseFocus: boolean;
    undoRedoCellEditing: boolean;
    enableRowDelete: boolean;
    bulkDeleteEnabled: boolean;
    deleteConfirmationEnabled: boolean;
    deleteConfirmationTitle: string;
    deleteConfirmationMessage: string;
    deleteShowInToolbar: boolean;
    deleteShowInContextMenu: boolean;
    deleteButtonLabel: string;
    deleteRequireSelection: boolean;
    enableRowAdd: boolean;
    addShowInToolbar: boolean;
    addButtonLabel: string;
    toolbarButtons: ToolbarButtonsPreviewType[];
    agGridVersion: string;
    agGridVersionDate: string;
    widgetBuildDate: string;
    widgetBuildCommit: string;
    useLocalStorage: boolean;
    showToolbarSearch: boolean;
    enableToolbarFilterSearch: boolean;
    pagination: boolean;
    pageSize: number | null;
    paginationPosition: PaginationPositionEnum;
    rowBuffer: number | null;
    suppressRowVirtualisation: boolean;
    domLayout: DomLayoutEnum;
    autoSizeStrategy: AutoSizeStrategyEnum;
    skipHeaderOnAutoSize: boolean;
    persistColumnWidths: boolean;
    height: number | null;
    theme: ThemeEnum;
    themeVariant: ThemeVariantEnum;
    enablePolling: boolean;
    pollingInterval: number | null;
    enableCsvExport: boolean;
    csvFileName: string;
    csvExportAllColumns: boolean;
    enablePdfExport: boolean;
    pdfFileName: string;
    pdfPageOrientation: PdfPageOrientationEnum;
    pdfDocumentTitle: string;
    enableNotifications: boolean;
    toastPosition: ToastPositionEnum;
    autoHideDuration: number | null;
    onRowClick: {} | null;
    onRowDoubleClick: {} | null;
    onCellEditCommit: {} | null;
    onDeleteRow: {} | null;
    onAddRow: {} | null;
}
