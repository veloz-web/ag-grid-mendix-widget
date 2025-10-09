import { ChangeEvent, ReactElement } from "react";

type ViewMode = "grid" | "cards" | "list";

interface ViewSelectorProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    groupId: string;
}

export function ViewSelector(props: ViewSelectorProps): ReactElement {
    const { currentView, onViewChange, groupId } = props;
    const baseId = groupId || "aggrid-view";

    const handleViewChange = (event: ChangeEvent<HTMLInputElement>) => {
        onViewChange(event.target.value as ViewMode);
    };

    return (
        <fieldset className="aggrid-view-selector">
            <legend>Views: </legend>
            <div className="radio-group">
                <input
                    type="radio"
                    id={`${baseId}-cards`}
                    name={baseId}
                    value="cards"
                    checked={currentView === "cards"}
                    onChange={handleViewChange}
                    className="view-radio-input"
                />
                <label
                    htmlFor={`${baseId}-cards`}
                    className="view-label fas fa-grid"
                    title="Card View"
                ></label>

                <input
                    type="radio"
                    id={`${baseId}-list`}
                    name={baseId}
                    value="list"
                    checked={currentView === "list"}
                    onChange={handleViewChange}
                    className="view-radio-input"
                />
                <label
                    htmlFor={`${baseId}-list`}
                    className="view-label fas fa-list"
                    title="List View"
                ></label>

                <input
                    type="radio"
                    id={`${baseId}-grid`}
                    name={baseId}
                    value="grid"
                    checked={currentView === "grid"}
                    onChange={handleViewChange}
                    className="view-radio-input"
                />
                <label
                    htmlFor={`${baseId}-grid`}
                    className="view-label fas fa-table"
                    title="Grid View"
                ></label>
            </div>
        </fieldset>
    );
}
