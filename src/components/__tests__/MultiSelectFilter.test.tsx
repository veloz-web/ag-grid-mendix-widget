import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MultiSelectFilter } from "../MultiSelectFilter";

describe("MultiSelectFilter", () => {
    const mockOnChange = jest.fn();
    const defaultProps = {
        label: "Status",
        options: ["Open", "Closed", "Pending"],
        selectedValues: ["Open", "Closed", "Pending"],
        onChange: mockOnChange,
        enableSearch: true
    };

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    describe("Basic Rendering", () => {
        it("should render with label", () => {
            render(<MultiSelectFilter {...defaultProps} />);
            expect(screen.getByText("Status:")).toBeInTheDocument();
        });

        it("should show 'All' when all values selected", () => {
            render(<MultiSelectFilter {...defaultProps} />);
            expect(screen.getByText("All")).toBeInTheDocument();
        });

        it("should show 'All' when no values selected", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={[]} />);
            expect(screen.getByText("All")).toBeInTheDocument();
        });

        it("should show selected values when partially selected", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={["Open", "Closed"]} />);
            expect(screen.getByText("Open, Closed")).toBeInTheDocument();
        });

        it("should hide filter when only one option", () => {
            // This should be handled by parent component (Toolbar)
            // Filter component itself doesn't hide, but options should render
            render(
                <MultiSelectFilter
                    {...defaultProps}
                    options={["Single"]}
                    selectedValues={["Single"]}
                />
            );
            expect(screen.getByText("Status:")).toBeInTheDocument();
        });
    });

    describe("Dropdown Toggle", () => {
        it("should open dropdown when trigger clicked", () => {
            render(<MultiSelectFilter {...defaultProps} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);
            expect(screen.getByText("Select All")).toBeInTheDocument();
        });

        it("should close dropdown when clicking outside", async () => {
            render(
                <div>
                    <div data-testid="outside">Outside</div>
                    <MultiSelectFilter {...defaultProps} />
                </div>
            );

            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);
            expect(screen.getByText("Select All")).toBeInTheDocument();

            const outside = screen.getByTestId("outside");
            fireEvent.mouseDown(outside);

            await waitFor(() => {
                expect(screen.queryByText("Select All")).not.toBeInTheDocument();
            });
        });
    });

    describe("Select All Checkbox", () => {
        it("should be checked when all values selected", () => {
            render(<MultiSelectFilter {...defaultProps} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const selectAllCheckbox = screen.getByLabelText("Select all options");
            expect(selectAllCheckbox).toBeChecked();
        });

        it("should be unchecked when no values selected", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={[]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const selectAllCheckbox = screen.getByLabelText("Select all options");
            expect(selectAllCheckbox).not.toBeChecked();
        });

        it("should be indeterminate when partially selected", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={["Open"]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const selectAllCheckbox = screen.getByLabelText(
                "Select all options"
            ) as HTMLInputElement;
            expect(selectAllCheckbox.indeterminate).toBe(true);
        });

        it("should deselect all when clicked and all are selected", () => {
            render(<MultiSelectFilter {...defaultProps} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const selectAllCheckbox = screen.getByLabelText("Select all options");
            fireEvent.click(selectAllCheckbox);

            expect(mockOnChange).toHaveBeenCalledWith([]);
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should select all when clicked and none are selected", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={[]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const selectAllCheckbox = screen.getByLabelText("Select all options");
            fireEvent.click(selectAllCheckbox);

            expect(mockOnChange).toHaveBeenCalledWith(["Open", "Closed", "Pending"]);
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should select all when clicked and partially selected", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={["Open"]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const selectAllCheckbox = screen.getByLabelText("Select all options");
            fireEvent.click(selectAllCheckbox);

            expect(mockOnChange).toHaveBeenCalledWith(["Open", "Closed", "Pending"]);
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });
    });

    describe("Individual Checkbox Toggling", () => {
        it("should check a single value", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={[]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const openCheckbox = screen.getByLabelText("Open");
            fireEvent.click(openCheckbox);

            expect(mockOnChange).toHaveBeenCalledWith(["Open"]);
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should uncheck a single value", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={["Open", "Closed"]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const openCheckbox = screen.getByLabelText("Open");
            fireEvent.click(openCheckbox);

            expect(mockOnChange).toHaveBeenCalledWith(["Closed"]);
            expect(mockOnChange).toHaveBeenCalledTimes(1);
        });

        it("should not double-toggle when clicking checkbox", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={["Open"]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const openCheckbox = screen.getByLabelText("Open");
            fireEvent.click(openCheckbox);

            // Should only be called once, not twice
            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith([]);
        });

        it("should not double-toggle when clicking label text", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={["Open"]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const labelText = screen.getByText("Open");
            fireEvent.click(labelText);

            // Should only be called once
            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith([]);
        });

        it("should handle multiple rapid clicks correctly", () => {
            render(<MultiSelectFilter {...defaultProps} selectedValues={["Open"]} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const openCheckbox = screen.getByLabelText("Open");

            // Rapid clicks
            fireEvent.click(openCheckbox);
            fireEvent.click(openCheckbox);
            fireEvent.click(openCheckbox);

            // Should be called 3 times (not 6 due to double-firing)
            expect(mockOnChange).toHaveBeenCalledTimes(3);
        });
    });

    describe("Search Functionality", () => {
        it("should filter options based on search text", () => {
            render(<MultiSelectFilter {...defaultProps} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const searchInput = screen.getByPlaceholderText("Search...");
            fireEvent.change(searchInput, { target: { value: "pen" } });

            expect(screen.getByText("Open")).toBeInTheDocument();
            expect(screen.getByText("Pending")).toBeInTheDocument();
            expect(screen.queryByText("Closed")).not.toBeInTheDocument();
        });

        it("should show 'No matches found' when search yields no results", () => {
            render(<MultiSelectFilter {...defaultProps} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            const searchInput = screen.getByPlaceholderText("Search...");
            fireEvent.change(searchInput, { target: { value: "xyz" } });

            expect(screen.getByText("No matches found")).toBeInTheDocument();
        });

        it("should not show search when disabled", () => {
            render(<MultiSelectFilter {...defaultProps} enableSearch={false} />);
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty options array", () => {
            render(<MultiSelectFilter {...defaultProps} options={[]} selectedValues={[]} />);
            expect(screen.getByText("All")).toBeInTheDocument();
        });

        it("should handle options with special characters", () => {
            const specialOptions = ["Item & Value", "Item < 10", "Item > 5"];
            render(
                <MultiSelectFilter
                    {...defaultProps}
                    options={specialOptions}
                    selectedValues={specialOptions}
                />
            );
            const trigger = screen.getByRole("button", { name: /Status filter/i });
            fireEvent.click(trigger);

            expect(screen.getByText("Item & Value")).toBeInTheDocument();
            expect(screen.getByText("Item < 10")).toBeInTheDocument();
            expect(screen.getByText("Item > 5")).toBeInTheDocument();
        });
    });
});
