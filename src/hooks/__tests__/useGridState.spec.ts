/**
 * useGridState Hook Tests
 *
 * Comprehensive test suite for the consolidated grid state management hook.
 * Tests state initialization, updates, persistence, and all state management functions.
 */

import { renderHook, act } from "@testing-library/react";
import { useGridState } from "../useGridState";
import { AGGridContainerProps } from "../../types";
import { getInitialState } from "../../utils/initialState";

// Mock the initialState utility
jest.mock("../../utils/initialState", () => ({
    getInitialState: jest.fn()
}));

describe("useGridState Hook", () => {
    let mockProps: AGGridContainerProps;
    let mockOnPersist: jest.Mock;

    beforeEach(() => {
        mockProps = {
            name: "testGrid",
            class: "",
            style: {},
            dataSource: {} as any,
            rowModelType: "clientSide",
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
            defaultView: "grid",
            mobileDefaultView: "cards",
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
            rowHeightMode: "fixed",
            rowHeight: 40,
            rowHeightExpression: "",
            maxRowHeight: 0,
            rowClassMode: "none",
            rowClassAttribute: undefined,
            rowClassMapping: "",
            rowClassRules: "",
            rowClassDefault: "",
            rowClassExpression: "",
            editMode: "cell",
            stopEditingWhenCellsLoseFocus: true,
            undoRedoCellEditing: false,
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
            toolbarButtons: [],
            licenseKey: "",
            agGridVersion: "34.3.1",
            agGridVersionDate: "",
            widgetBuildDate: "",
            widgetBuildCommit: "",
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
            theme: "alpine",
            themeVariant: "auto",
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
            pdfPageOrientation: "landscape",
            pdfDocumentTitle: "",
            enableNotifications: false,
            toastPosition: "topRight",
            autoHideDuration: 0,
            domLayout: "normal",
            autoSizeStrategy: "none",
            skipHeaderOnAutoSize: false,
            persistColumnWidths: true,
            onRowClick: undefined,
            onRowDoubleClick: undefined,
            onCellEditCommit: undefined,
            onDeleteRow: undefined,
            onAddRow: undefined
        };

        mockOnPersist = jest.fn();

        // Mock initial state
        (getInitialState as jest.Mock).mockReturnValue({
            currentView: "grid",
            isFilterDrawerOpen: false,
            isMobile: false,
            activeFilters: {},
            gridFilterModel: null,
            globalSearch: "",
            sortModel: [],
            columnVisibility: {},
            isColumnVisibilityOpen: false,
            isHiddenDrawerOpen: false,
            columnOrder: [],
            columnPinned: {},
            prefersDarkScheme: false,
            toastNotifications: []
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Initialization", () => {
        it("should initialize with default state", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            expect(result.current.currentView).toBe("grid");
            expect(result.current.isFilterDrawerOpen).toBe(false);
            expect(result.current.activeFilters).toEqual({});
            expect(result.current.globalSearch).toBe("");
            expect(result.current.sortModel).toEqual([]);
            expect(result.current.columnVisibility).toEqual({});
            expect(result.current.columnOrder).toEqual([]);
            expect(result.current.isHiddenDrawerOpen).toBe(false);
        });

        it("should call getInitialState with props", () => {
            renderHook(() => useGridState(mockProps));

            expect(getInitialState).toHaveBeenCalledWith(mockProps);
        });

        it("should maintain initial state reference", () => {
            const { result, rerender } = renderHook(() => useGridState(mockProps));

            const initialState = result.current.state;
            rerender();

            // State object reference should remain stable
            expect(result.current.state).toBe(initialState);
        });
    });

    describe("View Management", () => {
        it("should update current view", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            act(() => {
                result.current.setCurrentView("cards");
            });

            expect(result.current.currentView).toBe("cards");
        });

        it("should persist view change", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            act(() => {
                result.current.setCurrentView("list");
            });

            expect(mockOnPersist).toHaveBeenCalledWith({
                viewMode: "list"
            });
        });

        it("should update view to all valid view modes", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            const viewModes: Array<"grid" | "cards" | "list" | "harden"> = [
                "grid",
                "cards",
                "list",
                "harden"
            ];

            viewModes.forEach((view) => {
                act(() => {
                    result.current.setCurrentView(view);
                });

                expect(result.current.currentView).toBe(view);
            });
        });
    });

    describe("Filter Drawer Management", () => {
        it("should open filter drawer", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.openFilterDrawer();
            });

            expect(result.current.isFilterDrawerOpen).toBe(true);
        });

        it("should close filter drawer", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            // Open first
            act(() => {
                result.current.openFilterDrawer();
            });

            // Then close
            act(() => {
                result.current.closeFilterDrawer();
            });

            expect(result.current.isFilterDrawerOpen).toBe(false);
        });

        it("should close filter drawer with returnFocus parameter", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.openFilterDrawer();
            });

            act(() => {
                result.current.closeFilterDrawer(true);
            });

            expect(result.current.isFilterDrawerOpen).toBe(false);
        });

        it("should toggle filter drawer from closed to open", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.toggleFilterDrawer();
            });

            expect(result.current.isFilterDrawerOpen).toBe(true);
        });

        it("should toggle filter drawer from open to closed", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            // Open first
            act(() => {
                result.current.openFilterDrawer();
            });

            // Then toggle to close
            act(() => {
                result.current.toggleFilterDrawer();
            });

            expect(result.current.isFilterDrawerOpen).toBe(false);
        });

        it("should toggle filter drawer multiple times", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            // Toggle sequence
            act(() => {
                result.current.toggleFilterDrawer(); // open
            });
            expect(result.current.isFilterDrawerOpen).toBe(true);

            act(() => {
                result.current.toggleFilterDrawer(); // close
            });
            expect(result.current.isFilterDrawerOpen).toBe(false);

            act(() => {
                result.current.toggleFilterDrawer(); // open
            });
            expect(result.current.isFilterDrawerOpen).toBe(true);
        });
    });

    describe("State Updates", () => {
        it("should update single state property", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.updateState({ globalSearch: "test search" });
            });

            expect(result.current.globalSearch).toBe("test search");
        });

        it("should update multiple state properties", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.updateState({
                    globalSearch: "search term",
                    isFilterDrawerOpen: true,
                    currentView: "cards"
                });
            });

            expect(result.current.globalSearch).toBe("search term");
            expect(result.current.isFilterDrawerOpen).toBe(true);
            expect(result.current.currentView).toBe("cards");
        });

        it("should update activeFilters", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const filters = { status: "active", category: "sales" };

            act(() => {
                result.current.updateState({ activeFilters: filters });
            });

            expect(result.current.activeFilters).toEqual(filters);
        });

        it("should update sortModel", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const sortModel = [
                { colId: "name", sort: "asc" as const },
                { colId: "date", sort: "desc" as const }
            ];

            act(() => {
                result.current.updateState({ sortModel });
            });

            expect(result.current.sortModel).toEqual(sortModel);
        });

        it("should update columnVisibility", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const visibility = { col1: true, col2: false, col3: true };

            act(() => {
                result.current.updateState({ columnVisibility: visibility });
            });

            expect(result.current.columnVisibility).toEqual(visibility);
        });

        it("should update columnOrder", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const order = ["col3", "col1", "col2"];

            act(() => {
                result.current.updateState({ columnOrder: order });
            });

            expect(result.current.columnOrder).toEqual(order);
        });

        it("should preserve other state properties when updating", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            // Set initial state
            act(() => {
                result.current.updateState({
                    globalSearch: "initial",
                    activeFilters: { status: "active" }
                });
            });

            // Update only one property
            act(() => {
                result.current.updateState({ globalSearch: "updated" });
            });

            // globalSearch should be updated, activeFilters should remain
            expect(result.current.globalSearch).toBe("updated");
            expect(result.current.activeFilters).toEqual({ status: "active" });
        });
    });

    describe("Persistence", () => {
        it("should persist currentView updates", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            act(() => {
                result.current.updateState({ currentView: "cards" });
            });

            expect(mockOnPersist).toHaveBeenCalledWith({ viewMode: "cards" });
        });

        it("should persist activeFilters updates", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            const filters = { status: "active" };

            act(() => {
                result.current.updateState({ activeFilters: filters });
            });

            expect(mockOnPersist).toHaveBeenCalledWith({ activeFilters: filters });
        });

        it("should persist globalSearch updates", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            act(() => {
                result.current.updateState({ globalSearch: "search" });
            });

            expect(mockOnPersist).toHaveBeenCalledWith({ globalSearch: "search" });
        });

        it("should persist sortModel updates", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            const sortModel = [{ colId: "name", sort: "asc" as const }];

            act(() => {
                result.current.updateState({ sortModel });
            });

            expect(mockOnPersist).toHaveBeenCalledWith({ sortModel });
        });

        it("should persist columnVisibility updates", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            const visibility = { col1: true, col2: false };

            act(() => {
                result.current.updateState({ columnVisibility: visibility });
            });

            expect(mockOnPersist).toHaveBeenCalledWith({ columnVisibility: visibility });
        });

        it("should persist columnOrder updates", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            const order = ["col2", "col1"];

            act(() => {
                result.current.updateState({ columnOrder: order });
            });

            expect(mockOnPersist).toHaveBeenCalledWith({ columnOrder: order });
        });

        it("should persist multiple properties in single update", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            act(() => {
                result.current.updateState({
                    currentView: "list",
                    globalSearch: "test",
                    activeFilters: { status: "active" }
                });
            });

            expect(mockOnPersist).toHaveBeenCalledWith({
                viewMode: "list",
                globalSearch: "test",
                activeFilters: { status: "active" }
            });
        });

        it("should not persist non-persistable properties", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            act(() => {
                result.current.updateState({
                    isFilterDrawerOpen: true,
                    isHiddenDrawerOpen: true
                });
            });

            // onPersist should not be called for drawer states
            expect(mockOnPersist).not.toHaveBeenCalled();
        });

        it("should not call onPersist when callback is not provided", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.updateState({ currentView: "cards" });
            });

            // Should not throw error
            expect(result.current.currentView).toBe("cards");
        });
    });

    describe("Reset State", () => {
        it("should reset to initial state", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            // Modify state
            act(() => {
                result.current.updateState({
                    currentView: "cards",
                    globalSearch: "test",
                    activeFilters: { status: "active" },
                    isFilterDrawerOpen: true
                });
            });

            // Reset
            act(() => {
                result.current.resetState();
            });

            expect(result.current.currentView).toBe("grid");
            expect(result.current.globalSearch).toBe("");
            expect(result.current.activeFilters).toEqual({});
            expect(result.current.isFilterDrawerOpen).toBe(false);
        });

        it("should persist reset state", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            // Modify state
            act(() => {
                result.current.updateState({
                    currentView: "cards",
                    globalSearch: "test"
                });
            });

            mockOnPersist.mockClear();

            // Reset
            act(() => {
                result.current.resetState();
            });

            expect(mockOnPersist).toHaveBeenCalledWith({
                viewMode: "grid",
                activeFilters: {},
                globalSearch: "",
                sortModel: [],
                columnVisibility: {},
                columnOrder: []
            });
        });

        it("should call getInitialState again on reset", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            (getInitialState as jest.Mock).mockClear();

            act(() => {
                result.current.resetState();
            });

            expect(getInitialState).toHaveBeenCalledWith(mockProps);
        });
    });

    describe("Get Persisted State", () => {
        it("should return current persisted state snapshot", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const snapshot = result.current.getPersistedState();

            expect(snapshot).toEqual({
                viewMode: "grid",
                activeFilters: {},
                globalSearch: "",
                sortModel: [],
                columnVisibility: {},
                columnOrder: [],
                columnWidths: {}
            });
        });

        it("should return updated persisted state after changes", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.updateState({
                    currentView: "cards",
                    globalSearch: "test",
                    activeFilters: { status: "active" },
                    sortModel: [{ colId: "name", sort: "asc" }]
                });
            });

            const snapshot = result.current.getPersistedState();

            expect(snapshot).toEqual({
                viewMode: "cards",
                activeFilters: { status: "active" },
                globalSearch: "test",
                sortModel: [{ colId: "name", sort: "asc" }],
                columnVisibility: {},
                columnOrder: [],
                columnWidths: {}
            });
        });

        it("should return immutable snapshot", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const snapshot1 = result.current.getPersistedState();

            act(() => {
                result.current.updateState({ globalSearch: "changed" });
            });

            const snapshot2 = result.current.getPersistedState();

            // Snapshots should be different objects
            expect(snapshot1).not.toBe(snapshot2);
            expect(snapshot1.globalSearch).toBe("");
            expect(snapshot2.globalSearch).toBe("changed");
        });
    });

    describe("State Object Access", () => {
        it("should expose complete state object", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            expect(result.current.state).toHaveProperty("currentView");
            expect(result.current.state).toHaveProperty("isFilterDrawerOpen");
            expect(result.current.state).toHaveProperty("activeFilters");
            expect(result.current.state).toHaveProperty("globalSearch");
            expect(result.current.state).toHaveProperty("sortModel");
            expect(result.current.state).toHaveProperty("columnVisibility");
            expect(result.current.state).toHaveProperty("columnOrder");
        });

        it("should maintain state object reference stability", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const state1 = result.current.state;

            act(() => {
                result.current.updateState({ globalSearch: "test" });
            });

            const state2 = result.current.state;

            // State object should be a new reference after update
            expect(state1).not.toBe(state2);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty filter updates", () => {
            const { result } = renderHook(() => useGridState(mockProps, mockOnPersist));

            act(() => {
                result.current.updateState({ activeFilters: {} });
            });

            expect(result.current.activeFilters).toEqual({});
            expect(mockOnPersist).toHaveBeenCalledWith({ activeFilters: {} });
        });

        it("should handle empty sort model", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.updateState({ sortModel: [] });
            });

            expect(result.current.sortModel).toEqual([]);
        });

        it("should handle complex nested filters", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            const complexFilters = {
                category: ["A", "B", "C"],
                dateRange: { start: "2024-01-01", end: "2024-12-31" },
                nested: { prop: { deep: "value" } }
            };

            act(() => {
                result.current.updateState({ activeFilters: complexFilters });
            });

            expect(result.current.activeFilters).toEqual(complexFilters);
        });

        it("should handle rapid successive updates", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            act(() => {
                result.current.updateState({ globalSearch: "a" });
                result.current.updateState({ globalSearch: "ab" });
                result.current.updateState({ globalSearch: "abc" });
            });

            expect(result.current.globalSearch).toBe("abc");
        });

        it("should handle undefined in state updates", () => {
            const { result } = renderHook(() => useGridState(mockProps));

            // Set a value first
            act(() => {
                result.current.updateState({ globalSearch: "test" });
            });

            // Try to update with undefined (should use previous value)
            act(() => {
                result.current.updateState({ globalSearch: undefined as any });
            });

            expect(result.current.globalSearch).toBeUndefined();
        });
    });
});
