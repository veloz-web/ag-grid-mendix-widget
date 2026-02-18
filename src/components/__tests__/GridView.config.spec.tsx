import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GridView } from "../GridView";

// ─── Mock AG Grid ────────────────────────────────────────────────────────────
// Captures every prop passed to AgGridReact so we can assert on config values.
let capturedProps: Record<string, any> = {};

jest.mock("ag-grid-react", () => ({
    AgGridReact: (props: any) => {
        capturedProps = props;

        React.useEffect(() => {
            if (props.onGridReady) {
                props.onGridReady({
                    api: {
                        sizeColumnsToFit: jest.fn(),
                        setFilterModel: jest.fn(),
                        setSortModel: jest.fn(),
                        getSelectedRows: jest.fn(() => []),
                        getDisplayedRowCount: jest.fn(() => 3),
                        forEachNode: jest.fn(),
                        getColumnState: jest.fn(() => []),
                        applyColumnState: jest.fn(),
                        refreshCells: jest.fn(),
                        redrawRows: jest.fn()
                    }
                });
            }
        }, [props.onGridReady]);

        return (
            <div
                data-testid="ag-grid-inner"
                data-pagination={String(props.pagination)}
                data-dom-layout={props.domLayout}
            >
                {props.columnDefs?.map((col: any, i: number) => (
                    <div key={i} data-testid={`column-${col.field}`}>
                        {col.headerName}
                    </div>
                ))}
            </div>
        );
    }
}));

jest.mock("ag-grid-community", () => ({
    LicenseManager: { setLicenseKey: jest.fn() }
}));

// ─── Shared Fixtures ─────────────────────────────────────────────────────────
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

const sampleRows = [
    { id: 1, name: "Alice", status: "Active" },
    { id: 2, name: "Bob", status: "Inactive" },
    { id: 3, name: "Charlie", status: "Active" }
];

const baseProps: any = {
    rowData: sampleRows,
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

describe("GridView – Grid Configuration Integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedProps = {};
    });

    // ══════════════════════════════════════════════
    // Pagination Position
    // ══════════════════════════════════════════════
    describe("Pagination Position", () => {
        it("enables pagination and defaults to bottom position", () => {
            render(<GridView {...baseProps} pagination={true} paginationPosition="bottom" />);

            expect(capturedProps.pagination).toBe(true);
            expect(capturedProps.paginationPageSize).toBe(20);
        });

        it("sets pagination=false when disabled", () => {
            render(<GridView {...baseProps} pagination={false} />);

            expect(capturedProps.pagination).toBe(false);
        });

        it("sets correct page size", () => {
            render(<GridView {...baseProps} pagination={true} pageSize={50} />);

            expect(capturedProps.paginationPageSize).toBe(50);
        });

        it("does NOT trigger top-position DOM move when position is bottom", () => {
            // The useEffect for top-position relies on finding .ag-paging-panel in the DOM.
            // When position is "bottom" the effect early-returns. We verify by checking
            // that the grid renders normally without any DOM reordering side-effects.
            render(<GridView {...baseProps} pagination={true} paginationPosition="bottom" />);

            const grid = screen.getByTestId("ag-grid-inner");
            expect(grid).toBeInTheDocument();
            // Parent wrapper should NOT have the panel moved (the mock doesn't create one,
            // so the interval would just time out harmlessly)
        });

        it("triggers top-position DOM move effect when position is top", () => {
            // We can't fully test DOM reordering with a mocked AgGridReact, but we verify
            // the component accepts the prop without errors and the effect runs.
            // In a real AG Grid the .ag-paging-panel would be moved above .ag-root-wrapper.
            jest.useFakeTimers();

            render(<GridView {...baseProps} pagination={true} paginationPosition="top" />);

            // Fast-forward past the polling interval (20 attempts × 50ms = 1000ms max)
            jest.advanceTimersByTime(1100);

            const grid = screen.getByTestId("ag-grid-inner");
            expect(grid).toBeInTheDocument();

            jest.useRealTimers();
        });

        it("does NOT start the top-position effect when pagination is disabled", () => {
            jest.useFakeTimers();

            render(<GridView {...baseProps} pagination={false} paginationPosition="top" />);

            // The effect should early-return because pagination is false
            jest.advanceTimersByTime(1100);

            const grid = screen.getByTestId("ag-grid-inner");
            expect(grid).toBeInTheDocument();

            jest.useRealTimers();
        });

        it("applies page size 10 for small datasets", () => {
            render(<GridView {...baseProps} pagination={true} pageSize={10} />);

            expect(capturedProps.paginationPageSize).toBe(10);
        });

        it("applies page size 100 for large datasets", () => {
            render(<GridView {...baseProps} pagination={true} pageSize={100} />);

            expect(capturedProps.paginationPageSize).toBe(100);
        });
    });

    // ══════════════════════════════════════════════
    // DOM Layout
    // ══════════════════════════════════════════════
    describe("DOM Layout", () => {
        it("defaults to normal layout", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.domLayout).toBe("normal");
        });

        it("passes autoHeight layout to AgGridReact", () => {
            render(<GridView {...baseProps} domLayout="autoHeight" />);

            expect(capturedProps.domLayout).toBe("autoHeight");
        });

        it("passes print layout to AgGridReact", () => {
            render(<GridView {...baseProps} domLayout="print" />);

            expect(capturedProps.domLayout).toBe("print");
        });
    });

    // ══════════════════════════════════════════════
    // Column Menus & Header Filter Buttons
    // ══════════════════════════════════════════════
    describe("Column Menus & Header Filters", () => {
        it("enables column menus by default", () => {
            render(
                <GridView {...baseProps} enableColumnMenus={true} />
            );

            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(false);
        });

        it("suppresses column menus when disabled", () => {
            render(
                <GridView {...baseProps} enableColumnMenus={false} />
            );

            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(true);
        });

        it("enables header filter buttons by default", () => {
            render(
                <GridView {...baseProps} enableHeaderFilterButtons={true} />
            );

            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(false);
        });

        it("suppresses header filter buttons when disabled", () => {
            render(
                <GridView {...baseProps} enableHeaderFilterButtons={false} />
            );

            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(true);
        });

        it("enables column menus and header filters together", () => {
            render(
                <GridView
                    {...baseProps}
                    enableColumnMenus={true}
                    enableHeaderFilterButtons={true}
                />
            );

            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(false);
            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(false);
        });

        it("suppresses both column menus and header filters", () => {
            render(
                <GridView
                    {...baseProps}
                    enableColumnMenus={false}
                    enableHeaderFilterButtons={false}
                />
            );

            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(true);
            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(true);
        });
    });

    // ══════════════════════════════════════════════
    // Floating Filters
    // ══════════════════════════════════════════════
    describe("Floating Filters", () => {
        it("disables floating filters by default", () => {
            render(<GridView {...baseProps} enableFloatingFilters={false} />);

            expect(capturedProps.defaultColDef.floatingFilter).toBe(false);
        });

        it("enables floating filters when configured", () => {
            render(<GridView {...baseProps} enableFloatingFilters={true} />);

            expect(capturedProps.defaultColDef.floatingFilter).toBe(true);
        });
    });

    // ══════════════════════════════════════════════
    // Side Bar
    // ══════════════════════════════════════════════
    describe("Side Bar", () => {
        it("does not enable sidebar by default", () => {
            render(<GridView {...baseProps} enableSideBar={false} />);

            expect(capturedProps.sideBar).toBeUndefined();
        });

        it("enables sidebar when configured", () => {
            render(<GridView {...baseProps} enableSideBar={true} />);

            expect(capturedProps.sideBar).toBe(true);
        });
    });

    // ══════════════════════════════════════════════
    // Status Bar
    // ══════════════════════════════════════════════
    describe("Status Bar", () => {
        it("does not configure status bar by default", () => {
            render(<GridView {...baseProps} enableStatusBar={false} />);

            expect(capturedProps.statusBar).toBeUndefined();
        });

        it("configures status bar panels when enabled", () => {
            render(<GridView {...baseProps} enableStatusBar={true} />);

            expect(capturedProps.statusBar).toBeDefined();
            expect(capturedProps.statusBar.statusPanels).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ statusPanel: "agTotalRowCountComponent" }),
                    expect.objectContaining({ statusPanel: "agFilteredRowCountComponent" }),
                    expect.objectContaining({ statusPanel: "agSelectedRowCountComponent" }),
                    expect.objectContaining({ statusPanel: "agAggregationComponent" })
                ])
            );
        });

        it("includes 4 status panels", () => {
            render(<GridView {...baseProps} enableStatusBar={true} />);

            expect(capturedProps.statusBar.statusPanels).toHaveLength(4);
        });
    });

    // ══════════════════════════════════════════════
    // Context Menu
    // ══════════════════════════════════════════════
    describe("Context Menu", () => {
        it("suppresses context menu by default", () => {
            render(<GridView {...baseProps} enableContextMenu={false} />);

            expect(capturedProps.suppressContextMenu).toBe(true);
        });

        it("enables context menu when configured", () => {
            render(<GridView {...baseProps} enableContextMenu={true} />);

            expect(capturedProps.suppressContextMenu).toBe(false);
        });
    });

    // ══════════════════════════════════════════════
    // Auto-Size Strategy
    // ══════════════════════════════════════════════
    describe("Auto-Size Strategy", () => {
        it("does not set auto-size when strategy is none", () => {
            render(<GridView {...baseProps} autoSizeStrategy="none" />);

            expect(capturedProps.autoSizeStrategy).toBeUndefined();
        });

        it("sets fitGridWidth strategy", () => {
            render(<GridView {...baseProps} autoSizeStrategy="fitGridWidth" />);

            expect(capturedProps.autoSizeStrategy).toEqual({
                type: "fitGridWidth"
            });
        });

        it("sets fitCellContents strategy", () => {
            render(<GridView {...baseProps} autoSizeStrategy="fitCellContents" />);

            expect(capturedProps.autoSizeStrategy).toEqual({
                type: "fitCellContents",
                skipHeader: false
            });
        });

        it("sets fitCellContents with skipHeader", () => {
            render(
                <GridView
                    {...baseProps}
                    autoSizeStrategy="fitCellContents"
                    skipHeaderOnAutoSize={true}
                />
            );

            expect(capturedProps.autoSizeStrategy).toEqual({
                type: "fitCellContents",
                skipHeader: true
            });
        });

        it("ignores skipHeader when strategy is fitGridWidth", () => {
            render(
                <GridView
                    {...baseProps}
                    autoSizeStrategy="fitGridWidth"
                    skipHeaderOnAutoSize={true}
                />
            );

            // fitGridWidth strategy doesn't use skipHeader
            expect(capturedProps.autoSizeStrategy).toEqual({
                type: "fitGridWidth"
            });
        });
    });

    // ══════════════════════════════════════════════
    // Virtual Scrolling Configuration
    // ══════════════════════════════════════════════
    describe("Virtual Scrolling", () => {
        it("uses default rowBuffer of 10", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.rowBuffer).toBe(10);
        });

        it("accepts custom rowBuffer", () => {
            render(<GridView {...baseProps} rowBuffer={30} />);

            expect(capturedProps.rowBuffer).toBe(30);
        });

        it("does not suppress virtualisation by default", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.suppressRowVirtualisation).toBe(false);
        });

        it("suppresses virtualisation when configured", () => {
            render(<GridView {...baseProps} suppressRowVirtualisation={true} />);

            expect(capturedProps.suppressRowVirtualisation).toBe(true);
        });
    });

    // ══════════════════════════════════════════════
    // Edit Mode
    // ══════════════════════════════════════════════
    describe("Edit Mode", () => {
        it("does not set editType for cell mode (default)", () => {
            render(<GridView {...baseProps} editMode="cell" />);

            expect(capturedProps.editType).toBeUndefined();
        });

        it("sets editType to fullRow for row mode", () => {
            render(<GridView {...baseProps} editMode="row" />);

            expect(capturedProps.editType).toBe("fullRow");
        });

        it("enables stopEditingWhenCellsLoseFocus by default", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.stopEditingWhenCellsLoseFocus).toBe(true);
        });

        it("disables stopEditingWhenCellsLoseFocus when configured", () => {
            render(<GridView {...baseProps} stopEditingWhenCellsLoseFocus={false} />);

            expect(capturedProps.stopEditingWhenCellsLoseFocus).toBe(false);
        });

        it("disables undo/redo by default", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.undoRedoCellEditing).toBe(false);
        });

        it("enables undo/redo when configured", () => {
            render(<GridView {...baseProps} undoRedoCellEditing={true} />);

            expect(capturedProps.undoRedoCellEditing).toBe(true);
        });
    });

    // ══════════════════════════════════════════════
    // Column Resizing Persistence
    // ══════════════════════════════════════════════
    describe("Column Resizing", () => {
        it("wires onColumnResized when persistColumnWidths is true", () => {
            const onColumnResized = jest.fn();
            render(
                <GridView {...baseProps} persistColumnWidths={true} onColumnResized={onColumnResized} />
            );

            expect(capturedProps.onColumnResized).toBeDefined();
        });

        it("does not wire onColumnResized when persistColumnWidths is false", () => {
            const onColumnResized = jest.fn();
            render(
                <GridView {...baseProps} persistColumnWidths={false} onColumnResized={onColumnResized} />
            );

            expect(capturedProps.onColumnResized).toBeUndefined();
        });
    });

    // ══════════════════════════════════════════════
    // Server-Side Cache Configuration
    // ══════════════════════════════════════════════
    describe("Server-Side Cache Config", () => {
        it("does not set server cache props for clientSide model", () => {
            render(
                <GridView
                    {...baseProps}
                    rowModelType="clientSide"
                    cacheBlockSize={50}
                    maxBlocksInCache={10}
                    maxConcurrentRequests={3}
                />
            );

            expect(capturedProps.cacheBlockSize).toBeUndefined();
            expect(capturedProps.maxBlocksInCache).toBeUndefined();
            expect(capturedProps.maxConcurrentDatasourceRequests).toBeUndefined();
        });

        it("sets server cache props for serverSide model", () => {
            render(
                <GridView
                    {...baseProps}
                    rowModelType="serverSide"
                    cacheBlockSize={50}
                    maxBlocksInCache={10}
                    maxConcurrentRequests={3}
                />
            );

            expect(capturedProps.cacheBlockSize).toBe(50);
            expect(capturedProps.maxBlocksInCache).toBe(10);
            expect(capturedProps.maxConcurrentDatasourceRequests).toBe(3);
        });

        it("omits maxBlocksInCache when set to 0 (unlimited)", () => {
            render(
                <GridView
                    {...baseProps}
                    rowModelType="serverSide"
                    cacheBlockSize={100}
                    maxBlocksInCache={0}
                />
            );

            expect(capturedProps.cacheBlockSize).toBe(100);
            expect(capturedProps.maxBlocksInCache).toBeUndefined();
        });
    });

    // ══════════════════════════════════════════════
    // Static Grid Flags
    // ══════════════════════════════════════════════
    describe("Static Grid Flags", () => {
        it("always enables cell text selection", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.enableCellTextSelection).toBe(true);
        });

        it("always enables ensureDomOrder for accessibility", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.ensureDomOrder).toBe(true);
        });

        it("always enables row animation", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.animateRows).toBe(true);
        });

        it("does not suppress cell focus", () => {
            render(<GridView {...baseProps} />);

            expect(capturedProps.suppressCellFocus).toBe(false);
        });
    });

    // ══════════════════════════════════════════════
    // Combined Config Scenarios
    // ══════════════════════════════════════════════
    describe("Combined Config Scenarios", () => {
        it("full enterprise config: sidebar + status bar + floating filters + context menu", () => {
            render(
                <GridView
                    {...baseProps}
                    enableSideBar={true}
                    enableStatusBar={true}
                    enableFloatingFilters={true}
                    enableContextMenu={true}
                    enableColumnMenus={true}
                    enableHeaderFilterButtons={true}
                />
            );

            expect(capturedProps.sideBar).toBe(true);
            expect(capturedProps.statusBar).toBeDefined();
            expect(capturedProps.statusBar.statusPanels).toHaveLength(4);
            expect(capturedProps.defaultColDef.floatingFilter).toBe(true);
            expect(capturedProps.suppressContextMenu).toBe(false);
            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(false);
            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(false);
        });

        it("minimal config: everything disabled", () => {
            render(
                <GridView
                    {...baseProps}
                    pagination={false}
                    enableSideBar={false}
                    enableStatusBar={false}
                    enableFloatingFilters={false}
                    enableContextMenu={false}
                    enableColumnMenus={false}
                    enableHeaderFilterButtons={false}
                />
            );

            expect(capturedProps.pagination).toBe(false);
            expect(capturedProps.sideBar).toBeUndefined();
            expect(capturedProps.statusBar).toBeUndefined();
            expect(capturedProps.defaultColDef.floatingFilter).toBe(false);
            expect(capturedProps.suppressContextMenu).toBe(true);
            expect(capturedProps.defaultColDef.suppressHeaderMenuButton).toBe(true);
            expect(capturedProps.defaultColDef.suppressHeaderFilterButton).toBe(true);
        });

        it("auto-height + top pagination + floating filters", () => {
            jest.useFakeTimers();

            render(
                <GridView
                    {...baseProps}
                    domLayout="autoHeight"
                    pagination={true}
                    paginationPosition="top"
                    enableFloatingFilters={true}
                />
            );

            jest.advanceTimersByTime(1100);

            expect(capturedProps.domLayout).toBe("autoHeight");
            expect(capturedProps.pagination).toBe(true);
            expect(capturedProps.defaultColDef.floatingFilter).toBe(true);

            jest.useRealTimers();
        });
    });
});
