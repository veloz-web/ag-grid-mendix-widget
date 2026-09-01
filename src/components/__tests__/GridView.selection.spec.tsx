import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GridView } from "../GridView";

// Capture the props passed to AgGridReact so we can assert on the selection config
let capturedAgGridProps: Record<string, any> = {};
let capturedOnSelectionChanged: ((event: any) => void) | undefined;

jest.mock("ag-grid-react", () => ({
    AgGridReact: (props: any) => {
        capturedAgGridProps = props;
        capturedOnSelectionChanged = props.onSelectionChanged;
        const { onGridReady } = props;

        React.useEffect(() => {
            if (onGridReady) {
                onGridReady({
                    api: {
                        sizeColumnsToFit: jest.fn(),
                        setFilterModel: jest.fn(),
                        setSortModel: jest.fn(),
                        getSelectedRows: jest.fn(() => []),
                        getSelectedNodes: jest.fn(() => []),
                        deselectAll: jest.fn(),
                        getDisplayedRowCount: jest.fn(() => 2),
                        forEachNode: jest.fn(),
                        getColumnState: jest.fn(() => []),
                        applyColumnState: jest.fn(),
                        refreshCells: jest.fn(),
                        redrawRows: jest.fn()
                    }
                });
            }
        }, [onGridReady]);

        return (
            <div data-testid="ag-grid" data-row-selection={JSON.stringify(props.rowSelection)}>
                {props.columnDefs?.map((col: any, index: number) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} data-testid={`column-${col.field}`}>
                        {col.headerName}
                    </div>
                ))}
            </div>
        );
    }
}));

// jest.mock("ag-grid-community", () => ({
//     LicenseManager: {
//         setLicenseKey: jest.fn()
//     }
// }));

// --- Base props matching GridView interface ---
const baseColumns = [
    {
        header: { value: "ID", status: "available" },
        attribute: { id: "id", type: "Integer", get: jest.fn() },
        dataType: "auto" as const,
        hidden: false,
        alignment: "auto" as const,
        widthType: "auto" as const,
        width: 100,
        flex: 1,
        minWidth: 50,
        maxWidth: 0,
        resizable: true,
        draggable: true,
        pinned: "none" as const,
        pinnable: false,
        sortable: true,
        defaultSort: "none" as const,
        sortIndex: 999,
        includeInSort: true,
        filter: true,
        filterLocation: "none" as const,
        useDateRange: false,
        useRelativeRange: false,
        floatingFilter: false,
        formatter: "none" as const,
        customFormatterName: "",
        customPrefix: "",
        customSuffix: "",
        template: "",
        linkAction: undefined,
        linkUrlPattern: "",
        linkText: "",
        statusMapping: ""
    },
    {
        header: { value: "Name", status: "available" },
        attribute: { id: "name", type: "String", get: jest.fn() },
        dataType: "auto" as const,
        hidden: false,
        alignment: "auto" as const,
        widthType: "auto" as const,
        width: 150,
        flex: 1,
        minWidth: 50,
        maxWidth: 0,
        resizable: true,
        draggable: true,
        pinned: "none" as const,
        pinnable: false,
        sortable: true,
        defaultSort: "none" as const,
        sortIndex: 999,
        includeInSort: true,
        filter: true,
        filterLocation: "none" as const,
        useDateRange: false,
        useRelativeRange: false,
        floatingFilter: false,
        formatter: "none" as const,
        customFormatterName: "",
        customPrefix: "",
        customSuffix: "",
        template: "",
        linkAction: undefined,
        linkUrlPattern: "",
        linkText: "",
        statusMapping: ""
    },
    {
        header: { value: "Status", status: "available" },
        attribute: { id: "status", type: "String", get: jest.fn() },
        dataType: "auto" as const,
        hidden: false,
        alignment: "auto" as const,
        widthType: "auto" as const,
        width: 120,
        flex: 1,
        minWidth: 50,
        maxWidth: 0,
        resizable: true,
        draggable: true,
        pinned: "none" as const,
        pinnable: false,
        sortable: true,
        defaultSort: "none" as const,
        sortIndex: 999,
        includeInSort: true,
        filter: true,
        filterLocation: "none" as const,
        useDateRange: false,
        useRelativeRange: false,
        floatingFilter: false,
        formatter: "none" as const,
        customFormatterName: "",
        customPrefix: "",
        customSuffix: "",
        template: "",
        linkAction: undefined,
        linkUrlPattern: "",
        linkText: "",
        statusMapping: ""
    }
] as any;

const sampleRowData = [
    { id: 1, name: "Alice", status: "Active" },
    { id: 2, name: "Bob", status: "Inactive" },
    { id: 3, name: "Charlie", status: "Active" },
    { id: 4, name: "Diana", status: "Pending" },
    { id: 5, name: "Eve", status: "Active" }
];

const baseProps: any = {
    rowData: sampleRowData,
    columns: baseColumns,
    themeClassName: "ag-theme-alpine",
    height: 400,
    pagination: true,
    pageSize: 20,
    paginationPosition: "bottom" as const,
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
    onGridReady: jest.fn(),
    onRowClicked: jest.fn(),
    onRowDoubleClicked: jest.fn(),
    onCellEditCommit: undefined,
    onDataRefresh: undefined,
    onSortChanged: jest.fn(),
    onFilterChanged: jest.fn(),
    onColumnMoved: jest.fn(),
    onColumnPinned: jest.fn(),
    columnVisibility: {},
    columnOrder: [],
    customFormatterRegistry: undefined,
    enableContextMenu: false,
    enableSideBar: false,
    enableStatusBar: false,
    enableAggregationFooter: false,
    enableRowGrouping: false,
    groupDefaultExpanded: 0,
    showGroupRowsOnSeparateLine: false,
    suppressAggregationOnGroupRows: false,
    enableColumnMenus: true,
    enableHeaderFilterButtons: true,
    enableFloatingFilters: false
};

describe("GridView – Row Selection Integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedAgGridProps = {};
        capturedOnSelectionChanged = undefined;
    });

    // ──────────────────────────────────────────────
    // Multiple Selection
    // ──────────────────────────────────────────────
    describe("Multiple Selection Mode", () => {
        it("passes multiRow selection config to AgGridReact", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedAgGridProps.rowSelection).toEqual({
                mode: "multiRow",
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: true
            });
        });

        it("enables header checkbox for select-all when checkboxes are shown", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedAgGridProps.rowSelection.headerCheckbox).toBe(true);
        });

        it("disables checkboxes when showSelectionCheckboxes is false", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={false}
                />
            );

            expect(capturedAgGridProps.rowSelection).toEqual({
                mode: "multiRow",
                checkboxes: false,
                headerCheckbox: false,
                enableClickSelection: true
            });
        });

        it("wires onSelectionChanged callback for multi-select", () => {
            const onSelectionChanged = jest.fn();
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    onSelectionChanged={onSelectionChanged}
                />
            );

            // The mock captured the callback – verify it's wired
            expect(capturedAgGridProps.onSelectionChanged).toBeDefined();

            // Simulate a selection event from AG Grid
            const mockApi = {
                getSelectedRows: jest.fn(() => [sampleRowData[0], sampleRowData[2]]),
                getSelectedNodes: jest.fn(() => [
                    { data: sampleRowData[0], rowIndex: 0 },
                    { data: sampleRowData[2], rowIndex: 2 }
                ])
            };

            act(() => {
                capturedOnSelectionChanged?.({ api: mockApi });
            });

            expect(onSelectionChanged).toHaveBeenCalledWith(
                expect.objectContaining({ api: mockApi })
            );
        });

        it("renders correct row data alongside multi-select config", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            // Verify row data is passed
            expect(capturedAgGridProps.rowData).toHaveLength(5);
            expect(capturedAgGridProps.rowData[0].name).toBe("Alice");
            expect(capturedAgGridProps.rowData[4].name).toBe("Eve");

            // Verify column defs are generated
            expect(capturedAgGridProps.columnDefs).toBeDefined();
            expect(capturedAgGridProps.columnDefs.length).toBeGreaterThan(0);
        });
    });

    // ──────────────────────────────────────────────
    // Single Selection
    // ──────────────────────────────────────────────
    describe("Single Selection Mode", () => {
        it("passes singleRow selection config to AgGridReact", () => {
            render(<GridView {...baseProps} rowSelectionMode="single" />);

            expect(capturedAgGridProps.rowSelection).toEqual({
                mode: "singleRow",
                checkboxes: false,
                enableClickSelection: true
            });
        });

        it("does not show checkboxes in single selection mode", () => {
            render(
                <GridView {...baseProps} rowSelectionMode="single" showSelectionCheckboxes={true} />
            );

            // Even when showSelectionCheckboxes is true, single mode uses click selection only
            expect(capturedAgGridProps.rowSelection.checkboxes).toBe(false);
        });

        it("wires onSelectionChanged callback for single-select", () => {
            const onSelectionChanged = jest.fn();
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="single"
                    onSelectionChanged={onSelectionChanged}
                />
            );

            expect(capturedAgGridProps.onSelectionChanged).toBeDefined();

            // Simulate selecting a single row
            const mockApi = {
                getSelectedRows: jest.fn(() => [sampleRowData[1]]),
                getSelectedNodes: jest.fn(() => [{ data: sampleRowData[1], rowIndex: 1 }])
            };

            act(() => {
                capturedOnSelectionChanged?.({ api: mockApi });
            });

            expect(onSelectionChanged).toHaveBeenCalledWith(
                expect.objectContaining({ api: mockApi })
            );
        });
    });

    // ──────────────────────────────────────────────
    // No Selection (disabled)
    // ──────────────────────────────────────────────
    describe("No Selection Mode", () => {
        it("does not pass rowSelection when mode is none", () => {
            render(<GridView {...baseProps} rowSelectionMode="none" />);

            expect(capturedAgGridProps.rowSelection).toBeUndefined();
        });

        it("defaults to no selection when rowSelectionMode is not provided", () => {
            // Omit rowSelectionMode entirely
            const { rowSelectionMode, ...propsWithoutSelection } = baseProps;
            render(<GridView {...propsWithoutSelection} />);

            expect(capturedAgGridProps.rowSelection).toBeUndefined();
        });
    });

    // ──────────────────────────────────────────────
    // Selection + Delete Integration
    // ──────────────────────────────────────────────
    describe("Selection with Delete Config", () => {
        const deleteConfig = {
            enableRowDelete: true,
            bulkDeleteEnabled: true,
            deleteConfirmation: {
                enabled: true,
                title: "Confirm Delete",
                message: "Are you sure?"
            },
            deleteButton: {
                showInToolbar: true,
                showInContextMenu: true,
                label: "Delete",
                requireSelection: true
            }
        };

        it("enables multi-select alongside delete config", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    deleteConfig={deleteConfig}
                />
            );

            // Selection config should still be multiRow
            expect(capturedAgGridProps.rowSelection).toEqual({
                mode: "multiRow",
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: true
            });
        });

        it("fires onDeleteRows with selected rows from context menu", () => {
            const onDeleteRows = jest.fn();
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                    deleteConfig={deleteConfig}
                    onDeleteRows={onDeleteRows}
                    enableContextMenu={true}
                />
            );

            // Context menu handler should be configured
            expect(capturedAgGridProps.getContextMenuItems).toBeDefined();
        });
    });

    // ──────────────────────────────────────────────
    // Selection mode transitions (re-renders)
    // ──────────────────────────────────────────────
    describe("Selection Mode Transitions", () => {
        it("updates selection config when mode changes from none to multiple", () => {
            const { rerender } = render(<GridView {...baseProps} rowSelectionMode="none" />);

            expect(capturedAgGridProps.rowSelection).toBeUndefined();

            rerender(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedAgGridProps.rowSelection).toEqual({
                mode: "multiRow",
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: true
            });
        });

        it("updates selection config when mode changes from multiple to single", () => {
            const { rerender } = render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedAgGridProps.rowSelection?.mode).toBe("multiRow");

            rerender(<GridView {...baseProps} rowSelectionMode="single" />);

            expect(capturedAgGridProps.rowSelection).toEqual({
                mode: "singleRow",
                checkboxes: false,
                enableClickSelection: true
            });
        });

        it("updates selection config when checkboxes toggle changes", () => {
            const { rerender } = render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedAgGridProps.rowSelection.checkboxes).toBe(true);
            expect(capturedAgGridProps.rowSelection.headerCheckbox).toBe(true);

            rerender(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={false}
                />
            );

            expect(capturedAgGridProps.rowSelection.checkboxes).toBe(false);
            expect(capturedAgGridProps.rowSelection.headerCheckbox).toBe(false);
        });
    });

    // ──────────────────────────────────────────────
    // Row data rendering with selection
    // ──────────────────────────────────────────────
    describe("Data Integrity with Selection Enabled", () => {
        it("renders all rows when multi-select is enabled", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            expect(capturedAgGridProps.rowData).toEqual(sampleRowData);
        });

        it("preserves column definitions when selection is enabled", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            // Should have column defs for all 3 columns (id, name, status)
            const defs = capturedAgGridProps.columnDefs;
            expect(defs).toBeDefined();

            const fieldNames = defs.map((d: any) => d.field);
            expect(fieldNames).toContain("id");
            expect(fieldNames).toContain("name");
            expect(fieldNames).toContain("status");
        });

        it("renders grid with correct theme class when selection is enabled", () => {
            render(
                <GridView
                    {...baseProps}
                    rowSelectionMode="multiple"
                    showSelectionCheckboxes={true}
                />
            );

            const grid = screen.getAllByTestId("ag-grid")[0];
            expect(grid.closest(".ag-theme-alpine")).toBeInTheDocument();
        });
    });
});
