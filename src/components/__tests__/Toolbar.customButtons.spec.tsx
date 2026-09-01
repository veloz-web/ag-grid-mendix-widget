import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Toolbar, ToolbarProps, CustomToolbarButton } from "../Toolbar";

// Mock ViewSelector since it's not relevant to these tests
jest.mock("../ViewSelector", () => ({
    ViewSelector: () => <div data-testid="view-selector" />
}));

jest.mock("../MultiSelectFilter", () => ({
    MultiSelectFilter: () => <div data-testid="multi-select-filter" />
}));

// Minimal ExportMenu mock
jest.mock("../ExportMenu", () => ({
    __esModule: true,
    default: () => <div data-testid="export-menu" />
}));

const baseProps: ToolbarProps = {
    enableViewSelector: false,
    currentView: "grid",
    storageKey: "test-grid",
    onViewChange: jest.fn(),
    hasCardTemplate: false,
    hasListTemplate: false,
    toolbarFilters: [],
    onToolbarFilterChange: jest.fn(),
    enableToolbarFilterSearch: false,
    showSortControls: false,
    hasSortApplied: false,
    currentSortColumnId: "",
    currentSortDirection: "asc",
    sortableColumns: [],
    onSortChange: jest.fn(),
    onSortDirectionChange: jest.fn(),
    showToolbarSearch: false,
    globalSearch: "",
    onSearchChange: jest.fn(),
    onClearSearch: jest.fn(),
    onResetToolbarFilters: jest.fn(),
    enableFilterDrawer: false,
    isFilterDrawerOpen: false,
    activeFilterCount: 0,
    filterButtonRef: React.createRef(),
    onToggleFilterDrawer: jest.fn(),
    isColumnVisibilityOpen: false,
    onToggleColumnVisibility: jest.fn(),
    enableCsvExport: false,
    onCsvExport: jest.fn(),
    enablePdfExport: false,
    onPdfExport: jest.fn(),
    enableRowDelete: false,
    showDeleteInToolbar: false,
    deleteButtonLabel: "Delete",
    deleteDisabled: false,
    enableRowAdd: false,
    showAddInToolbar: false,
    addButtonLabel: "Add",
    customButtons: []
};

const createButton = (overrides: Partial<CustomToolbarButton> = {}): CustomToolbarButton => ({
    buttonLabel: "Test Button",
    buttonStyle: "default",
    buttonIcon: "none",
    buttonPosition: "right",
    buttonVisible: true,
    buttonDisabled: false,
    onAction: jest.fn(),
    ...overrides
});

describe("Toolbar - Custom Buttons", () => {
    describe("Rendering", () => {
        it("renders no custom buttons when customButtons is empty", () => {
            render(<Toolbar {...baseProps} customButtons={[]} />);

            const customBtns = document.querySelectorAll(".aggrid-custom-btn");
            expect(customBtns).toHaveLength(0);
        });

        it("renders no custom buttons when customButtons is undefined", () => {
            render(<Toolbar {...baseProps} customButtons={undefined} />);

            const customBtns = document.querySelectorAll(".aggrid-custom-btn");
            expect(customBtns).toHaveLength(0);
        });

        it("renders a single custom button with correct label", () => {
            const btn = createButton({ buttonLabel: "Export PDF" });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
            expect(screen.getByText("Export PDF")).toBeInTheDocument();
        });

        it("renders multiple custom buttons", () => {
            const buttons = [
                createButton({ buttonLabel: "Approve" }),
                createButton({ buttonLabel: "Reject" }),
                createButton({ buttonLabel: "Archive" })
            ];
            render(<Toolbar {...baseProps} customButtons={buttons} />);

            expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
        });
    });

    describe("Positioning", () => {
        it("renders left-positioned buttons in the toolbar-left section", () => {
            const btn = createButton({ buttonLabel: "Left Action", buttonPosition: "left" });
            const { container } = render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const leftSection = container.querySelector(".aggrid-toolbar-left");
            const rightSection = container.querySelector(".aggrid-toolbar-right");

            expect(leftSection?.querySelector("[aria-label='Left Action']")).toBeInTheDocument();
            expect(
                rightSection?.querySelector("[aria-label='Left Action']")
            ).not.toBeInTheDocument();
        });

        it("renders right-positioned buttons in the toolbar-right section", () => {
            const btn = createButton({ buttonLabel: "Right Action", buttonPosition: "right" });
            const { container } = render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const leftSection = container.querySelector(".aggrid-toolbar-left");
            const rightSection = container.querySelector(".aggrid-toolbar-right");

            expect(rightSection?.querySelector("[aria-label='Right Action']")).toBeInTheDocument();
            expect(
                leftSection?.querySelector("[aria-label='Right Action']")
            ).not.toBeInTheDocument();
        });

        it("renders buttons in both positions simultaneously", () => {
            const buttons = [
                createButton({ buttonLabel: "Left Btn", buttonPosition: "left" }),
                createButton({ buttonLabel: "Right Btn", buttonPosition: "right" })
            ];
            const { container } = render(<Toolbar {...baseProps} customButtons={buttons} />);

            const leftSection = container.querySelector(".aggrid-toolbar-left");
            const rightSection = container.querySelector(".aggrid-toolbar-right");

            expect(leftSection?.querySelector("[aria-label='Left Btn']")).toBeInTheDocument();
            expect(rightSection?.querySelector("[aria-label='Right Btn']")).toBeInTheDocument();
        });
    });

    describe("Styles", () => {
        const styles: Array<{ style: CustomToolbarButton["buttonStyle"]; cssClass: string }> = [
            { style: "default", cssClass: "aggrid-custom-btn-default" },
            { style: "primary", cssClass: "aggrid-custom-btn-primary" },
            { style: "success", cssClass: "aggrid-custom-btn-success" },
            { style: "danger", cssClass: "aggrid-custom-btn-danger" },
            { style: "warning", cssClass: "aggrid-custom-btn-warning" },
            { style: "info", cssClass: "aggrid-custom-btn-info" }
        ];

        it.each(styles)("applies $cssClass for $style style", ({ style, cssClass }) => {
            const btn = createButton({ buttonLabel: `${style} btn`, buttonStyle: style });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: `${style} btn` });
            expect(button).toHaveClass("aggrid-custom-btn", cssClass);
        });
    });

    describe("Icons", () => {
        it("renders no icon when buttonIcon is 'none'", () => {
            const btn = createButton({ buttonLabel: "No Icon", buttonIcon: "none" });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: "No Icon" });
            expect(button.querySelector("svg")).not.toBeInTheDocument();
        });

        const iconsWithSvg: Array<CustomToolbarButton["buttonIcon"]> = [
            "plus",
            "edit",
            "trash",
            "refresh",
            "download",
            "upload",
            "check",
            "close",
            "search",
            "settings",
            "link",
            "copy",
            "save",
            "mail",
            "print"
        ];

        it.each(iconsWithSvg)("renders an SVG icon for '%s'", (icon) => {
            const btn = createButton({ buttonLabel: `Icon ${icon}`, buttonIcon: icon });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: `Icon ${icon}` });
            const svg = button.querySelector("svg");
            expect(svg).toBeInTheDocument();
            expect(svg).toHaveAttribute("aria-hidden", "true");
        });
    });

    describe("Visibility", () => {
        it("does not render buttons with buttonVisible=false", () => {
            const btn = createButton({ buttonLabel: "Hidden", buttonVisible: false });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            expect(screen.queryByRole("button", { name: "Hidden" })).not.toBeInTheDocument();
        });

        it("renders buttons with buttonVisible=true", () => {
            const btn = createButton({ buttonLabel: "Shown", buttonVisible: true });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            expect(screen.getByRole("button", { name: "Shown" })).toBeInTheDocument();
        });

        it("filters out hidden buttons and renders visible ones", () => {
            const buttons = [
                createButton({ buttonLabel: "Visible One", buttonVisible: true }),
                createButton({ buttonLabel: "Hidden One", buttonVisible: false }),
                createButton({ buttonLabel: "Visible Two", buttonVisible: true })
            ];
            render(<Toolbar {...baseProps} customButtons={buttons} />);

            expect(screen.getByRole("button", { name: "Visible One" })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Hidden One" })).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Visible Two" })).toBeInTheDocument();
        });
    });

    describe("Disabled state", () => {
        it("disables button when buttonDisabled is true", () => {
            const btn = createButton({ buttonLabel: "Disabled Btn", buttonDisabled: true });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: "Disabled Btn" });
            expect(button).toBeDisabled();
        });

        it("enables button when buttonDisabled is false", () => {
            const btn = createButton({ buttonLabel: "Enabled Btn", buttonDisabled: false });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: "Enabled Btn" });
            expect(button).not.toBeDisabled();
        });
    });

    describe("Click actions", () => {
        it("calls onAction when button is clicked", async () => {
            const user = userEvent.setup();
            const onAction = jest.fn();
            const btn = createButton({ buttonLabel: "Click Me", onAction });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            await user.click(screen.getByRole("button", { name: "Click Me" }));

            expect(onAction).toHaveBeenCalledTimes(1);
        });

        it("does not call onAction when disabled button is clicked", async () => {
            const user = userEvent.setup();
            const onAction = jest.fn();
            const btn = createButton({ buttonLabel: "Disabled", buttonDisabled: true, onAction });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            await user.click(screen.getByRole("button", { name: "Disabled" }));

            expect(onAction).not.toHaveBeenCalled();
        });

        it("calls correct onAction for each button independently", async () => {
            const user = userEvent.setup();
            const onAction1 = jest.fn();
            const onAction2 = jest.fn();
            const buttons = [
                createButton({ buttonLabel: "Action A", onAction: onAction1 }),
                createButton({ buttonLabel: "Action B", onAction: onAction2 })
            ];
            render(<Toolbar {...baseProps} customButtons={buttons} />);

            await user.click(screen.getByRole("button", { name: "Action A" }));

            expect(onAction1).toHaveBeenCalledTimes(1);
            expect(onAction2).not.toHaveBeenCalled();

            await user.click(screen.getByRole("button", { name: "Action B" }));

            expect(onAction2).toHaveBeenCalledTimes(1);
        });
    });

    describe("Accessibility", () => {
        it("sets aria-label to the button label", () => {
            const btn = createButton({ buttonLabel: "Approve Request" });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: "Approve Request" });
            expect(button).toHaveAttribute("aria-label", "Approve Request");
        });

        it("sets title to the button label", () => {
            const btn = createButton({ buttonLabel: "Send Email" });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: "Send Email" });
            expect(button).toHaveAttribute("title", "Send Email");
        });

        it("uses type='button' to prevent form submission", () => {
            const btn = createButton({ buttonLabel: "Submit" });
            render(<Toolbar {...baseProps} customButtons={[btn]} />);

            const button = screen.getByRole("button", { name: "Submit" });
            expect(button).toHaveAttribute("type", "button");
        });
    });

    describe("Coexistence with built-in buttons", () => {
        it("renders custom buttons alongside the add button", () => {
            const btn = createButton({ buttonLabel: "Custom Action" });
            render(
                <Toolbar
                    {...baseProps}
                    enableRowAdd={true}
                    showAddInToolbar={true}
                    addButtonLabel="Add"
                    onAddRow={jest.fn()}
                    customButtons={[btn]}
                />
            );

            expect(screen.getByRole("button", { name: "Custom Action" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /add new row/i })).toBeInTheDocument();
        });

        it("renders custom buttons alongside the delete button", () => {
            const btn = createButton({ buttonLabel: "Custom Action" });
            render(
                <Toolbar
                    {...baseProps}
                    enableRowDelete={true}
                    showDeleteInToolbar={true}
                    deleteButtonLabel="Delete"
                    onDeleteRows={jest.fn()}
                    customButtons={[btn]}
                />
            );

            expect(screen.getByRole("button", { name: "Custom Action" })).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /delete selected rows/i })
            ).toBeInTheDocument();
        });
    });
});
