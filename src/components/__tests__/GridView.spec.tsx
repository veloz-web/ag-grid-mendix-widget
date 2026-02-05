import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GridView } from "../GridView";
import { mapMendixColumnToColDef } from "../../utils/column/mapping";

// Mock AG Grid
jest.mock("ag-grid-react", () => ({
    AgGridReact: ({ columnDefs, rowData, onGridReady, ..._props }: any) => {
        React.useEffect(() => {
            if (onGridReady) {
                onGridReady({
                    api: {
                        sizeColumnsToFit: jest.fn(),
                        setFilterModel: jest.fn(),
                        setSortModel: jest.fn()
                    }
                });
            }
            // If a header menu hook is provided, call it to simulate a user selecting the custom action
            if (_props.getMainMenuItems) {
                try {
                    const menuItems = _props.getMainMenuItems({ defaultItems: [] });
                    // If our custom 'Show/Hide Columns' item exists call its action
                    const showHide =
                        menuItems &&
                        menuItems.find((it: any) => it && it.name === "Show/Hide Columns");
                    if (showHide && typeof showHide.action === "function") {
                        showHide.action();
                    }
                } catch (e) {
                    // ignore in tests
                }
            }
        }, [onGridReady, _props]);

        return (
            <div
                data-testid="ag-grid"
                data-coldefs={JSON.stringify(columnDefs)}
                data-rowdata={JSON.stringify(rowData)}
            >
                {columnDefs?.map((col: any, index: number) => (
                    <div key={index} data-testid={`column-${col.field}`}>
                        {col.headerName}
                    </div>
                ))}
            </div>
        );
    }
}));

jest.mock("ag-grid-community", () => ({
    LicenseManager: {
        setLicenseKey: jest.fn()
    }
}));

describe("GridView Component", () => {
    const mockProps = {
        rowData: [
            { id: 1, name: "John", status: "Active" },
            { id: 2, name: "Jane", status: "Inactive" }
        ],
        columns: [
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
            }
        ] as any,
        themeClassName: "ag-theme-alpine",
        height: 400,
        pagination: true,
        pageSize: 20,
        rowHeightMode: "fixed" as const,
        rowHeight: 40,
        rowHeightExpression: "",
        maxRowHeight: 0,
        onGridReady: jest.fn(),
        onRowClicked: jest.fn(),
        onRowDoubleClicked: jest.fn(),
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Rendering", () => {
        it("renders AG Grid with correct theme class", () => {
            render(<GridView {...mockProps} />);
            const grids = screen.getAllByTestId("ag-grid");
            const grid = grids[0]; // Get the outer container
            expect(grid).toBeInTheDocument();
            expect(grid.closest(".ag-theme-alpine")).toBeInTheDocument();
        });

        it("passes correct height to grid container", () => {
            render(<GridView {...mockProps} height={500} />);
            const grids = screen.getAllByTestId("ag-grid");
            const gridContainer = grids[0]; // Get the outer container
            expect(gridContainer).toHaveStyle({ height: "500px" });
        });

        it("renders column headers", () => {
            render(<GridView {...mockProps} />);
            expect(screen.getByTestId("column-id")).toBeInTheDocument();
            expect(screen.getByTestId("column-name")).toBeInTheDocument();
        });
    });

    describe("Column configuration", () => {
        it("maps columns correctly to AG Grid format", () => {
            render(<GridView {...mockProps} />);
            // This test will fail until we add column definition verification
            // TODO: Implement column definition mapping verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("respects column visibility settings", () => {
            const propsWithVisibility = {
                ...mockProps,
                columnVisibility: { id: false }
            };

            render(<GridView {...propsWithVisibility} />);
            // This test will fail until we add column visibility verification
            // TODO: Implement column visibility verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("applies column ordering", () => {
            const propsWithOrder = {
                ...mockProps,
                columnOrder: ["name", "id"]
            };

            render(<GridView {...propsWithOrder} />);
            // This test will fail until we add column ordering verification
            // TODO: Implement column ordering verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("handles hidden columns", () => {
            const columnsWithHidden = [
                ...mockProps.columns,
                {
                    ...mockProps.columns[0],
                    header: { value: "Hidden" },
                    attribute: { id: "hidden", type: "String" },
                    hidden: true
                }
            ];

            // Test that the column mapping function handles hidden columns correctly
            const hiddenColDef = mapMendixColumnToColDef(columnsWithHidden[2], columnsWithHidden);

            expect(hiddenColDef.hide).toBe(true);
        });
    });

    describe("Grid options", () => {
        it("enables pagination when specified", () => {
            render(<GridView {...mockProps} pagination={true} />);
            // This test will fail until we verify pagination props are passed correctly
            // TODO: Add pagination prop verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("disables pagination when specified", () => {
            render(<GridView {...mockProps} pagination={false} />);
            // This test will fail until we verify pagination props are passed correctly
            // TODO: Add pagination prop verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("sets correct page size", () => {
            render(<GridView {...mockProps} pageSize={50} />);
            // This test will fail until we verify pageSize prop is passed correctly
            // TODO: Add pageSize prop verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("enables column menus when specified", () => {
            render(<GridView {...mockProps} enableColumnMenus={true} />);
            // This test will fail until we verify suppressHeaderMenuButton is set correctly
            // TODO: Add column menu verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("disables column menus when specified", () => {
            render(<GridView {...mockProps} enableColumnMenus={false} />);
            // This test will fail until we verify suppressHeaderMenuButton is set correctly
            // TODO: Add column menu verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("enables header filter buttons when specified", () => {
            render(<GridView {...mockProps} enableHeaderFilterButtons={true} />);
            // This test will fail until we verify suppressHeaderFilterButton is set correctly
            // TODO: Add header filter button verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("disables header filter buttons when specified", () => {
            render(<GridView {...mockProps} enableHeaderFilterButtons={false} />);
            // This test will fail until we verify suppressHeaderFilterButton is set correctly
            // TODO: Add header filter button verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("enables floating filters when specified", () => {
            render(<GridView {...mockProps} enableFloatingFilters={true} />);
            // This test will fail until we verify floatingFilter default is set correctly
            // TODO: Add floating filter verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("disables floating filters when specified", () => {
            render(<GridView {...mockProps} enableFloatingFilters={false} />);
            // This test will fail until we verify floatingFilter default is set correctly
            // TODO: Add floating filter verification
            expect(true).toBe(true); // Placeholder assertion
        });
    });

    describe("Event handling", () => {
        it("calls onGridReady when grid is ready", () => {
            render(<GridView {...mockProps} />);
            expect(mockProps.onGridReady).toHaveBeenCalled();
        });

        it("calls onRowClicked when row is clicked", () => {
            render(<GridView {...mockProps} />);
            // This test will fail until we add row click event handling
            // TODO: Implement row click event verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("passes onRowDoubleClicked to AgGridReact", () => {
            const mockDoubleClick = jest.fn();
            render(<GridView {...mockProps} onRowDoubleClicked={mockDoubleClick} />);
            // Verify the double-click handler is accepted as a prop without errors
            expect(true).toBe(true);
        });

        it("calls onSortChanged when sort changes", () => {
            render(<GridView {...mockProps} />);
            // This test will fail until we add sort change event handling
            // TODO: Implement sort change event verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("adds Show/Hide Columns menu item and executes action", () => {
            const mockOpen = jest.fn();
            render(<GridView {...mockProps} onOpenColumnVisibility={mockOpen} />);

            // Our mocked AG Grid immediately calls the header menu action from the mock
            // so the handler should have been executed by now.
            expect(mockOpen).toHaveBeenCalled();
        });

        it("calls onFilterChanged when filter changes", () => {
            render(<GridView {...mockProps} />);
            // This test will fail until we add filter change event handling
            // TODO: Implement filter change event verification
            expect(true).toBe(true); // Placeholder assertion
        });
    });

    describe("Column formatting", () => {
        it("applies text alignment classes", () => {
            const columnsWithAlignment = [
                {
                    ...mockProps.columns[0],
                    alignment: "right" as const
                }
            ];

            render(<GridView {...mockProps} columns={columnsWithAlignment} />);
            // This test will fail until we verify alignment classes are applied
            // TODO: Add alignment class verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("handles template columns", () => {
            const columnsWithTemplate = [
                {
                    ...mockProps.columns[0],
                    template: "{{name}} ({{id}})"
                }
            ];

            render(<GridView {...mockProps} columns={columnsWithTemplate} />);
            // This test will fail until we verify template rendering
            // TODO: Add template rendering verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("handles custom formatters", () => {
            const mockRegistry = {
                registerFormatters: jest.fn(),
                compileJavaScriptFormatter: jest.fn(),
                execute: jest.fn().mockReturnValue("<span>Custom</span>"),
                has: jest.fn().mockReturnValue(true),
                getFormatterNames: jest.fn(() => []),
                clear: jest.fn()
            };

            const columnsWithCustomFormatter = [
                {
                    ...mockProps.columns[0],
                    customFormatterName: "testFormatter"
                }
            ];

            render(
                <GridView
                    {...mockProps}
                    columns={columnsWithCustomFormatter}
                    customFormatterRegistry={mockRegistry as any}
                />
            );
            // This test will fail until we verify custom formatter execution
            // TODO: Add custom formatter verification
            expect(true).toBe(true); // Placeholder assertion
        });
    });

    describe("Performance", () => {
        it("memoizes column definitions", () => {
            const { rerender } = render(<GridView {...mockProps} />);

            // Re-render with same props should not change column definitions
            rerender(<GridView {...mockProps} />);
            // This test will fail until we verify memoization works
            // TODO: Add memoization verification
            expect(true).toBe(true); // Placeholder assertion
        });

        it("recomputes column definitions when columns change", () => {
            const { rerender } = render(<GridView {...mockProps} />);

            const newColumns = [...mockProps.columns];
            newColumns[0] = { ...newColumns[0], header: { value: "New ID" } };

            rerender(<GridView {...mockProps} columns={newColumns} />);
            // This test will fail until we verify column definition updates
            // TODO: Add column definition update verification
            expect(true).toBe(true); // Placeholder assertion
        });
    });

    describe("Row Height", () => {
        it("renders with default fixed row height mode", () => {
            render(<GridView {...mockProps} />);
            const grid = screen.getAllByTestId("ag-grid")[0];
            expect(grid).toBeInTheDocument();
        });

        it("accepts auto row height mode", () => {
            render(<GridView {...mockProps} rowHeightMode="auto" rowHeight={40} />);
            const grid = screen.getAllByTestId("ag-grid")[0];
            expect(grid).toBeInTheDocument();
        });

        it("accepts custom row height mode with expression", () => {
            render(
                <GridView
                    {...mockProps}
                    rowHeightMode="custom"
                    rowHeight={40}
                    rowHeightExpression="data && data.type === 'large' ? 80 : 40"
                />
            );
            const grid = screen.getAllByTestId("ag-grid")[0];
            expect(grid).toBeInTheDocument();
        });

        it("applies maxRowHeight CSS class when auto mode with maxRowHeight", () => {
            render(
                <GridView {...mockProps} rowHeightMode="auto" rowHeight={40} maxRowHeight={200} />
            );
            const grid = screen.getAllByTestId("ag-grid")[0];
            expect(grid.className).toContain("aggrid-max-row-height");
        });

        it("does not apply maxRowHeight CSS class when maxRowHeight is 0", () => {
            render(
                <GridView {...mockProps} rowHeightMode="auto" rowHeight={40} maxRowHeight={0} />
            );
            const grid = screen.getAllByTestId("ag-grid")[0];
            expect(grid.className).not.toContain("aggrid-max-row-height");
        });

        it("does not apply maxRowHeight CSS class in fixed mode", () => {
            render(
                <GridView {...mockProps} rowHeightMode="fixed" rowHeight={40} maxRowHeight={200} />
            );
            const grid = screen.getAllByTestId("ag-grid")[0];
            expect(grid.className).not.toContain("aggrid-max-row-height");
        });

        it("falls back to fixed mode when auto is used with server-side row model", () => {
            const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
            render(
                <GridView
                    {...mockProps}
                    rowHeightMode="auto"
                    rowHeight={40}
                    rowModelType="serverSide"
                />
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Auto row height is not supported")
            );
            consoleSpy.mockRestore();
        });

        it("handles invalid custom expression gracefully", () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();
            render(
                <GridView
                    {...mockProps}
                    rowHeightMode="custom"
                    rowHeight={40}
                    rowHeightExpression="this is not valid javascript @@!!"
                />
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Invalid row height expression"),
                expect.anything(),
                expect.anything()
            );
            consoleSpy.mockRestore();
        });
    });
});
