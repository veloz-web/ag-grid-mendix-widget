/**
 * This file was generated from AGGrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface ColumnsType {
    header: DynamicValue<string>;
    attribute: ListAttributeValue<string | Big | boolean | Date>;
    width: number;
    sortable: boolean;
    filter: boolean;
    resizable: boolean;
}

export type ThemeEnum = "alpine" | "balham" | "material";

export interface ColumnsPreviewType {
    header: string;
    attribute: string;
    width: number | null;
    sortable: boolean;
    filter: boolean;
    resizable: boolean;
}

export interface AGGridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource: ListValue;
    columns: ColumnsType[];
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
    pagination: boolean;
    pageSize: number | null;
    height: number | null;
    theme: ThemeEnum;
    onRowClick: {} | null;
}
