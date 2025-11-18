import { exportToPDF } from "../pdfExport";
import pdfMake from "pdfmake/build/pdfmake";

jest.mock("pdfmake/build/vfs_fonts", () => ({
    __esModule: true,
    default: {},
    pdfMake: { vfs: {} },
    vfs: {}
}));

jest.mock("pdfmake/build/pdfmake", () => ({
    __esModule: true,
    default: {
        createPdf: jest.fn(),
        vfs: {}
    }
}));

type MockGridApi = {
    getAllDisplayedColumns: () => any[];
    forEachNodeAfterFilterAndSort: (callback: (node: any) => void) => void;
};

const mockPdfMake = pdfMake as unknown as { createPdf: jest.Mock };
const downloadMock = jest.fn();

const createMockGridApi = (): MockGridApi => {
    const columns = [
        {
            getColDef: () => ({ field: "name", headerName: "Name" }),
            getSort: () => "asc"
        },
        {
            getColDef: () => ({
                field: "amount",
                headerName: "Amount",
                valueGetter: ({ data }: { data: { amount: number } }) => data.amount * 2
            }),
            getSort: () => null
        }
    ];

    const rows = [{ data: { name: "Alice", amount: 10 } }, { data: { name: "Bob", amount: 20 } }];

    return {
        getAllDisplayedColumns: () => columns,
        forEachNodeAfterFilterAndSort: (callback) => {
            rows.forEach((node) => callback(node));
        }
    };
};

describe("exportToPDF", () => {
    beforeEach(() => {
        downloadMock.mockClear();
        mockPdfMake.createPdf.mockReset();
        mockPdfMake.createPdf.mockReturnValue({ download: downloadMock });
    });

    it("logs a warning if grid API is missing", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

        exportToPDF(null);

        expect(warnSpy).toHaveBeenCalledWith("[AGGrid] Cannot export PDF: Grid API not available");
        expect(mockPdfMake.createPdf).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("creates a document definition with headers, rows, and custom options", () => {
        const gridApi = createMockGridApi();

        exportToPDF(gridApi as any, {
            fileName: "custom-report",
            title: "Sales Report",
            pageOrientation: "portrait"
        });

        expect(mockPdfMake.createPdf).toHaveBeenCalledTimes(1);
        const docDefinition = mockPdfMake.createPdf.mock.calls[0][0];

        expect(docDefinition.pageOrientation).toBe("portrait");
        expect(docDefinition.content[0].text).toBe("Sales Report");

        const table = docDefinition.content[1].table;
        expect(table.body).toHaveLength(3); // 1 header row + 2 data rows
        expect(table.body[0]).toHaveLength(2);

        expect(downloadMock).toHaveBeenCalledWith("custom-report.pdf");
    });

    it("logs an error when pdfMake throws", () => {
        const gridApi = createMockGridApi();
        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockPdfMake.createPdf.mockImplementationOnce(() => {
            throw new Error("pdf failure");
        });

        exportToPDF(gridApi as any);

        expect(errorSpy).toHaveBeenCalledWith("[AGGrid] PDF export failed", expect.any(Error));
        expect(downloadMock).not.toHaveBeenCalled();

        errorSpy.mockRestore();
    });
});
