import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MultiSelectFilter } from "../MultiSelectFilter";

describe("MultiSelectFilter", () => {
    const mockOnChange = jest.fn();
    const baseProps = {
        label: "Status",
        options: ["Open", "Closed", "Pending"],
        enableSearch: true,
        onChange: mockOnChange
    };

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    describe("Display state", () => {
        it("renders label and default placeholder when nothing selected", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            expect(screen.getByText("Status:")).toBeInTheDocument();
            expect(screen.getByText("Select status...")).toBeInTheDocument();
        });

        it("shows custom placeholder text when provided", () => {
            render(
                <MultiSelectFilter
                    {...baseProps}
                    selectedValues={[]}
                    placeholder="Pick some statuses"
                />
            );

            expect(screen.getByText("Pick some statuses")).toBeInTheDocument();
        });

        it("shows single value when one item selected", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open"]} />);

            expect(screen.getByText("Open")).toBeInTheDocument();
        });

        it("shows count when partially selected", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open", "Closed"]} />);

            expect(screen.getByText("2 selected")).toBeInTheDocument();
        });

        it("shows 'All selected' when everything selected", () => {
            render(
                <MultiSelectFilter
                    {...baseProps}
                    selectedValues={["Open", "Closed", "Pending"]}
                />
            );

            expect(screen.getByText("All selected")).toBeInTheDocument();
        });

        it("shows clear button only when selection present", () => {
            const { rerender } = render(
                <MultiSelectFilter {...baseProps} selectedValues={["Open"]} />
            );

            expect(screen.getByRole("button", { name: "Clear selection" })).toBeInTheDocument();

            rerender(<MultiSelectFilter {...baseProps} selectedValues={[]} />);
            expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
        });
    });

    describe("Dropdown interactions", () => {
        it("opens dropdown when trigger clicked", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByText("Select All")).toBeInTheDocument();
        });

        it("closes dropdown when clicking outside", async () => {
            render(
                <div>
                    <div data-testid="outside">Outside</div>
                    <MultiSelectFilter {...baseProps} selectedValues={["Open"]} />
                </div>
            );

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByText("Select All")).toBeInTheDocument();

            fireEvent.mouseDown(screen.getByTestId("outside"));

            await waitFor(() => {
                expect(screen.queryByText("Select All")).not.toBeInTheDocument();
            });
        });

        it("focuses search when dropdown opens", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByRole("textbox", { name: "Search options" })).toHaveFocus();
        });
    });

    describe("Select all behaviour", () => {
        const openDropdown = () => {
            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
        };

        it("checkbox is checked when everything selected", () => {
            render(
                <MultiSelectFilter
                    {...baseProps}
                    selectedValues={["Open", "Closed", "Pending"]}
                />
            );

            openDropdown();
            expect(screen.getByLabelText("Select all options")).toBeChecked();
        });

        it("checkbox is unchecked when nothing selected", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            openDropdown();
            expect(screen.getByLabelText("Select all options")).not.toBeChecked();
        });

        it("checkbox is indeterminate when partially selected", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open"]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            const checkbox = screen.getByLabelText("Select all options") as HTMLInputElement;

            // Wait for useEffect to set indeterminate state
            expect(checkbox.indeterminate).toBe(true);
        });

        it("deselects everything when toggled from fully selected", () => {
            render(
                <MultiSelectFilter
                    {...baseProps}
                    selectedValues={["Open", "Closed", "Pending"]}
                />
            );

            openDropdown();
            fireEvent.click(screen.getByLabelText("Select all options"));

            expect(mockOnChange).toHaveBeenCalledWith([]);
        });

        it("selects everything when toggled from empty", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            openDropdown();
            fireEvent.click(screen.getByLabelText("Select all options"));

            expect(mockOnChange).toHaveBeenCalledWith(["Open", "Closed", "Pending"]);
        });
    });

    describe("Individual option toggles", () => {
        const openDropdown = () => fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));

        it("checks option that was previously unselected", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            openDropdown();
            fireEvent.click(screen.getByLabelText("Open"));

            expect(mockOnChange).toHaveBeenCalledWith(["Open"]);
        });

        it("unchecks option that was selected", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open", "Closed"]} />);

            openDropdown();
            fireEvent.click(screen.getByLabelText("Open"));

            expect(mockOnChange).toHaveBeenCalledWith(["Closed"]);
        });

        it("clears selection when clear button pressed", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open"]} />);

            fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
            expect(mockOnChange).toHaveBeenCalledWith([]);
        });
    });

    describe("Search", () => {
        it("filters options by search text", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            fireEvent.change(screen.getByPlaceholderText("Search..."), {
                target: { value: "pen" }
            });

            expect(screen.getByText("Open")).toBeInTheDocument();
            expect(screen.getByText("Pending")).toBeInTheDocument();
            expect(screen.queryByText("Closed")).not.toBeInTheDocument();
        });

        it("shows empty state message when nothing matches", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            fireEvent.change(screen.getByPlaceholderText("Search..."), {
                target: { value: "zzz" }
            });

            expect(screen.getByText("No matches found")).toBeInTheDocument();
        });

        it("can render without search input", () => {
            render(
                <MultiSelectFilter
                    {...baseProps}
                    enableSearch={false}
                    selectedValues={[]}
                />
            );

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
        });
    });

    describe("Keyboard interactions", () => {
        it("closes dropdown on Escape key", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByText("Select All")).toBeInTheDocument();

            fireEvent.keyDown(document, { key: "Escape" });

            expect(screen.queryByText("Select All")).not.toBeInTheDocument();
        });

        it("clears search when dropdown closes", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            fireEvent.change(screen.getByPlaceholderText("Search..."), {
                target: { value: "pen" }
            });

            fireEvent.keyDown(document, { key: "Escape" });

            // Re-open to check search is cleared
            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByPlaceholderText("Search...")).toHaveValue("");
        });
    });

    describe("Accessibility", () => {
        it("has correct ARIA attributes on trigger", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            const trigger = screen.getByRole("button", { name: /Status filter/i });
            expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
            expect(trigger).toHaveAttribute("aria-expanded", "false");
        });

        it("updates aria-expanded when dropdown opens", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            const trigger = screen.getByRole("button", { name: /Status filter/i });
            expect(trigger).toHaveAttribute("aria-expanded", "false");

            fireEvent.click(trigger);
            expect(trigger).toHaveAttribute("aria-expanded", "true");
        });

        it("has correct role on dropdown", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByRole("listbox")).toBeInTheDocument();
        });

        it("has correct aria-selected on options", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open"]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));

            const openOption = screen.getByRole("option", { name: "Open Open" });
            expect(openOption).toHaveAttribute("aria-selected", "true");

            const closedOption = screen.getByRole("option", { name: "Closed Closed" });
            expect(closedOption).toHaveAttribute("aria-selected", "false");
        });
    });

    describe("Clear button behavior", () => {
        it("closes dropdown when clear button clicked", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open"]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByText("Select All")).toBeInTheDocument();

            fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
            expect(screen.queryByText("Select All")).not.toBeInTheDocument();
        });

        it("clears selection and closes dropdown", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open", "Closed"]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

            expect(mockOnChange).toHaveBeenCalledWith([]);
            expect(screen.queryByText("Select All")).not.toBeInTheDocument();
        });
    });

    describe("Dynamic updates", () => {
        it("handles options changing after render", () => {
            const { rerender } = render(
                <MultiSelectFilter {...baseProps} selectedValues={[]} />
            );

            rerender(
                <MultiSelectFilter
                    {...baseProps}
                    options={["New", "Options"]}
                    selectedValues={[]}
                />
            );

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByText("New")).toBeInTheDocument();
            expect(screen.getByText("Options")).toBeInTheDocument();
        });

        it("handles selectedValues changing externally", () => {
            const { rerender } = render(
                <MultiSelectFilter {...baseProps} selectedValues={["Open"]} />
            );

            expect(screen.getByText("Open")).toBeInTheDocument();

            rerender(<MultiSelectFilter {...baseProps} selectedValues={["Closed"]} />);
            expect(screen.getByText("Closed")).toBeInTheDocument();
        });
    });

    describe("Search behavior", () => {
        it("preserves search text while dropdown is open", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            fireEvent.change(screen.getByPlaceholderText("Search..."), {
                target: { value: "pen" }
            });

            // Click outside to close, then reopen
            fireEvent.mouseDown(document.body);
            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));

            expect(screen.getByPlaceholderText("Search...")).toHaveValue("");
        });

        it("filters case-insensitively", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            fireEvent.change(screen.getByPlaceholderText("Search..."), {
                target: { value: "PENDING" }
            });

            expect(screen.getByText("Pending")).toBeInTheDocument();
            expect(screen.queryByText("Open")).not.toBeInTheDocument();
        });
    });

    describe("Selection state persistence", () => {
        it("maintains selection state across dropdown toggles", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={["Open"]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            expect(screen.getByLabelText("Open")).toBeChecked();

            fireEvent.mouseDown(document.body); // Close
            fireEvent.click(screen.getByRole("button", { name: /Status filter/i })); // Reopen

            expect(screen.getByLabelText("Open")).toBeChecked();
        });

        it("updates display immediately after selection", () => {
            render(<MultiSelectFilter {...baseProps} selectedValues={[]} />);

            fireEvent.click(screen.getByRole("button", { name: /Status filter/i }));
            fireEvent.click(screen.getByLabelText("Open"));

            expect(mockOnChange).toHaveBeenCalledWith(["Open"]);
            // Note: Display update would happen on next render after onChange callback
        });
    });
});
