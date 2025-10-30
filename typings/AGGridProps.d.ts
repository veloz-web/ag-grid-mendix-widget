/**
 * This file was generated from AGGrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type AlignmentEnum = "auto" | "left" | "center" | "right";

export type WidthTypeEnum = "auto" | "flex" | "fixed";

export type DefaultSortEnum = "none" | "asc" | "desc";

export type FilterLocationEnum = "none" | "drawer" | "toolbar";

export type FormatterEnum = "none" | "currency" | "currencyEUR" | "currencyGBP" | "percentage" | "number" | "decimal2" | "dateShort" | "dateLong" | "dateISO" | "dateDMY" | "dateMDY" | "dateYMD" | "dateTime" | "time" | "yesNo" | "trueFalse" | "uppercase" | "lowercase" | "capitalize" | "customPrefix" | "link" | "statusBadge";

export interface ColumnsType {
    header: DynamicValue<string>;
    attribute: ListAttributeValue<string | Big | boolean | Date>;
    hidden: boolean;
    alignment: AlignmentEnum;
    widthType: WidthTypeEnum;
    width: number;
    flex: number;
    minWidth: number;
    maxWidth: number;
    resizable: boolean;
    draggable: boolean;
    sortable: boolean;
    defaultSort: DefaultSortEnum;
    sortIndex: number;
    includeInSort: boolean;
    filter: boolean;
    filterLocation: FilterLocationEnum;
    formatter: FormatterEnum;
    customFormatterName: string;
    customPrefix: string;
    customSuffix: string;
    template: string;
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

export type ThemeEnum = "alpine" | "balham" | "material" | "quartz";

export interface ColumnsPreviewType {
    header: string;
    attribute: string;
    hidden: boolean;
    alignment: AlignmentEnum;
    widthType: WidthTypeEnum;
    width: number | null;
    flex: number | null;
    minWidth: number | null;
    maxWidth: number | null;
    resizable: boolean;
    draggable: boolean;
    sortable: boolean;
    defaultSort: DefaultSortEnum;
    sortIndex: number | null;
    includeInSort: boolean;
    filter: boolean;
    filterLocation: FilterLocationEnum;
    formatter: FormatterEnum;
    customFormatterName: string;
    customPrefix: string;
    customSuffix: string;
    template: string;
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

export interface AGGridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource: ListValue;
    columns: ColumnsType[];
    enableViewSelector: boolean;
    defaultView: DefaultViewEnum;
    mobileDefaultView: MobileDefaultViewEnum;
    customCardTemplate: string;
    customListTemplate: string;
    enableFilterDrawer: boolean;
    customFormatters: CustomFormattersType[];
    licenseKey: string;
    useLocalStorage: boolean;
    showToolbarSearch: boolean;
    enableToolbarFilterSearch: boolean;
    pagination: boolean;
    pageSize: number;
    height: number;
    theme: ThemeEnum;
    onRowClick?: ListActionValue;
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
    columns: ColumnsPreviewType[];
    enableViewSelector: boolean;
    defaultView: DefaultViewEnum;
    mobileDefaultView: MobileDefaultViewEnum;
    customCardTemplate: string;
    customListTemplate: string;
    enableFilterDrawer: boolean;
    customFormatters: CustomFormattersPreviewType[];
    licenseKey: string;
    useLocalStorage: boolean;
    showToolbarSearch: boolean;
    enableToolbarFilterSearch: boolean;
    pagination: boolean;
    pageSize: number | null;
    height: number | null;
    theme: ThemeEnum;
    onRowClick: {} | null;
}
