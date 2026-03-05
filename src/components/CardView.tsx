import { ReactElement, createElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";
import { formatCardFieldValue, evaluateTemplate } from "../utils/renderers";

interface DynamicViewProps {
    rowData: any[];
    columns: ColumnsType[];
    onRowClick?: any;
    onRowDoubleClick?: any;
}

export function DynamicView(props: DynamicViewProps): ReactElement {
    const { rowData, columns, onRowClick, onRowDoubleClick } = props;
    // Card view now uses templates - just filter out hidden columns
    const cardColumns = columns.filter((col) => !col.hidden);

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

    const handleCardDoubleClick = (item: any) => {
        if (!onRowDoubleClick) {
            return;
        }

        const action = onRowDoubleClick.get(item);

        if (action && action.canExecute) {
            setTimeout(() => {
                action.execute();
            }, 0);
        }
    };

    return (
        <div className="aggrid-cards-view">
            {rowData.map((item, idx) => {
                // Filter columns to only include those with available values for this item
                const availableColumns = cardColumns.filter((col) => {
                    if (col.template) {
                        return true; // Templates are always available
                    }
                    const value = col.attribute?.get(item);
                    return value && value.status === ValueStatus.Available;
                });

                return (
                    <div
                        key={item.id ?? idx}
                        className="aggrid-card"
                        onClick={() => handleCardClick(item)}
                        onDoubleClick={() => handleCardDoubleClick(item)}
                    >
                        {availableColumns.map((col, colIdx) => {
                            let rawValue: any;
                            let attributeType: string;

                            if (col.template) {
                                rawValue = evaluateTemplate(col.template, item, columns);
                                attributeType = "String"; // Templates are always strings
                            } else {
                                const value = col.attribute?.get(item);
                                // We already filtered for available values, so this should always be available
                                rawValue = value!.value;
                                attributeType = col.attribute?.type || "String";
                            }

                            let isHtml = false;

                            const formatResult = formatCardFieldValue(
                                col,
                                rawValue,
                                attributeType as any,
                                item,
                                columns
                            );
                            const formattedValue: string | ReactElement =
                                formatResult.formattedValue;
                            isHtml = formatResult.isHtml;

                            return (
                                // eslint-disable-next-line react/no-array-index-key
                                <div key={colIdx} className="card-field">
                                    <span className="card-label">{col.header?.value}:</span>
                                    <span className="card-value">
                                        {typeof formattedValue === "string" && isHtml
                                            ? createElement("span", {
                                                  dangerouslySetInnerHTML: {
                                                      __html: formattedValue
                                                  }
                                              })
                                            : formattedValue}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
            {rowData.length === 0 && <div className="no-data">No records found</div>}
        </div>
    );
}
