import { ChangeEvent, ReactElement } from "react";

type ViewMode = "grid" | "cards" | "list" | "harden";

interface ViewSelectorProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    groupId: string;
    hasCardTemplate: boolean;
    hasListTemplate: boolean;
}

export function ViewSelector(props: ViewSelectorProps): ReactElement {
    const { currentView, onViewChange, groupId, hasCardTemplate, hasListTemplate } = props;
    // Sanitize groupId to be a valid CSS selector by replacing colons with hyphens
    const baseId = (groupId || "aggrid-view").replace(/:/g, "-");

    const handleViewChange = (event: ChangeEvent<HTMLInputElement>) => {
        onViewChange(event.target.value as ViewMode);
    };

    return (
        <fieldset className="aggrid-view-selector">
            <legend className="view-selector-legend">Views:</legend>
            <div className="view-toggle">
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
                />

                {hasCardTemplate && (
                    <>
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
                        />
                    </>
                )}

                {hasListTemplate && (
                    <>
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
                        />
                    </>
                )}
            </div>
        </fieldset>
    );
}
