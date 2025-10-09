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
    const listColumns = columns.filter((col) => col.includeInCardView);

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

                const primaryValue = primaryCol?.attribute?.get(item);
                const secondaryValue = secondaryCol?.attribute?.get(item);

                const primary =
                    primaryValue?.status === ValueStatus.Available
                        ? applyFormatter(
                              primaryValue.value,
                              primaryCol.formatter || "none",
                              primaryCol.attribute?.type || "String",
                              primaryCol.customPrefix,
                              primaryCol.customSuffix
                          )
                        : "";

                const secondary =
                    secondaryValue?.status === ValueStatus.Available
                        ? applyFormatter(
                              secondaryValue.value,
                              secondaryCol?.formatter || "none",
                              secondaryCol?.attribute?.type || "String",
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
