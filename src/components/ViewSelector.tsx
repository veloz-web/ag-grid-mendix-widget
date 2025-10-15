import { ChangeEvent, ReactElement } from "react";

type ViewMode = "grid" | "cards" | "list" | "harden" | "hardenlist";

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
            <legend className="view-selector-legend">Views:</legend>
            <div className="view-toggle">
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
                    className="view-label fas fa-credit-card"
                    title="Card View"
                ></label>

                <input
                    type="radio"
                    id={`${baseId}-harden`}
                    name={baseId}
                    value="harden"
                    checked={currentView === "harden"}
                    onChange={handleViewChange}
                    className="view-radio-input"
                />
                <label
                    htmlFor={`${baseId}-harden`}
                    className="view-label fas fa-grid"
                    title="Harden Card View"
                ></label>

                <input
                    type="radio"
                    id={`${baseId}-hardenlist`}
                    name={baseId}
                    value="hardenlist"
                    checked={currentView === "hardenlist"}
                    onChange={handleViewChange}
                    className="view-radio-input"
                />
                <label
                    htmlFor={`${baseId}-hardenlist`}

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
