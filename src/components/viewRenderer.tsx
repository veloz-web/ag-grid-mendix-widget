// src/components/ViewRenderer.js
import { GridView } from "./GridView";
import { DynamicView } from "./CardView"; // Assuming CardView is DynamicView
import { CustomTemplateView } from "./CustomTemplateView";

export const ViewRenderer = ({
    currentView,
    rowData,
    columns,
    themeClassName,
    height,
    pagination,
    pageSize,
    onGridReady,
    onRowClicked,
    onSortChanged,
    onFilterChanged,
    onColumnMoved,
    columnVisibility,
    columnOrder,
    customFormatterRegistry,
    customCardTemplate,
    customListTemplate,
    onRowClick // Pass onRowClick to custom views
}) => {
    if (currentView === "grid") {
        return (
            <GridView
                rowData={rowData}
                columns={columns}
                themeClassName={themeClassName} // <-- Fixed: Pass themeClassName
                height={height}
                pagination={pagination}
                pageSize={pageSize}
                onGridReady={onGridReady}
                onRowClicked={onRowClicked}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                columnVisibility={columnVisibility}
                columnOrder={columnOrder}
                customFormatterRegistry={customFormatterRegistry}
            />
        );
    }

    if (currentView === "cards") {
        return customCardTemplate ? (
            <CustomTemplateView
                rowData={rowData}
                columns={columns}
                template={customCardTemplate}
                onRowClick={onRowClick} // <-- Fixed: Pass onRowClick
                className="aggrid-card-view"
                customFormatterRegistry={customFormatterRegistry}
            />
        ) : (
            <DynamicView rowData={rowData} columns={columns} onRowClick={onRowClick} />
        );
    }

    if (currentView === "list") {
        return customListTemplate ? (
            <CustomTemplateView
                rowData={rowData}
                columns={columns}
                template={customListTemplate}
                onRowClick={onRowClick} // <-- Fixed: Pass onRowClick
                className="aggrid-list-view"
                customFormatterRegistry={customFormatterRegistry}
            />
        ) : (
            <GridView
                rowData={rowData}
                columns={columns}
                themeClassName={themeClassName} // <-- Fixed: Pass themeClassName
                height={height}
                pagination={pagination}
                pageSize={pageSize}
                onGridReady={onGridReady}
                onRowClicked={onRowClicked}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                columnVisibility={columnVisibility}
                columnOrder={columnOrder}
                customFormatterRegistry={customFormatterRegistry}
            />
        );
    }

    if (currentView === "harden") {
        return (
            <GridView
                rowData={rowData}
                columns={columns}
                themeClassName={themeClassName} // <-- Fixed: Pass themeClassName
                height={height}
                pagination={pagination}
                pageSize={pageSize}
                onGridReady={onGridReady}
                onRowClicked={onRowClicked}
                onSortChanged={onSortChanged}
                onFilterChanged={onFilterChanged}
                onColumnMoved={onColumnMoved}
                columnVisibility={columnVisibility}
                columnOrder={columnOrder}
                customFormatterRegistry={customFormatterRegistry}
            />
        );
    }

    return null;
};
