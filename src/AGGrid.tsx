import { Component, ReactNode, createElement } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { AGGridContainerProps } from "../typings/AGGridProps";
import { ValueStatus } from "mendix";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-material.css";

import "./ui/AGGrid.css";

export class AGGrid extends Component<AGGridContainerProps> {
    private gridApi: any;

    private getColumnDefs(): ColDef[] {
        const { columns } = this.props;
        
        return columns.map(col => {
            const colDef: ColDef = {
                headerName: col.header?.value || "",
                field: col.attribute?.id || "",
                width: col.width,
                sortable: col.sortable,
                filter: col.filter,
                resizable: col.resizable,
                valueGetter: (params) => {
                    const item = params.data;
                    if (!item || !col.attribute) return "";
                    
                    const value = col.attribute.get(item);
                    if (value.status !== ValueStatus.Available) return "";
                    
                    return this.formatValue(value.value, col.attribute.type);
                }
            };
            
            return colDef;
        });
    }

    private formatValue(value: any, type: string): string {
        if (value === null || value === undefined) return "";
        
        switch (type) {
            case "Boolean":
                return value ? "Yes" : "No";
            case "DateTime":
                return value instanceof Date ? value.toLocaleString() : String(value);
            case "Decimal":
            case "Long":
            case "Integer":
                return String(value);
            default:
                return String(value);
        }
    }

    private getRowData(): any[] {
        const { dataSource } = this.props;
        
        if (!dataSource || dataSource.status !== ValueStatus.Available) {
            return [];
        }
        
        return dataSource.items || [];
    }

    private onGridReady = (params: GridReadyEvent) => {
        this.gridApi = params.api;
    };

    private onRowClicked = (event: any) => {
        const { onRowClick } = this.props;
        if (onRowClick && onRowClick.canExecute && event.data) {
            onRowClick.execute();
        }
    };

    render(): ReactNode {
        const { theme, height, pagination, pageSize, dataSource } = this.props;
        
        if (!dataSource || dataSource.status === ValueStatus.Loading) {
            return <div className="aggrid-loading">Loading...</div>;
        }

        const columnDefs = this.getColumnDefs();
        const rowData = this.getRowData();
        const themeClass = `ag-theme-${theme}`;

        return (
            <div className="aggrid-container">
                <div 
                    className={themeClass} 
                    style={{ height: `${height}px`, width: "100%" }}
                >
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        pagination={pagination}
                        paginationPageSize={pageSize}
                        onGridReady={this.onGridReady}
                        onRowClicked={this.onRowClicked}
                        animateRows={true}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true
                        }}
                    />
                </div>
            </div>
        );
    }
}
