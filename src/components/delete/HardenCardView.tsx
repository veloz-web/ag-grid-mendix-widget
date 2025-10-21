import { ReactElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../../typings/AGGridProps";
import { applyFormatter } from "../../utils/formatters";

interface HardenCardViewProps {
    rowData: any[];
    columns: ColumnsType[];
    onRowClick?: any;
}

export function HardenCardView(props: HardenCardViewProps): ReactElement {
    const { rowData, columns, onRowClick } = props;

    const handleCardClick = (item: any) => {
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
        console.info(columns);

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
        <div className="aggrid-hardened-cards-view">
            {rowData.map((item, idx) => (
                <div key={idx} className="sr-list-item form-horizontal form-horizontal">
                    <div className="sr-card soarui">
                        {/* Callout Section */}
                        <div
                            className={`sr-callout callouttype-null ${getStatusClassName(
                                getValue(item, "Status")
                            )}`}
                        >
                            <div className="sr-callout-preview">
                                <div className="sr-callout-icon">
                                    <span
                                        className={`"widget-soarcustomspan ${getStatusClassName(
                                            getValue(item, "Status")
                                        )}`}
                                    ></span>
                                </div>
                            </div>
                            <div className="sr-callout-full">
                                <span className="sr-callout-title">Status</span>
                                <span className="sr-callout-value">{getValue(item, "Status")}</span>
                                <span className="sr-callout-title">Date Submitted</span>
                                <span className="sr-callout-value">
                                    {getValue(item, "Submitted")}
                                </span>
                            </div>
                        </div>

                        {/* Card Container */}
                        <div className="sr-card-container sr-li-selectable">
                            {/* Main Blocker */}
                            <span className="sr-card-callout-shield"></span>
                            <div className="sr-card-main" onClick={() => handleCardClick(item)}>
                                {/* Card Header */}
                                <div className="sr-card-header">
                                    <span className="sr-card-header-primary">
                                        VRN {getValue(item, "Form #")}
                                    </span>
                                    <span className="sr-card-header-secondary">
                                        {getValue(item, "Submitted")}
                                    </span>
                                </div>

                                {/* Top Banner - Only show for Denied status */}
                                {getValue(item, "Status").toLowerCase() === "denied" && (
                                    <div className="sr-card-top-banner">
                                        <span>Contact Security</span>
                                    </div>
                                )}

                                {/* Focus Section */}
                                <div className="sr-card-focus">
                                    <div className="sr-card-focus-cell-full sr-py-1">
                                        <span className="sr-card-label">Category</span>
                                        <span className="sr-card-value">
                                            {getValue(item, "Category")}
                                        </span>
                                    </div>
                                    <div className="sr-card-focus-cell-full sr-py-1">
                                        <span className="sr-card-label">Reason for Visit</span>
                                        <span className="sr-card-value">
                                            {getValue(item, "Purpose")}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="sr-card-body">
                                    <div className="sr-card-body-cell-full">
                                        <div>
                                            <span className="sr-card-label">Point of Contact</span>
                                            <div>
                                                <div className="value-container sr-tooltip row-left">
                                                    <span className="value-icon fas fa-user">
                                                        &nbsp;
                                                    </span>
                                                    <span className="sr-card-value">
                                                        {getValue(item, "Point of Contact")}
                                                    </span>
                                                    <div className="sr-tip-t row-right">
                                                        <span>Point of Contact</span>
                                                    </div>
                                                </div>
                                                <div className="value-container sr-tooltip row-left">
                                                    <span className="value-icon fas fa-envelope">
                                                        &nbsp;
                                                    </span>
                                                    <span className="sr-card-value text-nowrap">
                                                        {getValue(item, "Email")}
                                                    </span>
                                                    <div className="sr-tip-t">
                                                        <span>Email</span>
                                                    </div>
                                                </div>
                                                <div className="value-container sr-tooltip row-left">
                                                    <span className="value-icon fas fa-phone-office">
                                                        &nbsp;
                                                    </span>
                                                    <span className="sr-card-value">
                                                        {getValue(item, "OfficePhone")}
                                                    </span>
                                                    <div className="sr-tip-t">
                                                        <span>Office Phone</span>
                                                    </div>
                                                </div>
                                                <div className="value-container sr-tooltip row-left">
                                                    <span className="value-icon fas fa-mobile-screen">
                                                        &nbsp;
                                                    </span>
                                                    <span className="sr-card-value">
                                                        {getValue(item, "MobilePhone")}
                                                    </span>
                                                    <div className="sr-tip-t">
                                                        <span>Mobile Phone</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sr-card-body-cell-full clip-cell sr-tooltip relative">
                                        <span className="sr-card-label">Organization</span>
                                        <span className="sr-card-value">
                                            {getValue(item, "Organization")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="sr-card-footer sr-card-footer-actions">
                                <button
                                    className="btn sr-card-footer-btn btn-primary-inverse fas fa-eye btn-default"
                                    onClick={() => handleCardClick(item)}
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
