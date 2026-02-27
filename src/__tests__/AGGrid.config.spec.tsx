import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AGGrid } from "../AGGrid";

// Mock Mendix dependencies
jest.mock("mendix", () => ({
    ValueStatus: {
        Available: "available",
        Unavailable: "unavailable",
        Loading: "loading"
    }
}));

jest.mock("../agGridModules", () => ({
    registerModules: jest.fn()
}));

// Capture props passed all the way through to AgGridReact
let capturedProps: Record<string, any> = {};

jest.mock("ag-grid-react", () => ({
    AgGridReact: (props: any) => {
        capturedProps = props;
        const { onGridReady } = props;

        React.useEffect(() => {
            if (onGridReady) {
                onGridReady({
                    api: {
                        sizeColumnsToFit: jest.fn(),
                        setFilterModel: jest.fn(),
                        setGridOption: jest.fn(),
                        getFilterModel: jest.fn(),
                        refreshCells: jest.fn(),
                        redrawRows: jest.fn(),
                        setQuickFilter: jest.fn(),
                        getDisplayedRowCount: jest.fn(() => 0),
                        forEachNode: jest.fn(),
                        getSelectedNodes: jest.fn(() => []),
                        getSelectedRows: jest.fn(() => []),
                        deselectAll: jest.fn(),
                        selectAll: jest.fn(),
                        ensureColumnVisible: jest.fn(),
                        getColumnState: jest.fn(() => []),
                        applyColumnState: jest.fn(),
                        setColumnVisible: jest.fn(),
                        getSortModel: jest.fn(() => []),
                        setSortModel: jest.fn(),
                        applyTransaction: jest.fn()
                    },
                    columnApi: {
                        getAllColumns: jest.fn(() => []),
                        getColumn: jest.fn(),
                        setColumnVisible: jest.fn(),
                        getColumnState: jest.fn(() => []),
                        applyColumnState: jest.fn()
                    }
                });
            }
        }, [onGridReady]);

        return <div data-testid="ag-grid" />;
    }
}));

jest.mock("ag-grid-community", () => ({
    LicenseManager: { setLicenseKey: jest.fn() },
    ModuleRegistry: { registerModules: jest.fn() }
}));

jest.mock("ag-grid-enterprise", () => ({
    LicenseManager: { setLicenseKey: jest.fn() }
}));

const createMockListValue = (status: any = "available") => ({
    status,
    items: [],
    offset: 0,
    limit: 20,
    sortOrder: [],
    filter: {} as any,
    sort: {} as any,
    setOffset: jest.fn(),
    setLimit: jest.fn(),
    reload: jest.fn(),
    requestTotalCount: jest.fn(),
    setSortOrder: jest.fn(),
    setFilter: jest.fn()
});

const baseWidgetProps: any = {
    name: "testGrid",
    class: "",
    style: {},
    dataSource: createMockListValue(),
    rowModelType: "clientSide" as const,
    serverSideMicroflow: "",
    entityName: "",
    cacheBlockSize: 100,
    maxBlocksInCache: 0,
    maxConcurrentRequests: 2,
    columns: [],
    enableColumnMenus: true,
    enableHeaderFilterButtons: true,
    enableFloatingFilters: false,
    enableViewSelector: true,
    showToolbar: true,
    defaultView: "grid" as const,
    mobileDefaultView: "cards" as const,
    customCardTemplate: "",
    customListTemplate: "",
    enableFilterDrawer: true,
    customFormatters: [],
    enableSideBar: false,
    enableStatusBar: false,
    enableAggregationFooter: false,
    enableRowGrouping: false,
    groupDefaultExpanded: 0,
    showGroupRowsOnSeparateLine: false,
    suppressAggregationOnGroupRows: false,
    rowHeightMode: "fixed" as const,
    rowHeight: 40,
    rowHeightExpression: "",
    maxRowHeight: 0,
    rowClassMode: "none" as const,
    rowClassAttribute: undefined,
    rowClassMapping: "",
    rowClassRules: "",
    rowClassDefault: "",
    rowClassExpression: "",
    editMode: "cell" as const,
    stopEditingWhenCellsLoseFocus: true,
    undoRedoCellEditing: false,
    licenseKey: "",
    agGridVersion: "34.3.1",
    agGridVersionDate: "",
    widgetBuildDate: "",
    widgetBuildCommit: "",
    rowSelectionMode: "none" as const,
    showSelectionCheckboxes: true,
    enableRowDelete: false,
    bulkDeleteEnabled: false,
    deleteConfirmationEnabled: true,
    deleteConfirmationTitle: "Confirm Delete",
    deleteConfirmationMessage: "Are you sure?",
    deleteShowInToolbar: true,
    deleteShowInContextMenu: true,
    deleteButtonLabel: "Delete",
    deleteRequireSelection: true,
    enableRowAdd: false,
    addShowInToolbar: true,
    addButtonLabel: "Add",
    toolbarButtons: [],
    enableContextMenu: false,
    useLocalStorage: false,
    showToolbarSearch: true,
    enableToolbarFilterSearch: true,
    pagination: true,
    pageSize: 20,
    paginationPosition: "bottom" as const,
    rowBuffer: 10,
    suppressRowVirtualisation: false,
    height: 500,
    theme: "material" as const,
    themeVariant: "auto" as const,
    enablePolling: false,
    pollingInterval: 60,
    enableCsvExport: false,
    csvFileName: "export",
    csvExportAllColumns: false,
    enableExcelExport: false,
    excelFileName: "export",
    excelExportAllColumns: false,
    enablePdfExport: false,
    pdfFileName: "export",
    pdfPageOrientation: "landscape" as any,
    pdfDocumentTitle: "",
    enableNotifications: false,
    toastPosition: "topRight" as const,
    autoHideDuration: 0,
    onRowClick: undefined,
    onRowDoubleClick: undefined,
    onCellEditCommit: undefined,
    onDeleteRow: undefined,
    onAddRow: undefined
};

describe("AGGrid – Grid Config E2E", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedProps = {};
    });

    // ══════════════════════════════════════════════
    // Pagination flows from widget props → AG Grid
    // ══════════════════════════════════════════════
    describe("Pagination Wiring", () => {
        it("enables pagination with bottom position (default)", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    pagination={true}
                    pageSize={20}
                    paginationPosition="bottom"
                />
            );

            expect(capturedProps.pagination).toBe(true);
            expect(capturedProps.paginationPageSize).toBe(20);
        });

        it("enables pagination with top position", () => {
            jest.useFakeTimers();

            render(
                <AGGrid
                    {...baseWidgetProps}
                    pagination={true}
                    pageSize={25}
                    paginationPosition="top"
                />
            );

            // The top-position effect runs inside GridView
            jest.advanceTimersByTime(1100);

            expect(capturedProps.pagination).toBe(true);
            expect(capturedProps.paginationPageSize).toBe(25);

            jest.useRealTimers();
        });

        it("disables pagination entirely", () => {
            render(<AGGrid {...baseWidgetProps} pagination={false} />);

            expect(capturedProps.pagination).toBe(false);
        });

        it("passes custom page size through the pipeline", () => {
            render(<AGGrid {...baseWidgetProps} pagination={true} pageSize={100} />);

            expect(capturedProps.paginationPageSize).toBe(100);
        });
    });

    // ══════════════════════════════════════════════
    // DOM Layout flows from widget props → AG Grid
    // ══════════════════════════════════════════════
    describe("DOM Layout Wiring", () => {
        it("defaults to normal layout", () => {
            render(<AGGrid {...baseWidgetProps} />);

            expect(capturedProps.domLayout).toBe("normal");
        });

        it("passes autoHeight through the pipeline", () => {
            // autoHeight requires pagination=false and suppressRowVirtualisation=true
            render(
                <AGGrid
                    {...baseWidgetProps}
                    domLayout="autoHeight"
                    pagination={false}
                    suppressRowVirtualisation={true}
                />
            );

            expect(capturedProps.domLayout).toBe("autoHeight");
        });

        it("passes print layout through the pipeline", () => {
            // print requires pagination=false and suppressRowVirtualisation=true
            render(
                <AGGrid
                    {...baseWidgetProps}
                    domLayout="print"
                    pagination={false}
                    suppressRowVirtualisation={true}
                />
            );

            expect(capturedProps.domLayout).toBe("print");
        });
    });

    // ══════════════════════════════════════════════
    // Column Menu / Filter / Floating Filter Wiring
    // ══════════════════════════════════════════════
    describe("Column UI Feature Wiring", () => {
        it("enables all column UI features", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    enableColumnMenus={true}
                    enableHeaderFilterButtons={true}
                    enableFloatingFilters={true}
                />
            );

            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(false);
            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(false);
            expect(capturedProps.defaultColDef.floatingFilter).toBe(true);
        });

        it("disables all column UI features", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    enableColumnMenus={false}
                    enableHeaderFilterButtons={false}
                    enableFloatingFilters={false}
                />
            );

            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(true);
            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(true);
            expect(capturedProps.defaultColDef.floatingFilter).toBe(false);
        });
    });

    // ══════════════════════════════════════════════
    // Side Bar + Status Bar Wiring
    // ══════════════════════════════════════════════
    describe("Side Bar & Status Bar Wiring", () => {
        it("enables sidebar through widget props", () => {
            render(<AGGrid {...baseWidgetProps} enableSideBar={true} />);

            expect(capturedProps.sideBar).toBe(true);
        });

        it("disables sidebar by default", () => {
            render(<AGGrid {...baseWidgetProps} enableSideBar={false} />);

            expect(capturedProps.sideBar).toBeUndefined();
        });

        it("enables status bar with all panels through widget props", () => {
            render(<AGGrid {...baseWidgetProps} enableStatusBar={true} />);

            expect(capturedProps.statusBar).toBeDefined();
            expect(capturedProps.statusBar.statusPanels).toHaveLength(4);
        });

        it("disables status bar by default", () => {
            render(<AGGrid {...baseWidgetProps} enableStatusBar={false} />);

            expect(capturedProps.statusBar).toBeUndefined();
        });
    });

    // ══════════════════════════════════════════════
    // Context Menu Wiring
    // ══════════════════════════════════════════════
    describe("Context Menu Wiring", () => {
        it("suppresses context menu when disabled", () => {
            render(<AGGrid {...baseWidgetProps} enableContextMenu={false} />);

            expect(capturedProps.suppressContextMenu).toBe(true);
        });

        it("enables context menu when configured", () => {
            render(<AGGrid {...baseWidgetProps} enableContextMenu={true} />);

            expect(capturedProps.suppressContextMenu).toBe(false);
        });
    });

    // ══════════════════════════════════════════════
    // Edit Mode Wiring
    // ══════════════════════════════════════════════
    describe("Edit Mode Wiring", () => {
        it("defaults to cell edit mode (no editType)", () => {
            render(<AGGrid {...baseWidgetProps} editMode="cell" />);

            expect(capturedProps.editType).toBeUndefined();
        });

        it("passes row edit mode as fullRow", () => {
            render(<AGGrid {...baseWidgetProps} editMode="row" />);

            expect(capturedProps.editType).toBe("fullRow");
        });
    });

    // ══════════════════════════════════════════════
    // Virtual Scrolling Wiring
    // ══════════════════════════════════════════════
    describe("Virtual Scrolling Wiring", () => {
        it("passes rowBuffer through", () => {
            render(<AGGrid {...baseWidgetProps} rowBuffer={25} />);

            expect(capturedProps.rowBuffer).toBe(25);
        });

        it("passes suppressRowVirtualisation through", () => {
            render(<AGGrid {...baseWidgetProps} suppressRowVirtualisation={true} />);

            expect(capturedProps.suppressRowVirtualisation).toBe(true);
        });
    });

    // ══════════════════════════════════════════════
    // Full Enterprise Scenario
    // ══════════════════════════════════════════════
    describe("Full Enterprise Scenario", () => {
        it("wires all enterprise features together", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    pagination={true}
                    pageSize={50}
                    paginationPosition="bottom"
                    enableSideBar={true}
                    enableStatusBar={true}
                    enableFloatingFilters={true}
                    enableContextMenu={true}
                    enableColumnMenus={true}
                    enableHeaderFilterButtons={true}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    editMode="cell"
                />
            );

            // Pagination
            expect(capturedProps.pagination).toBe(true);
            expect(capturedProps.paginationPageSize).toBe(50);

            // Enterprise panels
            expect(capturedProps.sideBar).toBe(true);
            expect(capturedProps.statusBar).toBeDefined();

            // Column UI
            expect(capturedProps.defaultColDef.floatingFilter).toBe(true);
            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(false);
            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(false);

            // Context menu
            expect(capturedProps.suppressContextMenu).toBe(false);

            // Selection
            expect(capturedProps.rowSelection).toEqual({
                mode: "multiRow",
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: true
            });
        });
    });

    // ══════════════════════════════════════════════
    // Toolbar Visibility
    // ══════════════════════════════════════════════
    describe("Toolbar Visibility", () => {
        it("renders toolbar by default (showToolbar=true)", () => {
            const { container } = render(<AGGrid {...baseWidgetProps} showToolbar={true} />);

            const toolbar = container.querySelector(".aggrid-toolbar");
            expect(toolbar).toBeInTheDocument();
        });

        it("hides toolbar when showToolbar is false", () => {
            const { container } = render(<AGGrid {...baseWidgetProps} showToolbar={false} />);

            const toolbar = container.querySelector(".aggrid-toolbar");
            expect(toolbar).not.toBeInTheDocument();
        });

        it("still renders the grid when toolbar is hidden", () => {
            render(<AGGrid {...baseWidgetProps} showToolbar={false} />);

            const grids = screen.getAllByTestId("ag-grid");
            expect(grids.length).toBeGreaterThan(0);
        });

        it("renders toolbar search when toolbar is visible", () => {
            const { container } = render(
                <AGGrid {...baseWidgetProps} showToolbar={true} showToolbarSearch={true} />
            );

            const toolbar = container.querySelector(".aggrid-toolbar");
            expect(toolbar).toBeInTheDocument();
        });

        it("hides toolbar search along with toolbar when hidden", () => {
            const { container } = render(
                <AGGrid {...baseWidgetProps} showToolbar={false} showToolbarSearch={true} />
            );

            const toolbar = container.querySelector(".aggrid-toolbar");
            expect(toolbar).not.toBeInTheDocument();

            // Search input should not exist either
            const searchInput = container.querySelector(".aggrid-toolbar-search");
            expect(searchInput).not.toBeInTheDocument();
        });

        it("hides filter button along with toolbar when hidden", () => {
            render(<AGGrid {...baseWidgetProps} showToolbar={false} enableFilterDrawer={true} />);

            const filterButton = screen.queryByRole("button", { name: /filters/i });
            expect(filterButton).not.toBeInTheDocument();
        });

        it("hides column visibility button along with toolbar when hidden", () => {
            render(<AGGrid {...baseWidgetProps} showToolbar={false} />);

            const colVisButton = screen.queryByRole("button", { name: /column visibility/i });
            expect(colVisButton).not.toBeInTheDocument();
        });

        it("hides export buttons along with toolbar when hidden", () => {
            const { container } = render(
                <AGGrid
                    {...baseWidgetProps}
                    showToolbar={false}
                    enableCsvExport={true}
                    enableExcelExport={true}
                />
            );

            const toolbar = container.querySelector(".aggrid-toolbar");
            expect(toolbar).not.toBeInTheDocument();
        });

        it("hides delete button along with toolbar when hidden", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    showToolbar={false}
                    enableRowDelete={true}
                    deleteShowInToolbar={true}
                    rowSelectionMode="multiple"
                    onDeleteRow={
                        { get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any
                    }
                />
            );

            const deleteButton = screen.queryByRole("button", { name: /delete selected rows/i });
            expect(deleteButton).not.toBeInTheDocument();
        });

        it("hides add button along with toolbar when hidden", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    showToolbar={false}
                    enableRowAdd={true}
                    addShowInToolbar={true}
                    onAddRow={
                        { get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any
                    }
                />
            );

            const addButton = screen.queryByRole("button", { name: /add/i });
            expect(addButton).not.toBeInTheDocument();
        });

        it("defaults to showing toolbar when prop is omitted", () => {
            const { showToolbar, ...propsWithout } = baseWidgetProps;
            const { container } = render(<AGGrid {...propsWithout} />);

            // showToolbar defaults to true in XML, so toolbar should render
            // The component checks `props.showToolbar !== false`
            const toolbar = container.querySelector(".aggrid-toolbar");
            expect(toolbar).toBeInTheDocument();
        });
    });
});
