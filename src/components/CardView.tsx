import { ReactElement, createElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";

interface CardViewProps {
    rowData: any[];
    columns: ColumnsType[];
    onRowClick?: any;
    renderStatusBadge: (value: any, mappingString: string | undefined) => string;
    renderLink: (
        value: any,
        urlPattern: string | undefined,
        linkText: string | undefined
    ) => string;
    applyFormatter: (
        value: any,
        formatter: string,
        attributeType: string,
        customPrefix?: string,
        customSuffix?: string
    ) => string;
}

export function CardView(props: CardViewProps): ReactElement {
    const { rowData, columns, onRowClick, renderStatusBadge, renderLink, applyFormatter } = props;
    const cardColumns = columns.filter((col) => col.includeInCardView);

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

    return (
        <div className="aggrid-cards-view">
            {rowData.map((item, idx) => (
                <div key={idx} className="aggrid-card" onClick={() => handleCardClick(item)}>
                    {cardColumns.map((col, colIdx) => {
                        const value = col.attribute?.get(item);
                        if (!value || value.status !== ValueStatus.Available) return null;

                        let formattedValue: string | ReactElement;
                        let isHtml = false;

                        if (col.formatter === "statusBadge") {
                            formattedValue = renderStatusBadge(value.value, col.statusMapping);
                            isHtml = true;
                        } else if (col.formatter === "link") {
                            // If there's a linkAction, use that (proper Mendix navigation)
                            if (col.linkAction && col.linkAction.canExecute) {
                                formattedValue = createElement("button", {
                                    className: "fas fa-eye aggrid-link-action",
                                    onClick: (e: any) => {
                                        e.stopPropagation();
                                        col.linkAction!.execute();
                                    },
                                    style: {
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        color: "#1976d2",
                                        fontSize: "16px"
                                    }
                                });
                            } else {
                                // Fallback to legacy URL pattern
                                formattedValue = renderLink(
                                    value.value,
                                    col.linkUrlPattern,
                                    col.linkText
                                );
                                isHtml = true;
                            }
                        } else {
                            formattedValue = applyFormatter(
                                value.value,
                                col.formatter || "none",
                                col.attribute?.type || "String",
                                col.customPrefix,
                                col.customSuffix
                            );
                        }

                        return (
                            <div key={colIdx} className="card-field">
                                <span className="card-label">{col.header?.value}:</span>
                                <span className="card-value">
                                    {typeof formattedValue === "string" && isHtml
                                        ? createElement("span", {
                                              dangerouslySetInnerHTML: { __html: formattedValue }
                                          })
                                        : formattedValue}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ))}
            {rowData.length === 0 && <div className="no-data">No records found</div>}
        </div>
    );
}
