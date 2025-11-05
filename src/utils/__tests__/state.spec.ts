import {
    getDefaultSortModel,
    getDefaultColumnVisibility,
    getDefaultColumnOrder,
    getDefaultColumnPinned
} from "../state";

describe("state utils", () => {
    const mockColumns = [
        {
            attribute: { id: "col1" },
            defaultSort: "asc",
            sortIndex: 1,
            hidden: false,
            pinned: "left" as const
        },
        {
            attribute: { id: "col2" },
            defaultSort: "desc",
            sortIndex: 2,
            hidden: true,
            pinned: "none" as const
        },
        {
            attribute: { id: "col3" },
            defaultSort: "none",
            sortIndex: 3,
            hidden: false,
            pinned: "right" as const
        },
        {
            attribute: { id: "col4" },
            hidden: false,
            pinned: "none" as const
        }
    ];

    describe("getDefaultSortModel", () => {
        it("returns empty array for no columns", () => {
            expect(getDefaultSortModel([])).toEqual([]);
        });

        it("returns sorted columns with default sort", () => {
            const result = getDefaultSortModel(mockColumns);
            expect(result).toEqual([
                { colId: "col1", sort: "asc" },
                { colId: "col2", sort: "desc" }
            ]);
        });

        it("ignores columns with defaultSort none", () => {
            const result = getDefaultSortModel(mockColumns);
            expect(result).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ colId: "col3" })
                ])
            );
        });

        it("sorts by sortIndex", () => {
            const unsortedColumns = [
                { attribute: { id: "col1" }, defaultSort: "asc", sortIndex: 2 },
                { attribute: { id: "col2" }, defaultSort: "desc", sortIndex: 1 }
            ];
            const result = getDefaultSortModel(unsortedColumns);
            expect(result).toEqual([
                { colId: "col2", sort: "desc" },
                { colId: "col1", sort: "asc" }
            ]);
        });

        it("uses default sortIndex of 999 when not specified", () => {
            const columnsWithoutIndex = [
                { attribute: { id: "col1" }, defaultSort: "asc" },
                { attribute: { id: "col2" }, defaultSort: "desc", sortIndex: 1 }
            ];
            const result = getDefaultSortModel(columnsWithoutIndex);
            expect(result).toEqual([
                { colId: "col2", sort: "desc" },
                { colId: "col1", sort: "asc" }
            ]);
        });
    });

    describe("getDefaultColumnVisibility", () => {
        it("returns empty object for no columns", () => {
            expect(getDefaultColumnVisibility([])).toEqual({});
        });

        it("returns visibility based on hidden property", () => {
            const result = getDefaultColumnVisibility(mockColumns);
            expect(result).toEqual({
                col1: true,
                col2: false,
                col3: true,
                col4: true
            });
        });

        it("ignores columns without attribute id", () => {
            const columnsWithoutId = [
                { attribute: null, hidden: false },
                { attribute: { id: "col1" }, hidden: false }
            ];
            const result = getDefaultColumnVisibility(columnsWithoutId);
            expect(result).toEqual({ col1: true });
        });
    });

    describe("getDefaultColumnOrder", () => {
        it("returns empty array for no columns", () => {
            expect(getDefaultColumnOrder([])).toEqual([]);
        });

        it("returns column ids in order", () => {
            const result = getDefaultColumnOrder(mockColumns);
            expect(result).toEqual(["col1", "col2", "col3", "col4"]);
        });

        it("ignores columns without attribute id", () => {
            const columnsWithoutId = [
                { attribute: null },
                { attribute: { id: "col1" } },
                { attribute: { id: "col2" } }
            ];
            const result = getDefaultColumnOrder(columnsWithoutId);
            expect(result).toEqual(["col1", "col2"]);
        });
    });

    describe("getDefaultColumnPinned", () => {
        it("returns empty object for no columns", () => {
            expect(getDefaultColumnPinned([])).toEqual({});
        });

        it("returns pinned configuration", () => {
            const result = getDefaultColumnPinned(mockColumns);
            expect(result).toEqual({
                col1: "left",
                col2: "none",
                col3: "right",
                col4: "none"
            });
        });

        it("defaults to none when pinned is not specified", () => {
            const columnsWithoutPinned = [
                { attribute: { id: "col1" } },
                { attribute: { id: "col2" }, pinned: undefined }
            ];
            const result = getDefaultColumnPinned(columnsWithoutPinned);
            expect(result).toEqual({
                col1: "none",
                col2: "none"
            });
        });

        it("ignores columns without attribute id", () => {
            const columnsWithoutId = [
                { attribute: null, pinned: "left" },
                { attribute: { id: "col1" }, pinned: "right" }
            ];
            const result = getDefaultColumnPinned(columnsWithoutId);
            expect(result).toEqual({ col1: "right" });
        });
    });
});