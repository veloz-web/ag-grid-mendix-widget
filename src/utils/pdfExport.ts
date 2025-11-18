// src/utils/pdfExport.ts
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { GridApi } from "ag-grid-community";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";

// Initialize pdfMake virtual file system for fonts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

// Styling constants
const HEADER_ROW_COLOR = "#f8f8f8";
const EVEN_ROW_COLOR = "#fcfcfc";
const ODD_ROW_COLOR = "#ffffff";

/**
 * PDF Export Configuration Options
 */
export interface PdfExportOptions {
    fileName?: string;
    pageOrientation?: "portrait" | "landscape";
    allColumns?: boolean;
    title?: string;
}

/**
 * Extracts column headers from AG Grid, including sort indicators
 */
const getHeaderToExport = (gridApi: GridApi): Array<{ text: string; style: string }> => {
    const columns = gridApi.getAllDisplayedColumns();
    return columns.map((column) => {
        const colDef = column.getColDef();
        const field = colDef.field || colDef.colId || "";
        const sort = column.getSort();

        // Get header name from column definition, or format field name
        let headerName = colDef.headerName || field;
        if (!colDef.headerName && field) {
            // Capitalize first letter if no header name provided
            headerName = field.charAt(0).toUpperCase() + field.slice(1);
        }

        // Add sort indicator if column is sorted
        const sortIndicator = sort ? ` (${sort === "asc" ? "↑" : "↓"})` : "";

        return {
            text: headerName + sortIndicator,
            style: "tableHeader"
        };
    });
};

/**
 * Extracts row data from AG Grid, respecting filters and sorting
 */
const getRowsToExport = (gridApi: GridApi): Array<Array<{ text: string }>> => {
    const columns = gridApi.getAllDisplayedColumns();

    const getCellToExport = (column: any, node: any): { text: string } => {
        // Get cell value using column field or valueGetter
        const colDef = column.getColDef();
        let value: any;

        if (colDef.valueGetter) {
            value = colDef.valueGetter({
                data: node.data,
                node,
                column,
                colDef,
                api: gridApi
            } as any);
        } else if (colDef.field) {
            value = node.data?.[colDef.field];
        }

        return {
            text: value != null ? String(value) : ""
        };
    };

    const rowsToExport: Array<Array<{ text: string }>> = [];

    // Use forEachNodeAfterFilterAndSort to respect current grid state
    gridApi.forEachNodeAfterFilterAndSort((node) => {
        const rowToExport = columns.map((column) => getCellToExport(column, node));
        rowsToExport.push(rowToExport);
    });

    return rowsToExport;
};

/**
 * Creates table layout with alternating row colors
 */
const createLayout = (numberOfHeaderRows = 1) => ({
    fillColor: (rowIndex: number) => {
        if (rowIndex < numberOfHeaderRows) {
            return HEADER_ROW_COLOR;
        }
        return rowIndex % 2 === 0 ? EVEN_ROW_COLOR : ODD_ROW_COLOR;
    },
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => "#e0e0e0",
    vLineColor: () => "#e0e0e0"
});

/**
 * Creates the pdfMake document definition
 */
const getDocument = (gridApi: GridApi, options: PdfExportOptions): TDocumentDefinitions => {
    const columns = gridApi.getAllDisplayedColumns();
    const headerRow = getHeaderToExport(gridApi);
    const rows = getRowsToExport(gridApi);

    // Calculate column widths (equal distribution)
    const columnCount = columns.length;
    const columnWidth = `${100 / columnCount}%`;
    const widths = Array(columnCount).fill(columnWidth);

    const content: Content = [];

    // Add title if provided
    if (options.title) {
        content.push({
            text: options.title,
            style: "title",
            margin: [0, 0, 0, 20] as [number, number, number, number]
        });
    }

    // Add table
    content.push({
        table: {
            headerRows: 1,
            widths,
            body: [headerRow, ...rows],
            heights: (rowIndex: number) => (rowIndex === 0 ? 25 : 15)
        },
        layout: createLayout(1)
    });

    // Add footer with timestamp and page numbers
    const footer = (currentPage: number, pageCount: number) => ({
        columns: [
            {
                text: `Generated on ${new Date().toLocaleString()}`,
                alignment: "left" as const,
                fontSize: 8,
                margin: [40, 0, 0, 0] as [number, number, number, number]
            },
            {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: "right" as const,
                fontSize: 8,
                margin: [0, 0, 40, 0] as [number, number, number, number]
            }
        ],
        margin: [0, 10, 0, 0] as [number, number, number, number]
    });

    return {
        pageOrientation: options.pageOrientation || "landscape",
        pageMargins: [40, 60, 40, 60] as [number, number, number, number],
        content,
        footer,
        styles: {
            title: {
                fontSize: 18,
                bold: true,
                alignment: "center" as const
            },
            tableHeader: {
                bold: true,
                fontSize: 11,
                color: "#333333",
                fillColor: HEADER_ROW_COLOR
            }
        },
        defaultStyle: {
            fontSize: 9
        }
    };
};

/**
 * Main export function - triggers PDF download
 */
export const exportToPDF = (gridApi: GridApi | null, options: PdfExportOptions = {}): void => {
    if (!gridApi) {
        console.warn("[AGGrid] Cannot export PDF: Grid API not available");
        return;
    }

    try {
        const doc = getDocument(gridApi, options);
        const fileName = options.fileName || "export";
        pdfMake.createPdf(doc).download(`${fileName}.pdf`);

        console.log("[AGGrid] PDF export completed", {
            fileName: `${fileName}.pdf`,
            orientation: options.pageOrientation || "landscape",
            allColumns: options.allColumns
        });
    } catch (error) {
        console.error("[AGGrid] PDF export failed", error);
    }
};
