// src/agGridModules.js
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    ColumnApiModule,
    QuickFilterModule
} from "ag-grid-community";
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ColumnsToolPanelModule,
    MenuModule,
    PaginationModule,
    ServerSideRowModelModule,
    SetFilterModule
} from "ag-grid-enterprise";

// Register only the modules we need for optimal bundle size
ModuleRegistry.registerModules([
    ClientSideRowModelModule, // Required for rowData prop
    ClientSideRowModelApiModule, // Enterprise: API methods
    ServerSideRowModelModule, // Enterprise: Server-side row model
    QuickFilterModule, // Community: Quick filter feature
    ColumnApiModule, // Community: Column API features
    PaginationModule, // Enterprise: Pagination features
    SetFilterModule, // Enterprise: Set filtering
    CellStyleModule, // Enterprise: Cell styling
    ColumnsToolPanelModule, // Enterprise: Column visibility/reordering
    MenuModule // Enterprise: Context menus
]);
