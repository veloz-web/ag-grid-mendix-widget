// src/components/PaginationBar.tsx
import { ReactElement, useCallback, useEffect, useState } from "react";
import type { GridApi } from "ag-grid-community";

export interface PaginationBarProps {
    /** AG Grid API instance — null until grid is ready */
    gridApi: GridApi | null;
    /** When true, this bar is decorative (the real one lives at the bottom) */
    ariaHidden?: boolean;
}

interface PaginationState {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalRows: number;
    /** First row index shown (1-based for display) */
    firstRow: number;
    /** Last row index shown (1-based for display) */
    lastRow: number;
}

/**
 * Custom pagination bar that syncs with AG Grid's pagination API.
 * Renders first/prev/next/last buttons and a "Showing X–Y of Z" label.
 *
 * When `ariaHidden` is true (used in "both" mode for the top bar),
 * screen readers skip this duplicate control and only interact with
 * AG Grid's built-in pagination at the bottom.
 */
export function PaginationBar({
    gridApi,
    ariaHidden = false
}: PaginationBarProps): ReactElement | null {
    const [state, setState] = useState<PaginationState>({
        currentPage: 0,
        totalPages: 0,
        pageSize: 0,
        totalRows: 0,
        firstRow: 0,
        lastRow: 0
    });

    // Compute display state from the grid API
    const syncState = useCallback(() => {
        if (!gridApi) return;
        const currentPage = gridApi.paginationGetCurrentPage();
        const totalPages = gridApi.paginationGetTotalPages();
        const pageSize = gridApi.paginationGetPageSize();
        const totalRows = gridApi.paginationGetRowCount();
        const firstRow = currentPage * pageSize + 1;
        const lastRow = Math.min((currentPage + 1) * pageSize, totalRows);

        setState({ currentPage, totalPages, pageSize, totalRows, firstRow, lastRow });
    }, [gridApi]);

    // Listen for pagination changes from the grid
    useEffect(() => {
        if (!gridApi) return;

        // Initial sync
        syncState();

        // AG Grid fires this event on any pagination state change
        const handler = () => syncState();
        gridApi.addEventListener("paginationChanged", handler);

        return () => {
            try {
                gridApi.removeEventListener("paginationChanged", handler);
            } catch {
                // Grid may have been destroyed
            }
        };
    }, [gridApi, syncState]);

    if (!gridApi || state.totalPages === 0) {
        return null;
    }

    const { currentPage, totalPages, totalRows, firstRow, lastRow } = state;
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage >= totalPages - 1;

    const goFirst = () => gridApi.paginationGoToFirstPage();
    const goPrev = () => gridApi.paginationGoToPreviousPage();
    const goNext = () => gridApi.paginationGoToNextPage();
    const goLast = () => gridApi.paginationGoToLastPage();

    return (
        <div
            className="ag-custom-pagination-bar"
            role="navigation"
            aria-label="Pagination"
            aria-hidden={ariaHidden || undefined}
            tabIndex={ariaHidden ? -1 : undefined}
        >
            <span className="ag-custom-pagination-info">
                {totalRows > 0 ? `${firstRow}–${lastRow} of ${totalRows}` : "No rows"}
            </span>

            <div className="ag-custom-pagination-buttons">
                <button
                    className="ag-custom-pagination-btn"
                    onClick={goFirst}
                    disabled={isFirstPage}
                    aria-label="First page"
                    tabIndex={ariaHidden ? -1 : 0}
                    title="First page"
                >
                    ⟨⟨
                </button>
                <button
                    className="ag-custom-pagination-btn"
                    onClick={goPrev}
                    disabled={isFirstPage}
                    aria-label="Previous page"
                    tabIndex={ariaHidden ? -1 : 0}
                    title="Previous page"
                >
                    ⟨
                </button>

                <span className="ag-custom-pagination-page">
                    Page {currentPage + 1} of {totalPages}
                </span>

                <button
                    className="ag-custom-pagination-btn"
                    onClick={goNext}
                    disabled={isLastPage}
                    aria-label="Next page"
                    tabIndex={ariaHidden ? -1 : 0}
                    title="Next page"
                >
                    ⟩
                </button>
                <button
                    className="ag-custom-pagination-btn"
                    onClick={goLast}
                    disabled={isLastPage}
                    aria-label="Last page"
                    tabIndex={ariaHidden ? -1 : 0}
                    title="Last page"
                >
                    ⟩⟩
                </button>
            </div>
        </div>
    );
}
