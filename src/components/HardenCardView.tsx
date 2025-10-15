import { ReactElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";

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
            action.execute();
        }
    };

    const getValue = (item: any, attrId: string): string => {
        const col = columns.find((c) => c.attribute?.id === attrId);
        if (!col || !col.attribute) return `{{${attrId}}}`;
        const value = col.attribute.get(item);
        if (value.status !== ValueStatus.Available) return `{{${attrId}}}`;
        return String(value.value ?? `{{${attrId}}}`);
    };

    return (
        <div>
            {rowData.map((item, idx) => (
                <div key={idx} style={{ height: "auto" }}>
                    <div style={{ display: "contents !important" }}>
                        <div className="sr-list-item form-horizontal form-horizontal">
                            <div style={{ height: "auto" }}>
                                <div className="sr-li-card">
                                    <div className="sr-card soarui">
                                        {/* Callout Section */}
                                        <div
                                            className="sr-callout callouttype-null"
                                            style={{ backgroundColor: "rgb(168, 59, 54)" }}
                                        >
                                            <div className="sr-callout-preview">
                                                <div className="sr-callout-icon">
                                                    <span
                                                        className="widget-soarcustomspan fas fa-xmark"
                                                        style={{ color: "rgb(255, 255, 255)" }}
                                                    ></span>
                                                    <script></script>
                                                </div>
                                            </div>
                                            <div className="sr-callout-full">
                                                <span className="sr-callout-title">Status</span>
                                                <span className="sr-callout-value">
                                                    {getValue(item, "Status")}
                                                </span>
                                                <span className="sr-callout-title">
                                                    Date Submitted
                                                </span>
                                                <span className="sr-callout-value">
                                                    {getValue(item, "DateSubmitted")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Container */}
                                        <div className="sr-card-container sr-li-selectable">
                                            {/* Main Blocker */}
                                            <span className="sr-card-callout-shield"></span>
                                            <div
                                                className="sr-card-main"
                                                tabIndex={0}
                                                role="button"
                                                onClick={() => handleCardClick(item)}
                                            >
                                                {/* Card Header */}
                                                <div className="sr-card-header">
                                                    <span className="sr-card-header-primary">
                                                        {getValue(item, "VRN")}
                                                    </span>
                                                    <span className="sr-card-header-secondary">
                                                        {getValue(item, "Date")}
                                                    </span>
                                                </div>

                                                {/* Top Banner */}
                                                <div className="sr-card-top-banner">
                                                    <span>Contact Security</span>
                                                </div>

                                                {/* Focus Section */}
                                                <div className="sr-card-focus">
                                                    <div className="sr-card-focus-cell-full sr-py-1">
                                                        <span className="sr-card-label">
                                                            Category
                                                        </span>
                                                        <span className="sr-card-value">
                                                            {getValue(item, "Category")}
                                                        </span>
                                                    </div>
                                                    <div className="sr-card-focus-cell-full sr-py-1">
                                                        <span className="sr-card-label">
                                                            Reason for Visit
                                                        </span>
                                                        <span className="sr-card-value">
                                                            {getValue(item, "ReasonForVisit")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="sr-card-body">
                                                    <div className="sr-card-body-cell-full">
                                                        <div>
                                                            <span className="sr-card-label">
                                                                Point of Contact
                                                            </span>
                                                            <div>
                                                                <div className="value-container sr-tooltip row-left">
                                                                    <span className="value-icon fas fa-user">
                                                                        &nbsp;
                                                                    </span>
                                                                    <span className="sr-card-value">
                                                                        {getValue(
                                                                            item,
                                                                            "PointOfContact"
                                                                        )}
                                                                    </span>
                                                                    <div className="sr-tip-t row-right">
                                                                        <span>
                                                                            Point of Contact
                                                                        </span>
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
                                                                        {getValue(
                                                                            item,
                                                                            "OfficePhone"
                                                                        )}
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
                                                                        {getValue(
                                                                            item,
                                                                            "MobilePhone"
                                                                        )}
                                                                    </span>
                                                                    <div className="sr-tip-t">
                                                                        <span>Mobile Phone</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="sr-card-body-cell-full clip-cell sr-tooltip relative">
                                                        <span className="sr-card-label">
                                                            Organization
                                                        </span>
                                                        <span className="sr-card-value">
                                                            {getValue(item, "Organization")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="sr-card-footer">
                                                <div className="sr-card-footer-actions">
                                                    <button
                                                        type="button"
                                                        className="btn sr-card-footer-btn btn-primary-inverse fas fa-pen-to-square hide-phone hide-tablet hide-desktop btn-default"
                                                        title=""
                                                        data-button-id="10.VisitRequests.VisitRequestCard_Footer.actionButton2"
                                                        data-disabled="false"
                                                    >
                                                        {" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn sr-card-footer-btn btn-primary-inverse fas fa-comment hide-phone hide-tablet hide-desktop btn-default"
                                                        title=""
                                                        data-button-id="10.VisitRequests.VisitRequestCard_Footer.actionButton3"
                                                        data-disabled="false"
                                                    >
                                                        {" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn sr-card-footer-btn btn-primary-inverse fas fa-eye btn-default"
                                                        title="View Visit Request"
                                                        data-disabled="false"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
