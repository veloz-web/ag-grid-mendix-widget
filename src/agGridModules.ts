// src/agGridModules.ts  // ← Fixed extension
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ColumnApiModule,
    CsvExportModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    QuickFilterModule,
    RowAutoHeightModule,
    RowSelectionModule,
    TextFilterModule,
} from "ag-grid-community";

// Register only the modules we need for optimal bundle size
ModuleRegistry.registerModules([
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ColumnApiModule,
    CsvExportModule,
    DateFilterModule,
    NumberFilterModule,
    PaginationModule,
    QuickFilterModule,
    RowAutoHeightModule,
    RowSelectionModule,
    TextFilterModule,
]);
