// src/hooks/__tests__/useFilterManagement.spec.ts
/**
 * Comprehensive tests for useFilterManagement hook
 * Tests filter operations, search, sort, and state management
 */

import { renderHook, act } from "@testing-library/react";
import { useFilterManagement, UseFilterManagementProps } from "../useFilterManagement";
import * as dataUtils from "../../utils/data";

// Mock the data utilities
jest.mock("../../utils/data");

const mockGetDistinctValues = dataUtils.getDistinctValuesForColumn as jest.MockedFunction<
    typeof dataUtils.getDistinctValuesForColumn
>;

describe("useFilterManagement Hook", () => {
    const mockColumns = [
        {
            attribute: "status",
            header: "Status",
            includeInFilters: true
        },
        {
            attribute: "category",
            header: "Category",
            includeInFilters: true
        },
        {
            attribute: "name",
            header: "Name",
            includeInFilters: false
        }
    ] as any[];

    const mockRowData = [
        { status: "Active", category: "A", name: "Item 1" },
        { status: "Inactive", category: "B", name: "Item 2" },
        { status: "Active", category: "A", name: "Item 3" }
    ];

    const defaultProps: UseFilterManagementProps = {
        activeFilters: {},
        globalSearch: "",
        sortModel: [],
        rowData: mockRowData,
        columns: mockColumns,
        onUpdateState: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock behavior
        mockGetDistinctValues.mockReturnValue(["Active", "Inactive"]);
    });

    describe("Initialization", () => {
        it("should return all expected functions", () => {
            const { result } = renderHook(() => useFilterManagement(defaultProps));

            expect(result.current).toHaveProperty("applyFilters");
            expect(result.current).toHaveProperty("clearFilters");
            expect(result.current).toHaveProperty("clearSearch");
            expect(result.current).toHaveProperty("setFilter");
            expect(result.current).toHaveProperty("removeFilter");
            expect(result.current).toHaveProperty("setSearch");
            expect(result.current).toHaveProperty("handleSearchChange");
            expect(result.current).toHaveProperty("setSort");
            expect(result.current).toHaveProperty("setSortColumn");
            expect(result.current).toHaveProperty("setSortDirection");
            expect(result.current).toHaveProperty("hasActiveFilters");
            expect(result.current).toHaveProperty("getFilterCount");
        });
    });

    describe("applyFilters", () => {
        it("should update state with filters, search, and sort", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            const filters = { status: ["Active"] };
            const search = "test";
            const sort = [{ colId: "name", sort: "asc" as const }];

            act(() => {
                result.current.applyFilters(filters, search, sort);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: filters,
                globalSearch: search,
                sortModel: sort
            });
        });

        it("should call AG Grid sync methods if provided", () => {
            const applyGridSortModel = jest.fn();
            const applyFiltersToGrid = jest.fn();
            const applyGlobalSearch = jest.fn();

            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    applyGridSortModel,
                    applyFiltersToGrid,
                    applyGlobalSearch
                })
            );

            const filters = { status: ["Active"] };
            const search = "test";
            const sort = [{ colId: "name", sort: "asc" as const }];

            act(() => {
                result.current.applyFilters(filters, search, sort);
            });

            expect(applyGridSortModel).toHaveBeenCalledWith(sort);
            expect(applyFiltersToGrid).toHaveBeenCalledWith(filters, search);
            expect(applyGlobalSearch).toHaveBeenCalledWith(search);
        });

        it("should not throw if AG Grid sync methods are not provided", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            const filters = { status: ["Active"] };
            const search = "test";
            const sort = [{ colId: "name", sort: "asc" as const }];

            expect(() => {
                act(() => {
                    result.current.applyFilters(filters, search, sort);
                });
            }).not.toThrow();

            expect(onUpdateState).toHaveBeenCalled();
        });

        it("should handle empty filters", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.applyFilters({}, "", []);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: {},
                globalSearch: "",
                sortModel: []
            });
        });
    });

    describe("clearFilters", () => {
        it("should reset all filters, search, and sort", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] },
                    globalSearch: "test",
                    sortModel: [{ colId: "name", sort: "asc" }],
                    onUpdateState
                })
            );

            act(() => {
                result.current.clearFilters();
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: {},
                globalSearch: "",
                sortModel: []
            });
        });

        it("should call AG Grid sync methods with empty values", () => {
            const applyGridSortModel = jest.fn();
            const applyFiltersToGrid = jest.fn();
            const applyGlobalSearch = jest.fn();

            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] },
                    applyGridSortModel,
                    applyFiltersToGrid,
                    applyGlobalSearch
                })
            );

            act(() => {
                result.current.clearFilters();
            });

            expect(applyGridSortModel).toHaveBeenCalledWith([]);
            expect(applyFiltersToGrid).toHaveBeenCalledWith({}, "");
            expect(applyGlobalSearch).toHaveBeenCalledWith("");
        });
    });

    describe("clearSearch", () => {
        it("should clear only global search", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] },
                    globalSearch: "test",
                    onUpdateState
                })
            );

            act(() => {
                result.current.clearSearch();
            });

            expect(onUpdateState).toHaveBeenCalledWith({ globalSearch: "" });
            expect(onUpdateState).not.toHaveBeenCalledWith(
                expect.objectContaining({ activeFilters: expect.anything() })
            );
        });

        it("should call applyGlobalSearch if provided", () => {
            const applyGlobalSearch = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    globalSearch: "test",
                    applyGlobalSearch
                })
            );

            act(() => {
                result.current.clearSearch();
            });

            expect(applyGlobalSearch).toHaveBeenCalledWith("");
        });
    });

    describe("setFilter", () => {
        beforeEach(() => {
            mockGetDistinctValues.mockReturnValue(["Active", "Inactive", "Pending"]);
        });

        it("should add a new filter", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setFilter("status", ["Active"]);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: { status: ["Active"] }
            });
        });

        it("should update an existing filter", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] },
                    onUpdateState
                })
            );

            act(() => {
                result.current.setFilter("status", ["Active", "Pending"]);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: { status: ["Active", "Pending"] }
            });
        });

        it("should remove filter if all options are selected", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            // Mock returns 3 distinct values
            mockGetDistinctValues.mockReturnValue(["Active", "Inactive", "Pending"]);

            act(() => {
                // Select all 3 options
                result.current.setFilter("status", ["Active", "Inactive", "Pending"]);
            });

            // Should not include status in filters (all selected = no filter)
            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: {}
            });
        });

        it("should preserve other filters when setting one filter", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { category: ["A"] },
                    onUpdateState
                })
            );

            act(() => {
                result.current.setFilter("status", ["Active"]);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: { category: ["A"], status: ["Active"] }
            });
        });

        it("should call applyFiltersToGrid if provided", () => {
            const applyFiltersToGrid = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    globalSearch: "search term",
                    applyFiltersToGrid
                })
            );

            act(() => {
                result.current.setFilter("status", ["Active"]);
            });

            expect(applyFiltersToGrid).toHaveBeenCalledWith({ status: ["Active"] }, "search term");
        });

        it("should ignore empty columnId", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setFilter("", ["Active"]);
            });

            expect(onUpdateState).not.toHaveBeenCalled();
        });

        it("should normalize filter values to strings", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setFilter("status", ["Active", "Inactive"] as any);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: { status: ["Active", "Inactive"] }
            });
        });
    });

    describe("removeFilter", () => {
        it("should remove an existing filter", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"], category: ["A"] },
                    onUpdateState
                })
            );

            act(() => {
                result.current.removeFilter("status");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: { category: ["A"] }
            });
        });

        it("should handle removing non-existent filter", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] },
                    onUpdateState
                })
            );

            act(() => {
                result.current.removeFilter("nonexistent");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: { status: ["Active"] }
            });
        });

        it("should call applyFiltersToGrid if provided", () => {
            const applyFiltersToGrid = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] },
                    globalSearch: "test",
                    applyFiltersToGrid
                })
            );

            act(() => {
                result.current.removeFilter("status");
            });

            expect(applyFiltersToGrid).toHaveBeenCalledWith({}, "test");
        });
    });

    describe("setSearch", () => {
        it("should update global search", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setSearch("test search");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                globalSearch: "test search"
            });
        });

        it("should call applyGlobalSearch if provided", () => {
            const applyGlobalSearch = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, applyGlobalSearch })
            );

            act(() => {
                result.current.setSearch("test");
            });

            expect(applyGlobalSearch).toHaveBeenCalledWith("test");
        });

        it("should handle empty search string", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    globalSearch: "existing",
                    onUpdateState
                })
            );

            act(() => {
                result.current.setSearch("");
            });

            expect(onUpdateState).toHaveBeenCalledWith({ globalSearch: "" });
        });
    });

    describe("handleSearchChange", () => {
        it("should handle input change event", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            const event = {
                target: { value: "new search" }
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleSearchChange(event);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                globalSearch: "new search"
            });
        });

        it("should handle empty input value", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            const event = {
                target: { value: "" }
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleSearchChange(event);
            });

            expect(onUpdateState).toHaveBeenCalledWith({ globalSearch: "" });
        });
    });

    describe("setSort", () => {
        it("should update sort model", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            const sort = [{ colId: "name", sort: "asc" as const }];

            act(() => {
                result.current.setSort(sort);
            });

            expect(onUpdateState).toHaveBeenCalledWith({ sortModel: sort });
        });

        it("should call applyGridSortModel if provided", () => {
            const applyGridSortModel = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, applyGridSortModel })
            );

            const sort = [{ colId: "name", sort: "asc" as const }];

            act(() => {
                result.current.setSort(sort);
            });

            expect(applyGridSortModel).toHaveBeenCalledWith(sort);
        });

        it("should filter out null sort directions for AG Grid", () => {
            const applyGridSortModel = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, applyGridSortModel })
            );

            const sort = [
                { colId: "name", sort: "asc" as const },
                { colId: "status", sort: null },
                { colId: "category", sort: "desc" as const }
            ];

            act(() => {
                result.current.setSort(sort);
            });

            // Should only pass non-null sorts to AG Grid
            expect(applyGridSortModel).toHaveBeenCalledWith([
                { colId: "name", sort: "asc" },
                { colId: "category", sort: "desc" }
            ]);
        });

        it("should handle empty sort model", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setSort([]);
            });

            expect(onUpdateState).toHaveBeenCalledWith({ sortModel: [] });
        });

        it("should handle multiple sort columns", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            const sort = [
                { colId: "name", sort: "asc" as const },
                { colId: "status", sort: "desc" as const }
            ];

            act(() => {
                result.current.setSort(sort);
            });

            expect(onUpdateState).toHaveBeenCalledWith({ sortModel: sort });
        });
    });

    describe("setSortColumn", () => {
        it("should set sort with default ascending direction", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setSortColumn("name");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                sortModel: [{ colId: "name", sort: "asc" }]
            });
        });

        it("should replace existing sort", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    sortModel: [{ colId: "status", sort: "desc" }],
                    onUpdateState
                })
            );

            act(() => {
                result.current.setSortColumn("name");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                sortModel: [{ colId: "name", sort: "asc" }]
            });
        });

        it("should clear sort if empty column ID", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    sortModel: [{ colId: "name", sort: "asc" }],
                    onUpdateState
                })
            );

            act(() => {
                result.current.setSortColumn("");
            });

            expect(onUpdateState).toHaveBeenCalledWith({ sortModel: [] });
        });
    });

    describe("setSortDirection", () => {
        it("should update sort direction for current column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    sortModel: [{ colId: "name", sort: "asc" }],
                    onUpdateState
                })
            );

            act(() => {
                result.current.setSortDirection("desc");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                sortModel: [{ colId: "name", sort: "desc" }]
            });
        });

        it("should do nothing if no sort is active", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setSortDirection("desc");
            });

            expect(onUpdateState).not.toHaveBeenCalled();
        });

        it("should preserve column ID when changing direction", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    sortModel: [{ colId: "status", sort: "desc" }],
                    onUpdateState
                })
            );

            act(() => {
                result.current.setSortDirection("asc");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                sortModel: [{ colId: "status", sort: "asc" }]
            });
        });
    });

    describe("hasActiveFilters", () => {
        it("should return false when no filters or search", () => {
            const { result } = renderHook(() => useFilterManagement(defaultProps));

            expect(result.current.hasActiveFilters()).toBe(false);
        });

        it("should return true when filters are active", () => {
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] }
                })
            );

            expect(result.current.hasActiveFilters()).toBe(true);
        });

        it("should return true when global search is active", () => {
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    globalSearch: "test"
                })
            );

            expect(result.current.hasActiveFilters()).toBe(true);
        });

        it("should return true when both filters and search are active", () => {
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"] },
                    globalSearch: "test"
                })
            );

            expect(result.current.hasActiveFilters()).toBe(true);
        });
    });

    describe("getFilterCount", () => {
        it("should return 0 when no filters or search", () => {
            const { result } = renderHook(() => useFilterManagement(defaultProps));

            expect(result.current.getFilterCount()).toBe(0);
        });

        it("should count active filters", () => {
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"], category: ["A"] }
                })
            );

            expect(result.current.getFilterCount()).toBe(2);
        });

        it("should count global search as one filter", () => {
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    globalSearch: "test"
                })
            );

            expect(result.current.getFilterCount()).toBe(1);
        });

        it("should count both filters and search", () => {
            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    activeFilters: { status: ["Active"], category: ["A"] },
                    globalSearch: "test"
                })
            );

            expect(result.current.getFilterCount()).toBe(3);
        });
    });

    describe("Edge Cases", () => {
        it("should handle rapid successive filter updates", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.setFilter("status", ["Active"]);
                result.current.setFilter("category", ["A"]);
                result.current.setSearch("test");
            });

            expect(onUpdateState).toHaveBeenCalledTimes(3);
        });

        it("should handle props changes", () => {
            const { result, rerender } = renderHook(
                (props: UseFilterManagementProps) => useFilterManagement(props),
                { initialProps: defaultProps }
            );

            const newProps = {
                ...defaultProps,
                activeFilters: { status: ["Active"] }
            };

            rerender(newProps);

            expect(result.current.hasActiveFilters()).toBe(true);
        });

        it("should maintain function reference stability", () => {
            const { result, rerender } = renderHook(() => useFilterManagement(defaultProps));

            const firstApplyFilters = result.current.applyFilters;
            const firstClearFilters = result.current.clearFilters;

            rerender();

            expect(result.current.applyFilters).toBe(firstApplyFilters);
            expect(result.current.clearFilters).toBe(firstClearFilters);
        });

        it("should handle null values in data", () => {
            const onUpdateState = jest.fn();
            const dataWithNulls = [
                { status: null, category: "A" },
                { status: "Active", category: null }
            ];

            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    rowData: dataWithNulls,
                    onUpdateState
                })
            );

            act(() => {
                result.current.setFilter("status", ["Active"]);
            });

            expect(onUpdateState).toHaveBeenCalled();
        });

        it("should handle complex filter objects", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            const complexFilters = {
                status: ["Active", "Pending"],
                category: ["A", "B", "C"],
                priority: ["High"]
            };

            act(() => {
                result.current.applyFilters(complexFilters, "search", []);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                activeFilters: complexFilters,
                globalSearch: "search",
                sortModel: []
            });
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle complete filter workflow", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useFilterManagement({ ...defaultProps, onUpdateState })
            );

            // Add filters
            act(() => {
                result.current.setFilter("status", ["Active"]);
            });

            // Add search
            act(() => {
                result.current.setSearch("test");
            });

            // Add sort
            act(() => {
                result.current.setSortColumn("name");
            });

            // Verify all updates were called
            expect(onUpdateState).toHaveBeenCalledTimes(3);

            // Clear everything
            act(() => {
                result.current.clearFilters();
            });

            expect(onUpdateState).toHaveBeenLastCalledWith({
                activeFilters: {},
                globalSearch: "",
                sortModel: []
            });
        });

        it("should handle filter modification workflow", () => {
            const onUpdateState = jest.fn();

            // Mock distinct values - need multiple return values for each setFilter call
            mockGetDistinctValues
                .mockReturnValueOnce(["Active", "Inactive", "Pending"]) // for status update
                .mockReturnValueOnce(["A", "B"]); // for category - 2 options, selecting 1

            const { result, rerender } = renderHook(
                (props: UseFilterManagementProps) => useFilterManagement(props),
                {
                    initialProps: {
                        ...defaultProps,
                        activeFilters: { status: ["Active"] },
                        onUpdateState
                    }
                }
            );

            // Modify existing filter (selecting 2 out of 3 options)
            act(() => {
                result.current.setFilter("status", ["Active", "Pending"]);
            });

            // Check call 1: status modified to include Pending
            expect(onUpdateState.mock.calls[0][0]).toEqual({
                activeFilters: { status: ["Active", "Pending"] }
            });

            // Rerender with updated filters to simulate state propagation
            rerender({
                ...defaultProps,
                activeFilters: { status: ["Active", "Pending"] },
                onUpdateState
            });

            // Add new filter (selecting 1 out of 2 options)
            act(() => {
                result.current.setFilter("category", ["A"]);
            });

            // Check call 2: category added
            expect(onUpdateState.mock.calls[1][0]).toEqual({
                activeFilters: { status: ["Active", "Pending"], category: ["A"] }
            });

            // Rerender with updated filters
            rerender({
                ...defaultProps,
                activeFilters: { status: ["Active", "Pending"], category: ["A"] },
                onUpdateState
            });

            // Remove status filter
            act(() => {
                result.current.removeFilter("status");
            });

            // Check call 3: status removed, leaving only category
            expect(onUpdateState.mock.calls[2][0]).toEqual({
                activeFilters: { category: ["A"] }
            });

            expect(onUpdateState).toHaveBeenCalledTimes(3);
        });

        it("should sync with AG Grid throughout workflow", () => {
            const applyGridSortModel = jest.fn();
            const applyFiltersToGrid = jest.fn();
            const applyGlobalSearch = jest.fn();

            mockGetDistinctValues.mockReturnValue(["A", "B", "C"]);

            const { result } = renderHook(() =>
                useFilterManagement({
                    ...defaultProps,
                    applyGridSortModel,
                    applyFiltersToGrid,
                    applyGlobalSearch
                })
            );

            // Apply complete state
            act(() => {
                result.current.applyFilters({ status: ["Active"] }, "test", [
                    { colId: "name", sort: "asc" }
                ]);
            });

            expect(applyGridSortModel).toHaveBeenCalledTimes(1);
            expect(applyFiltersToGrid).toHaveBeenCalledTimes(1);
            expect(applyGlobalSearch).toHaveBeenCalledTimes(1);

            // Update individual parts
            act(() => {
                result.current.setFilter("category", ["A"]);
            });

            expect(applyFiltersToGrid).toHaveBeenCalledTimes(2);

            act(() => {
                result.current.setSearch("new search");
            });

            expect(applyGlobalSearch).toHaveBeenCalledTimes(2);

            // Set a new sort column
            act(() => {
                result.current.setSortColumn("status");
            });

            expect(applyGridSortModel).toHaveBeenCalledTimes(2);
        });
    });
});
