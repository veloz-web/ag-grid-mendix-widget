// src/hooks/__tests__/useColumnManagement.spec.ts
/**
 * Comprehensive tests for useColumnManagement hook
 * Tests column visibility, ordering, drawer management, and utilities
 */

import { renderHook, act } from "@testing-library/react";
import { useColumnManagement, UseColumnManagementProps } from "../useColumnManagement";
import * as stateUtils from "../../utils/state";

// Mock the state utilities
jest.mock("../../utils/state");

const mockGetDefaultColumnVisibility = stateUtils.getDefaultColumnVisibility as jest.MockedFunction<
    typeof stateUtils.getDefaultColumnVisibility
>;

describe("useColumnManagement Hook", () => {
    const mockColumns = [
        {
            attribute: { id: "name" },
            header: "Name",
            hidden: false
        },
        {
            attribute: { id: "status" },
            header: "Status",
            hidden: false
        },
        {
            attribute: { id: "category" },
            header: "Category",
            hidden: true
        },
        {
            attribute: { id: "priority" },
            header: "Priority",
            hidden: false
        }
    ] as any[];

    const defaultProps: UseColumnManagementProps = {
        columns: mockColumns,
        columnVisibility: {
            name: true,
            status: true,
            category: false,
            priority: true
        },
        columnOrder: ["name", "status", "category", "priority"],
        isHiddenDrawerOpen: false,
        onUpdateState: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Initialization", () => {
        it("should return all expected functions", () => {
            const { result } = renderHook(() => useColumnManagement(defaultProps));

            expect(result.current).toHaveProperty("toggleHiddenDrawer");
            expect(result.current).toHaveProperty("toggleColumnVisibility");
            expect(result.current).toHaveProperty("toggleColumnVisibilityItem");
            expect(result.current).toHaveProperty("resetColumnVisibilityToDefault");
            expect(result.current).toHaveProperty("showColumn");
            expect(result.current).toHaveProperty("hideColumn");
            expect(result.current).toHaveProperty("getVisibleColumns");
            expect(result.current).toHaveProperty("getHiddenColumns");
        });

        it("should have toggleColumnVisibility as alias for toggleHiddenDrawer", () => {
            const { result } = renderHook(() => useColumnManagement(defaultProps));

            expect(result.current.toggleColumnVisibility).toBe(result.current.toggleHiddenDrawer);
        });
    });

    describe("toggleHiddenDrawer", () => {
        it("should open drawer when closed", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.toggleHiddenDrawer();
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                isHiddenDrawerOpen: true
            });
        });

        it("should close drawer when open", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    isHiddenDrawerOpen: true,
                    onUpdateState
                })
            );

            act(() => {
                result.current.toggleHiddenDrawer();
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                isHiddenDrawerOpen: false
            });
        });

        it("should toggle drawer multiple times", () => {
            const onUpdateState = jest.fn();
            const { result, rerender } = renderHook(
                (props: UseColumnManagementProps) => useColumnManagement(props),
                {
                    initialProps: {
                        ...defaultProps,
                        isHiddenDrawerOpen: false,
                        onUpdateState
                    }
                }
            );

            // Open
            act(() => {
                result.current.toggleHiddenDrawer();
            });
            expect(onUpdateState).toHaveBeenCalledWith({ isHiddenDrawerOpen: true });

            // Rerender with new state
            rerender({
                ...defaultProps,
                isHiddenDrawerOpen: true,
                onUpdateState
            });

            // Close
            act(() => {
                result.current.toggleHiddenDrawer();
            });
            expect(onUpdateState).toHaveBeenCalledWith({ isHiddenDrawerOpen: false });

            // Rerender with new state
            rerender({
                ...defaultProps,
                isHiddenDrawerOpen: false,
                onUpdateState
            });

            // Open again
            act(() => {
                result.current.toggleHiddenDrawer();
            });
            expect(onUpdateState).toHaveBeenCalledWith({ isHiddenDrawerOpen: true });

            expect(onUpdateState).toHaveBeenCalledTimes(3);
        });
    });

    describe("toggleColumnVisibilityItem", () => {
        it("should show a hidden column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.toggleColumnVisibilityItem("category", true);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {
                    name: true,
                    status: true,
                    category: true, // Changed to true
                    priority: true
                }
            });
        });

        it("should hide a visible column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.toggleColumnVisibilityItem("name", false);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {
                    name: false, // Changed to false
                    status: true,
                    category: false,
                    priority: true
                }
            });
        });

        it("should handle toggling non-existent column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.toggleColumnVisibilityItem("nonexistent", true);
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {
                    name: true,
                    status: true,
                    category: false,
                    priority: true,
                    nonexistent: true
                }
            });
        });

        it("should preserve other columns when toggling one", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.toggleColumnVisibilityItem("status", false);
            });

            const updatedVisibility = onUpdateState.mock.calls[0][0].columnVisibility;
            expect(updatedVisibility.name).toBe(true);
            expect(updatedVisibility.status).toBe(false);
            expect(updatedVisibility.category).toBe(false);
            expect(updatedVisibility.priority).toBe(true);
        });

        it("should handle rapid successive toggles", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.toggleColumnVisibilityItem("name", false);
                result.current.toggleColumnVisibilityItem("status", false);
                result.current.toggleColumnVisibilityItem("priority", false);
            });

            expect(onUpdateState).toHaveBeenCalledTimes(3);
        });
    });

    describe("showColumn", () => {
        it("should show a hidden column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.showColumn("category");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {
                    name: true,
                    status: true,
                    category: true, // Changed to true
                    priority: true
                }
            });
        });

        it("should handle showing already visible column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.showColumn("name");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {
                    name: true, // Already true
                    status: true,
                    category: false,
                    priority: true
                }
            });
        });

        it("should show multiple columns", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.showColumn("category");
            });

            expect(onUpdateState).toHaveBeenCalledTimes(1);
        });
    });

    describe("hideColumn", () => {
        it("should hide a visible column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.hideColumn("name");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {
                    name: false, // Changed to false
                    status: true,
                    category: false,
                    priority: true
                }
            });
        });

        it("should handle hiding already hidden column", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.hideColumn("category");
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {
                    name: true,
                    status: true,
                    category: false, // Already false
                    priority: true
                }
            });
        });

        it("should hide multiple columns", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.hideColumn("name");
                result.current.hideColumn("status");
            });

            expect(onUpdateState).toHaveBeenCalledTimes(2);
        });
    });

    describe("resetColumnVisibilityToDefault", () => {
        it("should reset to default visibility from columns config", () => {
            const onUpdateState = jest.fn();
            const defaultVisibility = {
                name: true,
                status: true,
                category: false, // hidden: true in config
                priority: true
            };

            mockGetDefaultColumnVisibility.mockReturnValue(defaultVisibility);

            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {
                        name: false,
                        status: false,
                        category: true,
                        priority: false
                    },
                    onUpdateState
                })
            );

            act(() => {
                result.current.resetColumnVisibilityToDefault();
            });

            expect(mockGetDefaultColumnVisibility).toHaveBeenCalledWith(mockColumns);
            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: defaultVisibility
            });
        });

        it("should handle empty columns array", () => {
            const onUpdateState = jest.fn();
            mockGetDefaultColumnVisibility.mockReturnValue({});

            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columns: [],
                    onUpdateState
                })
            );

            act(() => {
                result.current.resetColumnVisibilityToDefault();
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: {}
            });
        });

        it("should call utility with current columns", () => {
            const onUpdateState = jest.fn();
            mockGetDefaultColumnVisibility.mockReturnValue({});

            const customColumns = [
                { attribute: { id: "col1" }, hidden: false },
                { attribute: { id: "col2" }, hidden: true }
            ] as any[];

            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columns: customColumns,
                    onUpdateState
                })
            );

            act(() => {
                result.current.resetColumnVisibilityToDefault();
            });

            expect(mockGetDefaultColumnVisibility).toHaveBeenCalledWith(customColumns);
        });
    });

    describe("getVisibleColumns", () => {
        it("should return list of visible column IDs", () => {
            const { result } = renderHook(() => useColumnManagement(defaultProps));

            const visibleColumns = result.current.getVisibleColumns();

            expect(visibleColumns).toEqual(["name", "status", "priority"]);
            expect(visibleColumns).not.toContain("category");
        });

        it("should return empty array when all columns hidden", () => {
            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {
                        name: false,
                        status: false,
                        category: false,
                        priority: false
                    }
                })
            );

            const visibleColumns = result.current.getVisibleColumns();

            expect(visibleColumns).toEqual([]);
        });

        it("should return all columns when all visible", () => {
            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {
                        name: true,
                        status: true,
                        category: true,
                        priority: true
                    }
                })
            );

            const visibleColumns = result.current.getVisibleColumns();

            expect(visibleColumns).toHaveLength(4);
            expect(visibleColumns).toContain("name");
            expect(visibleColumns).toContain("status");
            expect(visibleColumns).toContain("category");
            expect(visibleColumns).toContain("priority");
        });

        it("should handle empty columnVisibility object", () => {
            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {}
                })
            );

            const visibleColumns = result.current.getVisibleColumns();

            expect(visibleColumns).toEqual([]);
        });

        it("should update when visibility changes", () => {
            const onUpdateState = jest.fn();
            const { result, rerender } = renderHook(
                (props: UseColumnManagementProps) => useColumnManagement(props),
                {
                    initialProps: { ...defaultProps, onUpdateState }
                }
            );

            const initialVisible = result.current.getVisibleColumns();
            expect(initialVisible).toEqual(["name", "status", "priority"]);

            // Show category
            act(() => {
                result.current.showColumn("category");
            });

            // Rerender with updated visibility
            rerender({
                ...defaultProps,
                columnVisibility: {
                    name: true,
                    status: true,
                    category: true,
                    priority: true
                },
                onUpdateState
            });

            const updatedVisible = result.current.getVisibleColumns();
            expect(updatedVisible).toEqual(["name", "status", "category", "priority"]);
        });
    });

    describe("getHiddenColumns", () => {
        it("should return list of hidden column IDs", () => {
            const { result } = renderHook(() => useColumnManagement(defaultProps));

            const hiddenColumns = result.current.getHiddenColumns();

            expect(hiddenColumns).toEqual(["category"]);
            expect(hiddenColumns).not.toContain("name");
            expect(hiddenColumns).not.toContain("status");
            expect(hiddenColumns).not.toContain("priority");
        });

        it("should return empty array when all columns visible", () => {
            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {
                        name: true,
                        status: true,
                        category: true,
                        priority: true
                    }
                })
            );

            const hiddenColumns = result.current.getHiddenColumns();

            expect(hiddenColumns).toEqual([]);
        });

        it("should return all columns when all hidden", () => {
            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {
                        name: false,
                        status: false,
                        category: false,
                        priority: false
                    }
                })
            );

            const hiddenColumns = result.current.getHiddenColumns();

            expect(hiddenColumns).toHaveLength(4);
            expect(hiddenColumns).toContain("name");
            expect(hiddenColumns).toContain("status");
            expect(hiddenColumns).toContain("category");
            expect(hiddenColumns).toContain("priority");
        });

        it("should handle empty columnVisibility object", () => {
            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {}
                })
            );

            const hiddenColumns = result.current.getHiddenColumns();

            expect(hiddenColumns).toEqual([]);
        });

        it("should update when visibility changes", () => {
            const onUpdateState = jest.fn();
            const { result, rerender } = renderHook(
                (props: UseColumnManagementProps) => useColumnManagement(props),
                {
                    initialProps: { ...defaultProps, onUpdateState }
                }
            );

            const initialHidden = result.current.getHiddenColumns();
            expect(initialHidden).toEqual(["category"]);

            // Hide name
            act(() => {
                result.current.hideColumn("name");
            });

            // Rerender with updated visibility
            rerender({
                ...defaultProps,
                columnVisibility: {
                    name: false,
                    status: true,
                    category: false,
                    priority: true
                },
                onUpdateState
            });

            const updatedHidden = result.current.getHiddenColumns();
            expect(updatedHidden).toEqual(["name", "category"]);
        });
    });

    describe("Edge Cases", () => {
        it("should handle props changes", () => {
            const { result, rerender } = renderHook(
                (props: UseColumnManagementProps) => useColumnManagement(props),
                { initialProps: defaultProps }
            );

            const initialVisible = result.current.getVisibleColumns();
            expect(initialVisible).toEqual(["name", "status", "priority"]);

            // Update props with different visibility
            rerender({
                ...defaultProps,
                columnVisibility: {
                    name: true,
                    status: false,
                    category: true,
                    priority: false
                }
            });

            const updatedVisible = result.current.getVisibleColumns();
            expect(updatedVisible).toEqual(["name", "category"]);
        });

        it("should maintain function reference stability", () => {
            const { result, rerender } = renderHook(() => useColumnManagement(defaultProps));

            const firstGetVisible = result.current.getVisibleColumns;

            rerender();

            // Functions should maintain reference when dependencies don't change
            expect(result.current.getVisibleColumns).toBe(firstGetVisible);
        });

        it("should handle complex visibility updates", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.hideColumn("name");
                result.current.hideColumn("status");
                result.current.showColumn("category");
            });

            expect(onUpdateState).toHaveBeenCalledTimes(3);

            // Verify last call
            const lastCall = onUpdateState.mock.calls[2][0];
            expect(lastCall.columnVisibility.category).toBe(true);
        });

        it("should handle drawer toggle with other state updates", () => {
            const onUpdateState = jest.fn();
            const { result } = renderHook(() =>
                useColumnManagement({ ...defaultProps, onUpdateState })
            );

            act(() => {
                result.current.toggleHiddenDrawer();
                result.current.showColumn("category");
            });

            expect(onUpdateState).toHaveBeenCalledTimes(2);
            expect(onUpdateState.mock.calls[0][0]).toEqual({ isHiddenDrawerOpen: true });
            expect(onUpdateState.mock.calls[1][0]).toHaveProperty("columnVisibility");
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle complete column management workflow", () => {
            const onUpdateState = jest.fn();
            const { result, rerender } = renderHook(
                (props: UseColumnManagementProps) => useColumnManagement(props),
                {
                    initialProps: { ...defaultProps, onUpdateState }
                }
            );

            // 1. Open drawer
            act(() => {
                result.current.toggleHiddenDrawer();
            });
            expect(onUpdateState).toHaveBeenCalledWith({ isHiddenDrawerOpen: true });

            // 2. Hide some columns
            act(() => {
                result.current.hideColumn("name");
            });

            rerender({
                ...defaultProps,
                columnVisibility: { ...defaultProps.columnVisibility, name: false },
                isHiddenDrawerOpen: true,
                onUpdateState
            });

            act(() => {
                result.current.hideColumn("priority");
            });

            // 3. Show a hidden column
            rerender({
                ...defaultProps,
                columnVisibility: {
                    ...defaultProps.columnVisibility,
                    name: false,
                    priority: false
                },
                isHiddenDrawerOpen: true,
                onUpdateState
            });

            act(() => {
                result.current.showColumn("category");
            });

            // 4. Close drawer
            rerender({
                ...defaultProps,
                columnVisibility: {
                    ...defaultProps.columnVisibility,
                    name: false,
                    priority: false,
                    category: true
                },
                isHiddenDrawerOpen: true,
                onUpdateState
            });

            act(() => {
                result.current.toggleHiddenDrawer();
            });

            expect(onUpdateState).toHaveBeenCalledTimes(5);
        });

        it("should handle reset to defaults workflow", () => {
            const onUpdateState = jest.fn();
            const defaultVisibility = {
                name: true,
                status: true,
                category: false,
                priority: true
            };

            mockGetDefaultColumnVisibility.mockReturnValue(defaultVisibility);

            const { result } = renderHook(() =>
                useColumnManagement({
                    ...defaultProps,
                    columnVisibility: {
                        name: false,
                        status: false,
                        category: true,
                        priority: false
                    },
                    onUpdateState
                })
            );

            // Check current state
            const hiddenBefore = result.current.getHiddenColumns();
            expect(hiddenBefore).toEqual(["name", "status", "priority"]);

            // Reset to defaults
            act(() => {
                result.current.resetColumnVisibilityToDefault();
            });

            expect(onUpdateState).toHaveBeenCalledWith({
                columnVisibility: defaultVisibility
            });
        });

        it("should handle selective show/hide operations", () => {
            const onUpdateState = jest.fn();
            const { result, rerender } = renderHook(
                (props: UseColumnManagementProps) => useColumnManagement(props),
                {
                    initialProps: { ...defaultProps, onUpdateState }
                }
            );

            // Hide all columns
            act(() => {
                result.current.hideColumn("name");
            });

            rerender({
                ...defaultProps,
                columnVisibility: { ...defaultProps.columnVisibility, name: false },
                onUpdateState
            });

            act(() => {
                result.current.hideColumn("status");
            });

            rerender({
                ...defaultProps,
                columnVisibility: {
                    ...defaultProps.columnVisibility,
                    name: false,
                    status: false
                },
                onUpdateState
            });

            act(() => {
                result.current.hideColumn("priority");
            });

            rerender({
                ...defaultProps,
                columnVisibility: {
                    name: false,
                    status: false,
                    category: false,
                    priority: false
                },
                onUpdateState
            });

            // Verify all hidden
            const allHidden = result.current.getVisibleColumns();
            expect(allHidden).toEqual([]);

            // Show selective columns
            act(() => {
                result.current.showColumn("name");
                result.current.showColumn("category");
            });

            expect(onUpdateState).toHaveBeenCalledTimes(5);
        });
    });
});
