import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HiddenDrawer } from "../HiddenDrawer";

const createColumns = () =>
    [
        {
            attribute: { id: "revenue" },
            header: { value: "Revenue" }
        },
        {
            attribute: { id: "status" },
            header: { value: "Status" }
        }
    ] as any;

describe("HiddenDrawer", () => {
    const renderDrawer = (overrideProps: Partial<Parameters<typeof HiddenDrawer>[0]> = {}) => {
        const props = {
            isOpen: true,
            columns: createColumns(),
            columnVisibility: { revenue: true, status: false },
            onClose: jest.fn(),
            onToggleColumn: jest.fn(),
            ...overrideProps
        } as Parameters<typeof HiddenDrawer>[0];

        const utils = render(<HiddenDrawer {...props} />);
        return { ...utils, ...props };
    };

    it("returns null when drawer is closed", () => {
        const { container } = renderDrawer({ isOpen: false });
        expect(container.firstChild).toBeNull();
    });

    it("focuses the drawer content when opened", async () => {
        renderDrawer();
        await waitFor(() => expect(screen.getByRole("dialog")).toHaveFocus());
    });

    it("closes when overlay is clicked", () => {
        const { container, onClose } = renderDrawer();
        const overlay = container.querySelector(".filter-drawer-overlay") as HTMLElement;
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalled();
    });

    it("closes when Escape is pressed", () => {
        const { onClose } = renderDrawer();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onClose).toHaveBeenCalled();
    });

    it("toggles individual columns", () => {
        const { onToggleColumn } = renderDrawer();
        fireEvent.click(screen.getByLabelText("Revenue"));
        expect(onToggleColumn).toHaveBeenCalledWith("revenue", false);
    });

    it("selects all and none via helper buttons", () => {
        const { onToggleColumn } = renderDrawer();
        fireEvent.click(screen.getByRole("button", { name: "Select all visible columns" }));
        fireEvent.click(screen.getByRole("button", { name: "Deselect all visible columns" }));
        expect(onToggleColumn).toHaveBeenCalledWith("revenue", true);
        expect(onToggleColumn).toHaveBeenCalledWith("status", true);
        expect(onToggleColumn).toHaveBeenCalledWith("revenue", false);
        expect(onToggleColumn).toHaveBeenCalledWith("status", false);
    });

    it("shows fallback message when no visible columns", () => {
        renderDrawer({ columns: [{ header: { value: "Hidden" } }] as any });
        expect(
            screen.getByText("No columns available for visibility control.")
        ).toBeInTheDocument();
    });

    it("renders reset button when handler supplied", () => {
        const onResetToDefault = jest.fn();
        renderDrawer({ onResetToDefault });
        fireEvent.click(
            screen.getByRole("button", {
                name: "Reset column visibility to default settings"
            })
        );
        expect(onResetToDefault).toHaveBeenCalled();
    });

    it("announces visible column counts in aria label", () => {
        renderDrawer();
        expect(screen.getByRole("dialog")).toHaveAttribute(
            "aria-label",
            "Column Visibility - 1 of 2 columns visible"
        );
    });
});
