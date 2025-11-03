// src/agGridModules.ts  // ← Fixed extension
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
    SetFilterModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    MultiFilterModule
} from "ag-grid-enterprise";

// Register only the modules we need for optimal bundle size
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ServerSideRowModelModule, // Remove if not using server-side row model
    QuickFilterModule,
    ColumnApiModule,
    PaginationModule,
    SetFilterModule,
    CellStyleModule,
    ColumnsToolPanelModule,
    MenuModule, // ← Fixed trailing comma
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    MultiFilterModule
]);
