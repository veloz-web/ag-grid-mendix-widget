import { ReactElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../../typings/AGGridProps";
import { applyFormatter } from "../../utils/formatters";

interface ListViewProps {
    rowData: any[];
    columns: ColumnsType[];
    onRowClick?: any;
}

export function ListView(props: ListViewProps): ReactElement {
    const { rowData, columns, onRowClick } = props;

    const handleListClick = (item: any) => {
        if (!onRowClick) {
            return;
        }

        // For ListActionValue, get the action for the specific item
        const action = onRowClick.get(item);

        // Check if the action can be executed and execute it
        if (action && action.canExecute) {
            // Defer execution to next tick for React-only mode compatibility
            setTimeout(() => {
                action.execute();
            }, 0);
        }
    };

    // Get status class name from column's status mapping configuration
    const getStatusClassName = (status: string): string => {
        // Find the Status column
        const statusCol = columns.find((c) => c.header?.value === "Status");

        if (!statusCol || !statusCol.statusMapping) {
            return "";
        }

        try {
            const mappings = JSON.parse(statusCol.statusMapping);
            if (!Array.isArray(mappings)) {
                return "";
            }

            // Find matching mapping
            const mapping = mappings.find((m: any) => {
                if (m.value === undefined || m.value === null) return false;

                // Try exact match first
                if (m.value === status) return true;

                // Try string comparison
                if (String(m.value) === String(status)) return true;

                return false;
            });

            return mapping?.className || "";
        } catch (e) {
            console.error("Error parsing status mapping:", e);
            return "";
        }
    };

    const getValue = (item: any, headerName: string): string => {
        // Find column by header name instead of attribute ID
        const col = columns.find((c) => c.header?.value === headerName);

        if (!col || !col.attribute) return `{{${headerName}}}`;

        const value = col.attribute.get(item);
        if (value.status !== ValueStatus.Available) return `{{${headerName}}}`;

        const rawValue = value.value ?? `{{${headerName}}}`;

        // Apply date formatting for date fields
        if (headerName.toLowerCase().includes("submitted") && applyFormatter) {
            return applyFormatter(rawValue, "dateMDY", (col.attribute.type || "DateTime") as any);
        }

        return String(rawValue);
    };

    return (
        <div className="aggrid-list-view">
            {rowData.map((item, idx) => (
                <div key={idx} className="sr-list-item form-horizontal form-horizontal">
                    <div
                        className="sr-long sr-li-selectable"
                        tabIndex={0}
                        role="button"
                        onClick={() => handleListClick(item)}
                    >
                        {/* Callout Section */}
                        <div className="sr-long-header">
                            <div
                                className={`sr-callout-simple callouttype-null ${getStatusClassName(
                                    getValue(item, "Status")
                                )}`}
                            >
                                <div className="sr-callout-grow">
                                    <div
                                        className={`sr-callout-preview ${getStatusClassName(
                                            getValue(item, "Status")
                                        )}`}
                                    />
                                    <div className="sr-callout-full">
                                        <span>{getValue(item, "Status")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Header Title */}
                            <div className="sr-long-header-title">
                                <span className="sr-long-header-primary">
                                    {getValue(item, "Form #")}
                                </span>
                            </div>

                            {/* Header Actions */}
                            <div className="sr-long-header-actions">
                                <div className="sr-list-actions-row">
                                    <button
                                        type="button"
                                        className="btn sr-list-action-btn btn-primary-inverse fas fa-eye btn-default"
                                        title="View Visit Request"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleListClick(item);
                                        }}
                                    >
                                        {" "}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn sr-list-action-btn btn-primary-inverse fas fa-comment hide-phone hide-tablet hide-desktop btn-default"
                                        title=""
                                    >
                                        {" "}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn sr-list-action-btn btn-primary-inverse fas fa-pen-to-square hide-phone hide-tablet hide-desktop btn-default"
                                        title=""
                                    >
                                        {" "}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Banners Section - conditionally show for denied status */}
                        {getValue(item, "Status").toLowerCase() === "denied" && (
                            <div className="sr-long-banners">
                                <div className="sr-banner-contact-security">
                                    <span>Contact Security</span>
                                </div>
                            </div>
                        )}

                        {/* Body Section */}
                        <div className="sr-long-body">
                            <div className="sr-long-body-cell focus-cell">
                                <span className="sr-long-body-label">Category</span>
                                <span className="sr-long-body-value">
                                    {getValue(item, "Category")}
                                </span>
                            </div>

                            <div
                                className="sr-long-body-cell focus-cell"
                                style={{ maxWidth: "33%" }}
                            >
                                <span className="sr-long-body-label">Reason for Visit</span>
                                <span className="sr-long-body-value">
                                    {getValue(item, "Purpose")}
                                </span>
                            </div>

                            <div className="sr-long-body-cell">
                                <span className="sr-long-body-label">Organization</span>
                                <span className="sr-long-body-value">
                                    {getValue(item, "Organization")}
                                </span>
                            </div>

                            <div className="sr-long-body-cell">
                                <span className="sr-long-body-label">Point of Contact</span>
                                <div>
                                    <div className="d-flex value-container sr-tooltip row-left">
                                        <span className="value-icon fas fa-user">&nbsp;</span>
                                        <span className="sr-long-body-value">
                                            {getValue(item, "Point of Contact")}
                                        </span>
                                        <div className="sr-tip-l">
                                            <span>Point of Contact</span>
                                        </div>
                                    </div>
                                    <div className="d-flex value-container sr-tooltip row-left">
                                        <span className="value-icon fas fa-envelope">&nbsp;</span>
                                        <span className="sr-long-body-value">
                                            {getValue(item, "Email")}
                                        </span>
                                        <div className="sr-tip-l">
                                            <span>Email</span>
                                        </div>
                                    </div>
                                    <div className="d-flex value-container sr-tooltip row-left">
                                        <span className="value-icon fas fa-phone-office">
                                            &nbsp;
                                        </span>
                                        <span className="sr-long-body-value">
                                            {getValue(item, "OfficePhone")}
                                        </span>
                                        <div className="sr-tip-l">
                                            <span>Office Phone</span>
                                        </div>
                                    </div>
                                    <div className="d-flex value-container sr-tooltip row-left">
                                        <span className="value-icon fas fa-mobile-screen">
                                            &nbsp;
                                        </span>
                                        <span className="sr-long-body-value">
                                            {getValue(item, "MobilePhone")}
                                        </span>
                                        <div className="sr-tip-l">
                                            <span>Mobile Phone</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sr-long-body-cell">
                                <span className="sr-long-body-label">Date Submitted</span>
                                <span className="sr-long-body-value">
                                    {getValue(item, "Submitted")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
