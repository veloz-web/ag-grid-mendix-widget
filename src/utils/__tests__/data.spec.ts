import {
    getRowSignature,
    getRowData,
    getFilterableColumns,
    getDistinctValuesForColumn,
    getFilteredData
} from "../data";
import { ValueStatus } from "mendix";

const createAttribute = (id: string) => ({
    id,
    get: (item: any) => ({
        status: item[`${id}Status`] ?? ValueStatus.Available,
        value: item[id]
    })
});

describe("getRowSignature", () => {
    it("returns empty string when there is no data", () => {
        expect(getRowSignature()).toBe("");
        expect(getRowSignature([])).toBe("");
    });

    it("uses exposed id properties when available", () => {
        const rows = [{ id: "1" }, { id: "2" }, { id: "3" }];
        expect(getRowSignature(rows)).toBe("1|2|3");
    });

    it("falls back to getGuid or JSON stringification", () => {
        const withGuid = { getGuid: () => "abc" };
        const noId = { name: "Sample" };
        expect(getRowSignature([withGuid, noId])).toBe('abc|{"name":"Sample"}');
    });
});

describe("getRowData", () => {
    it("returns an empty array when datasource is missing or unavailable", () => {
        expect(getRowData(undefined as any)).toEqual([]);
        expect(getRowData({ status: ValueStatus.Loading, items: [{ id: 1 }] } as any)).toEqual([]);
    });

    it("returns datasource items when available", () => {
        const items = [{ id: 1 }];
        expect(getRowData({ status: ValueStatus.Available, items } as any)).toBe(items);
    });
});

describe("getFilterableColumns", () => {
    it("includes drawer columns and sorts active filters first", () => {
        const columns = [
            {
                attribute: { id: "status" },
                includeInFilters: true,
                header: { value: "Status" }
            },
            {
                attribute: { id: "owner" },
                includeInFilters: true,
                header: { value: "Owner" }
            },
            {
                attribute: { id: "drawer" },
                filterLocation: "drawer",
                header: { value: "Drawer" }
            },
            {
                attribute: { id: "toolbar" },
                filterLocation: "toolbar",
                header: { value: "Toolbar" }
            }
        ];

        const result = getFilterableColumns(columns as any, { owner: ["A"] });

        expect(result).toHaveLength(3);
        expect(result[0].attribute.id).toBe("owner");
        expect(result.map((col: any) => col.attribute.id)).toContain("drawer");
        expect(result.find((col: any) => col.attribute.id === "toolbar")).toBeUndefined();
    });
});

describe("getDistinctValuesForColumn", () => {
    const columns = [
        {
            attribute: {
                id: "status",
                get: (item: any) => ({ status: ValueStatus.Available, value: item.status })
            }
        }
    ];

    it("returns sorted unique values for available rows", () => {
        const rows = [
            { status: "Open" },
            { status: "Closed" },
            { status: "Open" },
            { status: null }
        ];

        expect(getDistinctValuesForColumn(rows, columns as any, "status")).toEqual([
            "Closed",
            "Open"
        ]);
    });

    it("returns empty array when column is missing", () => {
        expect(getDistinctValuesForColumn([], columns as any, "missing")).toEqual([]);
    });
});

describe("getFilteredData", () => {
    const columns = [
        { attribute: createAttribute("name") },
        { attribute: createAttribute("status") },
        { attribute: createAttribute("priority") },
        { attribute: createAttribute("created") }
    ];

    const rowData = [
        { id: "1", name: "Alpha", status: "Open", priority: 2, created: "2023-01-02" },
        { id: "2", name: "Beta", status: "Closed", priority: 1, created: "2023-01-04" },
        { id: "3", name: "Gamma", status: "Open", priority: 3, created: "2023-02-10" }
    ];

    it("returns original data when no filters or search applied", () => {
        const state = { activeFilters: {}, globalSearch: "", sortModel: [] };
        expect(getFilteredData(rowData, columns as any, state)).toEqual(rowData);
    });

    it("applies global search, active filters, and sorting", () => {
        const state = {
            activeFilters: {
                status: ["Closed"],
                created: { from: "2023-01-01", to: "2023-01-05" }
            },
            globalSearch: "beta",
            sortModel: [{ colId: "priority", sort: "desc" }]
        };

        const result = getFilteredData(rowData, columns as any, state);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("2");
    });

    it("handles multi-select filters and sorts ascending", () => {
        const state = {
            activeFilters: {
                status: ["Open"]
            },
            globalSearch: "",
            sortModel: [{ colId: "priority", sort: "asc" }]
        };

        const result = getFilteredData(rowData, columns as any, state);
        expect(result.map((row) => row.id)).toEqual(["1", "3"]);
    });
});
