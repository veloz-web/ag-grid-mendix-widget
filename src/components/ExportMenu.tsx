import React, { useState, useRef, useEffect } from "react";

type Format = "csv" | "excel" | "pdf";

export interface ExportRequest {
    format: Format;
    fileName: string;
    allColumns: boolean;
    pageOrientation?: "landscape" | "portrait";
    title?: string;
}

interface Props {
    enableCsv: boolean;
    enableExcel: boolean;
    enablePdf: boolean;
    csvFileName?: string;
    excelFileName?: string;
    pdfFileName?: string;
    defaultFormat?: Format;
    defaultAllColumns?: boolean;
    defaultPdfOrientation?: "landscape" | "portrait";
    defaultPdfTitle?: string;
    onExportRequest: (req: ExportRequest) => void;
}

export const ExportMenu: React.FC<Props> = ({
    enableCsv,
    enableExcel,
    enablePdf,
    csvFileName = "export",
    excelFileName = "export",
    pdfFileName = "export",
    defaultFormat = enableCsv ? "csv" : enableExcel ? "excel" : enablePdf ? "pdf" : "csv",
    defaultAllColumns = true,
    defaultPdfOrientation = "landscape",
    defaultPdfTitle = "",
    onExportRequest
}) => {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<Format>(defaultFormat);
    const [fileName, setFileName] = useState<string>(
        format === "csv" ? csvFileName : format === "excel" ? excelFileName : pdfFileName
    );
    const [allColumns, setAllColumns] = useState<boolean>(defaultAllColumns);
    const [pdfOrientation, setPdfOrientation] = useState<"landscape" | "portrait">(
        defaultPdfOrientation
    );
    const [pdfTitle, setPdfTitle] = useState<string>(defaultPdfTitle);
    const ref = useRef<HTMLDivElement | null>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (open && ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        window.addEventListener("click", handler);
        return () => window.removeEventListener("click", handler);
    }, [open]);

    // Keep filename in sync when format changes
    useEffect(() => {
        setFileName((prev) => {
            if (format === "csv") return csvFileName || prev;
            if (format === "excel") return excelFileName || prev;
            return pdfFileName || prev;
        });
    }, [format, csvFileName, excelFileName, pdfFileName]);

    const enabledFormats: Format[] = [];
    if (enableCsv) enabledFormats.push("csv");
    if (enableExcel) enabledFormats.push("excel");
    if (enablePdf) enabledFormats.push("pdf");

    if (enabledFormats.length === 0) return null;

    const submit = () => {
        const req: ExportRequest = {
            format,
            fileName: fileName || "export",
            allColumns,
            pageOrientation: pdfOrientation,
            title: pdfTitle
        };
        onExportRequest(req);
        setOpen(false);
    };

    return (
        <div className="aggrid-export-menu" ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                className="aggrid-export-btn"
                onClick={() => setOpen((s) => !s)}
                title="Export"
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V3h1z" />
                </svg>
                <span className="btn-text">Export</span>
            </button>

            {open && (
                <div className="export-popover" role="dialog" aria-label="Export options">
                    <div className="export-section">
                        <label className="toolbar-label">Format</label>
                        <div className="export-formats">
                            {enabledFormats.map((f) => (
                                <label key={f} className="export-format-option">
                                    <input
                                        type="radio"
                                        name="export-format"
                                        value={f}
                                        checked={format === f}
                                        onChange={() => setFormat(f)}
                                    />
                                    <span style={{ textTransform: "uppercase", marginLeft: 6 }}>
                                        {f}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="export-section">
                        <label className="toolbar-label" htmlFor="export-filename">
                            File name
                        </label>
                        <input
                            id="export-filename"
                            type="text"
                            className="toolbar-input"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                    </div>

                    <div className="export-section">
                        <label className="export-option">
                            <input
                                type="checkbox"
                                checked={allColumns}
                                onChange={(e) => setAllColumns(e.target.checked)}
                            />
                            <span style={{ marginLeft: 6 }}>Export all columns</span>
                        </label>
                    </div>

                    {format === "pdf" && (
                        <>
                            <div className="export-section">
                                <label className="toolbar-label">Page orientation</label>
                                <select
                                    value={pdfOrientation}
                                    onChange={(e) => setPdfOrientation(e.target.value as any)}
                                >
                                    <option value="landscape">Landscape</option>
                                    <option value="portrait">Portrait</option>
                                </select>
                            </div>
                            <div className="export-section">
                                <label className="toolbar-label">Title (optional)</label>
                                <input
                                    type="text"
                                    className="toolbar-input"
                                    value={pdfTitle}
                                    onChange={(e) => setPdfTitle(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="export-actions">
                        <button
                            type="button"
                            className="toolbar-button"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>
                        <button type="button" className="toolbar-button primary" onClick={submit}>
                            Export
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportMenu;
