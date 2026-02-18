import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

// Mock AG Grid modules
jest.mock("../agGridModules", () => ({
    registerModules: jest.fn()
}));

// Track what selection config the mock AgGridReact received
let capturedSelectionConfig: any = undefined;
let capturedOnSelectionChanged: ((event: any) => void) | undefined;
let mockGridApi: any = {};

jest.mock("ag-grid-react", () => ({
    AgGridReact: (props: any) => {
        capturedSelectionConfig = props.rowSelection;
        capturedOnSelectionChanged = props.onSelectionChanged;

        React.useEffect(() => {
            if (props.onGridReady) {
                mockGridApi = {
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
                };
                props.onGridReady({
                    api: mockGridApi,
                    columnApi: {
                        getAllColumns: jest.fn(() => []),
                        getColumn: jest.fn(),
                        setColumnVisible: jest.fn(),
                        getColumnState: jest.fn(() => []),
                        applyColumnState: jest.fn()
                    }
                });
            }
        }, [props.onGridReady]);

        return <div data-testid="ag-grid" />;
    }
}));

jest.mock("ag-grid-community", () => ({
    LicenseManager: {
        setLicenseKey: jest.fn()
    },
    ModuleRegistry: {
        registerModules: jest.fn()
    }
}));

jest.mock("ag-grid-enterprise", () => ({
    LicenseManager: {
        setLicenseKey: jest.fn()
    }
}));

// Create a proper Mendix ListValue mock
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

// Shared base props for the AGGrid widget
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
    rowSelectionMode: "none" as const,
    showSelectionCheckboxes: true,
    enableRowDelete: false,
    bulkDeleteEnabled: false,
    deleteConfirmationEnabled: true,
    deleteConfirmationTitle: "Confirm Delete",
    deleteConfirmationMessage: "Are you sure you want to delete this row?",
    deleteShowInToolbar: true,
    deleteShowInContextMenu: true,
    deleteButtonLabel: "Delete",
    deleteRequireSelection: true,
    enableRowAdd: false,
    addShowInToolbar: true,
    addButtonLabel: "Add",
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

describe("AGGrid – Row Selection Integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedSelectionConfig = undefined;
        capturedOnSelectionChanged = undefined;
        mockGridApi = {};
    });

    // ──────────────────────────────────────────────
    // Selection Mode Wiring (widget → ViewRenderer → GridView)
    // ──────────────────────────────────────────────
    describe("Selection Mode Wiring", () => {
        it("passes rowSelectionMode='multiple' through to AgGridReact", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedSelectionConfig).toEqual({
                mode: "multiRow",
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: true
            });
        });

        it("passes rowSelectionMode='single' through to AgGridReact", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="single"
                />
            );

            expect(capturedSelectionConfig).toEqual({
                mode: "singleRow",
                checkboxes: false,
                enableClickSelection: true
            });
        });

        it("passes rowSelectionMode='none' as undefined to AgGridReact", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="none"
                />
            );

            expect(capturedSelectionConfig).toBeUndefined();
        });

        it("defaults to no selection when prop is omitted", () => {
            const { rowSelectionMode, ...propsWithout } = baseWidgetProps;
            render(<AGGrid {...propsWithout} />);

            expect(capturedSelectionConfig).toBeUndefined();
        });
    });

    // ──────────────────────────────────────────────
    // handleSelectionChanged updates selectedRowCount
    // ──────────────────────────────────────────────
    describe("Selection Changed Callback", () => {
        it("tracks selected row count from selection events", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    enableRowDelete={true}
                    deleteRequireSelection={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any}
                />
            );

            // Delete button should be disabled initially (0 selected rows)
            const deleteBtn = screen.getByRole("button", { name: /delete selected rows/i });
            expect(deleteBtn).toBeDisabled();

            // Simulate selecting 2 rows via the AG Grid callback
            act(() => {
                const mockApi = {
                    getSelectedRows: jest.fn(() => [
                        { id: 1, name: "Alice" },
                        { id: 2, name: "Bob" }
                    ])
                };
                capturedOnSelectionChanged?.({ api: mockApi });
            });

            // After selection, delete button should be enabled
            expect(deleteBtn).toBeEnabled();
        });

        it("re-disables delete button when selection is cleared", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    enableRowDelete={true}
                    deleteRequireSelection={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any}
                />
            );

            const deleteBtn = screen.getByRole("button", { name: /delete selected rows/i });

            // Select some rows
            act(() => {
                capturedOnSelectionChanged?.({
                    api: { getSelectedRows: jest.fn(() => [{ id: 1 }]) }
                });
            });
            expect(deleteBtn).toBeEnabled();

            // Clear selection
            act(() => {
                capturedOnSelectionChanged?.({
                    api: { getSelectedRows: jest.fn(() => []) }
                });
            });
            expect(deleteBtn).toBeDisabled();
        });
    });

    // ──────────────────────────────────────────────
    // Checkbox Configuration
    // ──────────────────────────────────────────────
    describe("Checkbox Configuration", () => {
        it("enables checkboxes in multi-select mode", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedSelectionConfig.checkboxes).toBe(true);
            expect(capturedSelectionConfig.headerCheckbox).toBe(true);
        });

        it("disables checkboxes when showSelectionCheckboxes is false", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={false}
                />
            );

            expect(capturedSelectionConfig.checkboxes).toBe(false);
            expect(capturedSelectionConfig.headerCheckbox).toBe(false);
        });

        it("ignores checkbox setting in single-select mode", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="single"
                    showSelectionCheckboxes={true}
                />
            );

            // Single mode always uses click selection, no checkboxes
            expect(capturedSelectionConfig.checkboxes).toBe(false);
        });
    });

    // ──────────────────────────────────────────────
    // Delete + Selection Validation Warnings
    // ──────────────────────────────────────────────
    describe("Delete + Selection Validation", () => {
        it("logs error when delete requires selection but mode is none", () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();

            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="none"
                    enableRowDelete={true}
                    deleteRequireSelection={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any}
                />
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Row delete requires row selection but Row Selection Mode is 'None'")
            );

            consoleSpy.mockRestore();
        });

        it("logs warning when bulk delete is on but mode is not multiple", () => {
            const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="single"
                    enableRowDelete={true}
                    bulkDeleteEnabled={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any}
                />
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Bulk delete is enabled but Row Selection Mode is not 'Multiple'")
            );

            consoleSpy.mockRestore();
        });

        it("does not log warnings when delete is properly configured with multi-select", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    enableRowDelete={true}
                    bulkDeleteEnabled={true}
                    deleteRequireSelection={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any}
                />
            );

            // Should NOT have the selection-specific warnings
            const selectionErrors = consoleErrorSpy.mock.calls.filter(
                (call) => typeof call[0] === "string" && call[0].includes("Row Selection Mode")
            );
            const selectionWarns = consoleWarnSpy.mock.calls.filter(
                (call) => typeof call[0] === "string" && call[0].includes("Row Selection Mode")
            );

            expect(selectionErrors).toHaveLength(0);
            expect(selectionWarns).toHaveLength(0);

            consoleErrorSpy.mockRestore();
            consoleWarnSpy.mockRestore();
        });
    });

    // ──────────────────────────────────────────────
    // Selection + Toolbar Delete Button Flow
    // ──────────────────────────────────────────────
    describe("Selection + Delete Toolbar Flow", () => {
        it("toolbar delete button is present and disabled with 0 selections", () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    enableRowDelete={true}
                    deleteShowInToolbar={true}
                    deleteRequireSelection={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any}
                />
            );

            const deleteBtn = screen.getByRole("button", { name: /delete selected rows/i });
            expect(deleteBtn).toBeInTheDocument();
            expect(deleteBtn).toBeDisabled();
        });

        it("toolbar delete button enables after selecting rows", async () => {
            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    enableRowDelete={true}
                    deleteShowInToolbar={true}
                    deleteRequireSelection={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute: jest.fn() })) } as any}
                />
            );

            const deleteBtn = screen.getByRole("button", { name: /delete selected rows/i });

            // Simulate user selecting rows
            act(() => {
                capturedOnSelectionChanged?.({
                    api: {
                        getSelectedRows: jest.fn(() => [
                            { id: 1, name: "Alice" },
                            { id: 2, name: "Bob" },
                            { id: 3, name: "Charlie" }
                        ])
                    }
                });
            });

            await waitFor(() => {
                expect(deleteBtn).toBeEnabled();
            });
        });

        it("clicking delete triggers confirmation and executes action", async () => {
            const execute = jest.fn();
            const user = userEvent.setup();
            const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

            render(
                <AGGrid
                    {...baseWidgetProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    enableRowDelete={true}
                    deleteShowInToolbar={true}
                    deleteRequireSelection={true}
                    deleteConfirmationEnabled={true}
                    onDeleteRow={{ get: jest.fn(() => ({ canExecute: true, execute })) } as any}
                />
            );

            // Select a row first
            mockGridApi.getSelectedRows = jest.fn(() => [{ id: 1, name: "Alice" }]);

            act(() => {
                capturedOnSelectionChanged?.({
                    api: { getSelectedRows: jest.fn(() => [{ id: 1, name: "Alice" }]) }
                });
            });

            const deleteBtn = await screen.findByRole("button", { name: /delete selected rows/i });

            await user.click(deleteBtn);

            await waitFor(() => {
                expect(confirmSpy).toHaveBeenCalled();
                expect(execute).toHaveBeenCalled();
            });

            confirmSpy.mockRestore();
        });
    });
});
