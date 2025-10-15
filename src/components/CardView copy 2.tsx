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
    const cardColumns = columns.filter((col) => col.includeInCardView && !col.hidden);

    // Helper function to evaluate template strings
    const evaluateTemplate = (template: string, item: any, columns: ColumnsType[]): string => {
        return template.replace(/\$\{([^}]+)\}/g, (match, attrId) => {
            const col = columns.find((c) => c.attribute?.id === attrId);
            if (!col || !col.attribute) return match; // keep placeholder if not found
            const value = col.attribute.get(item);
            return value.status === ValueStatus.Available ? String(value.value ?? "") : "";
        });
    };

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
                        let rawValue: any;
                        let attributeType: string;

                        if (col.template) {
                            rawValue = evaluateTemplate(col.template, item, columns);
                            attributeType = "String"; // Templates are always strings
                        } else {
                            const value = col.attribute?.get(item);
                            if (!value || value.status !== ValueStatus.Available) return null;
                            rawValue = value.value;
                            attributeType = col.attribute?.type || "String";
                        }

                        let formattedValue: string | ReactElement;
                        let isHtml = false;

                        if (col.formatter === "statusBadge") {
                            formattedValue = renderStatusBadge(rawValue, col.statusMapping);
                            isHtml = true;
                        } else if (col.formatter === "link") {
                            // If there's a linkAction, use that (proper Mendix navigation)
                            if (col.linkAction) {
                                const action = col.linkAction.get(item);

                                if (action && action.canExecute) {
                                    const displayText = col.linkText
                                        ? col.linkText.replace(
                                              /\$\{value\}/g,
                                              String(rawValue ?? "")
                                          )
                                        : String(rawValue ?? "");

                                    formattedValue = createElement(
                                        "button",
                                        {
                                            type: "button",
                                            className: "aggrid-link-button",
                                            onClick: (e: any) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                action.execute();
                                            }
                                        },
                                        displayText ||
                                            createElement("span", { className: "fas fa-eye" })
                                    );
                                } else {
                                    formattedValue = renderLink(
                                        rawValue,
                                        col.linkUrlPattern,
                                        col.linkText
                                    );
                                    isHtml = true;
                                }
                            } else {
                                // Fallback to legacy URL pattern
                                formattedValue = renderLink(
                                    rawValue,
                                    col.linkUrlPattern,
                                    col.linkText
                                );
                                isHtml = true;
                            }
                        } else {
                            formattedValue = applyFormatter(
                                rawValue,
                                col.formatter || "none",
                                attributeType,
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
