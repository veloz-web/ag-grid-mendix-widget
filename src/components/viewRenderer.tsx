// src/components/ViewRenderer.tsx
import { GridView } from "./GridView";
import { DynamicView } from "./CardView";
import { CustomTemplateView } from "./CustomTemplateView";
import type {
    GridDataConfig,
    GridDisplayConfig,
    GridUIFeatures,
    GridAdvancedFeatures,
    GridGroupingConfig,
    GridCallbacks,
    GridTemplateConfig
} from "../types/gridConfig";
import { ViewMode } from "../types";

export interface ViewRendererProps {
    currentView: ViewMode;
    data: GridDataConfig;
    display: GridDisplayConfig;
    uiFeatures: GridUIFeatures;
    advancedFeatures: GridAdvancedFeatures;
    grouping: GridGroupingConfig;
    callbacks: GridCallbacks;
    templates: GridTemplateConfig;
    rowModelType?: "clientSide" | "serverSide";
}

export const ViewRenderer = ({
    currentView,
    data,
    display,
    uiFeatures,
    advancedFeatures,
    grouping,
    callbacks,
    templates,
    rowModelType
}: ViewRendererProps) => {
    if (currentView === "grid") {
        return (
            <GridView
                rowData={data.rowData}
                columns={data.columns}
                themeClassName={display.themeClassName}
                height={display.height}
                pagination={display.pagination}
                pageSize={display.pageSize}
                onGridReady={callbacks.onGridReady}
                onRowClicked={callbacks.onRowClicked}
                onSortChanged={callbacks.onSortChanged}
                onFilterChanged={callbacks.onFilterChanged}
                onColumnMoved={callbacks.onColumnMoved}
                onColumnPinned={callbacks.onColumnPinned}
                columnVisibility={data.columnVisibility}
                columnOrder={data.columnOrder}
                customFormatterRegistry={data.customFormatterRegistry}
                enableContextMenu={uiFeatures.enableContextMenu}
                enableSideBar={uiFeatures.enableSideBar}
                enableStatusBar={uiFeatures.enableStatusBar}
                enableAggregationFooter={advancedFeatures.enableAggregationFooter}
                enableRowGrouping={grouping.enabled}
                groupDefaultExpanded={grouping.defaultExpanded}
                showGroupRowsOnSeparateLine={grouping.showOnSeparateLine}
                suppressAggregationOnGroupRows={grouping.suppressAggregationOnRows}
                enableColumnMenus={uiFeatures.enableColumnMenus}
                enableHeaderFilterButtons={uiFeatures.enableHeaderFilterButtons}
                enableFloatingFilters={uiFeatures.enableFloatingFilters}
                onOpenColumnVisibility={callbacks.onOpenColumnVisibility}
                onOpenHiddenDrawer={callbacks.onOpenHiddenDrawer}
                rowModelType={rowModelType}
            />
        );
    }

    if (currentView === "cards") {
        return templates.customCardTemplate ? (
            <CustomTemplateView
                rowData={data.rowData}
                columns={data.columns}
                template={templates.customCardTemplate as string}
                onRowClick={callbacks.onRowClick}
                className="aggrid-card-view"
                customFormatterRegistry={data.customFormatterRegistry}
            />
        ) : (
            <DynamicView
                rowData={data.rowData}
                columns={data.columns}
                onRowClick={callbacks.onRowClick}
            />
        );
    }

    if (currentView === "list") {
        return templates.customListTemplate ? (
            <CustomTemplateView
                rowData={data.rowData}
                columns={data.columns}
                template={templates.customListTemplate as string}
                onRowClick={callbacks.onRowClick}
                className="aggrid-list-view"
                customFormatterRegistry={data.customFormatterRegistry}
            />
        ) : (
            <GridView
                rowData={data.rowData}
                columns={data.columns}
                themeClassName={display.themeClassName}
                height={display.height}
                pagination={display.pagination}
                pageSize={display.pageSize}
                onGridReady={callbacks.onGridReady}
                onRowClicked={callbacks.onRowClicked}
                onSortChanged={callbacks.onSortChanged}
                onFilterChanged={callbacks.onFilterChanged}
                onColumnMoved={callbacks.onColumnMoved}
                onColumnPinned={callbacks.onColumnPinned}
                columnVisibility={data.columnVisibility}
                columnOrder={data.columnOrder}
                customFormatterRegistry={data.customFormatterRegistry}
                enableContextMenu={uiFeatures.enableContextMenu}
                enableSideBar={uiFeatures.enableSideBar}
                enableStatusBar={uiFeatures.enableStatusBar}
                enableAggregationFooter={advancedFeatures.enableAggregationFooter}
                enableRowGrouping={grouping.enabled}
                groupDefaultExpanded={grouping.defaultExpanded}
                showGroupRowsOnSeparateLine={grouping.showOnSeparateLine}
                suppressAggregationOnGroupRows={grouping.suppressAggregationOnRows}
                enableColumnMenus={uiFeatures.enableColumnMenus}
                enableHeaderFilterButtons={uiFeatures.enableHeaderFilterButtons}
                enableFloatingFilters={uiFeatures.enableFloatingFilters}
            />
        );
    }

    if (currentView === "harden") {
        return (
            <GridView
                rowData={data.rowData}
                columns={data.columns}
                themeClassName={display.themeClassName}
                height={display.height}
                pagination={display.pagination}
                pageSize={display.pageSize}
                onGridReady={callbacks.onGridReady}
                onRowClicked={callbacks.onRowClicked}
                onSortChanged={callbacks.onSortChanged}
                onFilterChanged={callbacks.onFilterChanged}
                onColumnMoved={callbacks.onColumnMoved}
                onColumnPinned={callbacks.onColumnPinned}
                columnVisibility={data.columnVisibility}
                columnOrder={data.columnOrder}
                customFormatterRegistry={data.customFormatterRegistry}
                enableContextMenu={uiFeatures.enableContextMenu}
                enableSideBar={uiFeatures.enableSideBar}
                enableStatusBar={uiFeatures.enableStatusBar}
                enableAggregationFooter={advancedFeatures.enableAggregationFooter}
                enableRowGrouping={grouping.enabled}
                groupDefaultExpanded={grouping.defaultExpanded}
                showGroupRowsOnSeparateLine={grouping.showOnSeparateLine}
                suppressAggregationOnGroupRows={grouping.suppressAggregationOnRows}
                enableColumnMenus={uiFeatures.enableColumnMenus}
                enableHeaderFilterButtons={uiFeatures.enableHeaderFilterButtons}
                enableFloatingFilters={uiFeatures.enableFloatingFilters}
            />
        );
    }

    return null;
};
