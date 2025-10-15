import { ReactElement } from "react";
import { ValueStatus } from "mendix";
import { ColumnsType } from "../../typings/AGGridProps";

interface ListViewProps {
    rowData: any[];
    columns: ColumnsType[];
    onRowClick?: any;
    applyFormatter: (
        value: any,
        formatter: string,
        attributeType: string,
        customPrefix?: string,
        customSuffix?: string
    ) => string;
}

export function ListView(props: ListViewProps): ReactElement {
    const { rowData, columns, onRowClick, applyFormatter } = props;
    const listColumns = columns.filter((col) => col.includeInCardView && !col.hidden);

    // Helper function to evaluate template strings
    const evaluateTemplate = (template: string, item: any, columns: ColumnsType[]): string => {
        return template.replace(/\$\{([^}]+)\}/g, (match, attrId) => {
            const col = columns.find((c) => c.attribute?.id === attrId);
            if (!col || !col.attribute) return match; // keep placeholder if not found
            const value = col.attribute.get(item);
            return value.status === ValueStatus.Available ? String(value.value ?? "") : "";
        });
    };

    const handleItemClick = (item: any) => {
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
        <div className="aggrid-list-view">
            {rowData.map((item, idx) => {
                const primaryCol = listColumns[0];
                const secondaryCol = listColumns[1];

                let primaryValue: any;
                let primaryType: string;
                if (primaryCol?.template) {
                    primaryValue = evaluateTemplate(primaryCol.template, item, columns);
                    primaryType = "String";
                } else {
                    const val = primaryCol?.attribute?.get(item);
                    primaryValue = val?.status === ValueStatus.Available ? val.value : null;
                    primaryType = primaryCol?.attribute?.type || "String";
                }

                let secondaryValue: any;
                let secondaryType: string;
                if (secondaryCol?.template) {
                    secondaryValue = evaluateTemplate(secondaryCol.template, item, columns);
                    secondaryType = "String";
                } else {
                    const val = secondaryCol?.attribute?.get(item);
                    secondaryValue = val?.status === ValueStatus.Available ? val.value : null;
                    secondaryType = secondaryCol?.attribute?.type || "String";
                }

                const primary =
                    primaryValue != null
                        ? applyFormatter(
                              primaryValue,
                              primaryCol?.formatter || "none",
                              primaryType,
                              primaryCol?.customPrefix,
                              primaryCol?.customSuffix
                          )
                        : "";

                const secondary =
                    secondaryValue != null
                        ? applyFormatter(
                              secondaryValue,
                              secondaryCol?.formatter || "none",
                              secondaryType,
                              secondaryCol?.customPrefix,
                              secondaryCol?.customSuffix
                          )
                        : "";

                return (
                    <div
                        key={idx}
                        className="aggrid-list-item"
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="list-item-primary">{primary}</div>
                        {secondary && <div className="list-item-secondary">{secondary}</div>}
                    </div>
                );
            })}
            {rowData.length === 0 && <div className="no-data">No records found</div>}
        </div>
    );
}
