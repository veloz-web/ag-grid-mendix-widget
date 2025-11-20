import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ViewSelector } from "../ViewSelector";

describe("ViewSelector", () => {
    const renderSelector = (overrideProps: Partial<Parameters<typeof ViewSelector>[0]> = {}) => {
        const onViewChange = jest.fn();
        const props = {
            currentView: "grid" as const,
            onViewChange,
            groupId: "aggrid:view",
            hasCardTemplate: true,
            hasListTemplate: true,
            ...overrideProps
        } as Parameters<typeof ViewSelector>[0];

        const utils = render(<ViewSelector {...props} />);
        return { onViewChange, ...utils };
    };

    it("renders grid/card/list radio options when templates are available", () => {
        const { container } = render(
            <ViewSelector
                currentView="grid"
                onViewChange={jest.fn()}
                groupId="widget"
                hasCardTemplate
                hasListTemplate
            />
        );

        expect(container.querySelector("input[value='grid']")).toBeChecked();
        expect(container.querySelector("input[value='cards']")).toBeInTheDocument();
        expect(container.querySelector("input[value='list']")).toBeInTheDocument();
    });

    it("omits card toggle when hasCardTemplate is false", () => {
        const { container } = renderSelector({ hasCardTemplate: false });
        expect(container.querySelector("input[value='cards']")).not.toBeInTheDocument();
    });

    it("omits list toggle when hasListTemplate is false", () => {
        const { container } = renderSelector({ hasListTemplate: false });
        expect(container.querySelector("input[value='list']")).not.toBeInTheDocument();
    });

    it("fires onViewChange when a different view is selected", () => {
        const { onViewChange } = renderSelector({ currentView: "grid" });

        fireEvent.click(screen.getByDisplayValue("cards"));
        expect(onViewChange).toHaveBeenCalledWith("cards");
    });

    it("sanitizes groupId so generated ids are valid", () => {
        const { container } = renderSelector({ groupId: "orders:view" });
        expect(container.querySelector("#orders-view-grid")).toBeInTheDocument();
    });
});
