import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CustomTemplateView } from "../CustomTemplateView";
import { ValueStatus } from "mendix";

// Mock Mendix attribute
const createMockAttribute = (value: any, type = "String") =>
    ({
        id: "testAttr",
        type,
        get: jest.fn((_item: any) => ({
            status: ValueStatus.Available,
            value
        }))
    } as any);

// Mock complete column with all required properties
const createMockColumn = (fieldName: string, value: any, type = "String") =>
    ({
        header: { value: fieldName, status: "available" as any },
        attribute: createMockAttribute(value, type),
        dataType: "auto" as any,
        hidden: false,
        alignment: "auto" as any,
        widthType: "auto" as any,
        width: 100,
        flex: 1,
        minWidth: 50,
        maxWidth: 0,
        resizable: true,
        draggable: true,
        pinned: "none" as any,
        pinnable: false,
        sortable: true,
        defaultSort: "none" as any,
        sortIndex: 999,
        includeInSort: true,
        filter: true,
        filterLocation: "none" as any,
        useDateRange: false,
        useRelativeRange: false,
        floatingFilter: false,
        formatter: "none" as any,
        customFormatterName: "",
        customPrefix: "",
        customSuffix: "",
        template: "",
        linkUrlPattern: "",
        linkText: "",
        statusMapping: ""
    } as any);

// Mock columns array
const createMockColumns = (fieldName: string, value: any, type = "String") => [
    createMockColumn(fieldName, value, type)
];

describe("CustomTemplateView", () => {
    const mockRowData = [{ id: 1 }];
    const mockOnRowClick = jest.fn();

    beforeEach(() => {
        mockOnRowClick.mockClear();
    });

    describe("String Method Conditionals", () => {
        describe("includes() method", () => {
            it("shows content when string contains substring (direct boolean)", () => {
                const columns = createMockColumns("Form #", "ABC-123-VAF");
                const template =
                    '{{#if Form #.includes("VAF")}}<div data-testid="content">Found VAF</div>{{/if}}';

                const { getByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(getByTestId("content")).toBeInTheDocument();
                expect(getByTestId("content")).toHaveTextContent("Found VAF");
            });
            it("hides content when string does not contain substring (direct boolean)", () => {
                const columns = createMockColumns("Form #", "ABC-123-XYZ");
                const template =
                    '{{#if Form #.includes("VAF")}}<div data-testid="content">Found VAF</div>{{/if}}';

                const { queryByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(queryByTestId("content")).not.toBeInTheDocument();
            });

            it("still works with explicit comparison (backward compatibility)", () => {
                const columns = createMockColumns("Form #", "ABC-123-VAF");
                const template =
                    '{{#if Form #.includes("VAF") == "true"}}<div data-testid="content">Found VAF</div>{{/if}}';

                const { getByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(getByTestId("content")).toBeInTheDocument();
            });
        });

        describe("startsWith() method", () => {
            it("shows content when string starts with prefix", () => {
                const columns = createMockColumns("Code", "ABC-123");
                const template =
                    '{{#if Code.startsWith("ABC")}}<div data-testid="content">ABC Code</div>{{/if}}';

                const { getByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(getByTestId("content")).toBeInTheDocument();
            });

            it("hides content when string does not start with prefix", () => {
                const columns = createMockColumns("Code", "XYZ-123");
                const template =
                    '{{#if Code.startsWith("ABC")}}<div data-testid="content">ABC Code</div>{{/if}}';

                const { queryByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(queryByTestId("content")).not.toBeInTheDocument();
            });
        });

        describe("endsWith() method", () => {
            it("shows content when string ends with suffix", () => {
                const columns = createMockColumns("FileName", "document.pdf");
                const template =
                    '{{#if FileName.endsWith(".pdf")}}<div data-testid="content">PDF File</div>{{/if}}';

                const { getByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(getByTestId("content")).toBeInTheDocument();
            });
        });

        describe("substring() method", () => {
            it("works with explicit comparison for substring results", () => {
                const columns = createMockColumns("Form #", "ABC-123-VAF");
                const template =
                    '{{#if Form #.substring(0,3) == "ABC"}}<div data-testid="content">ABC Form</div>{{/if}}';

                const { getByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(getByTestId("content")).toBeInTheDocument();
            });
        });

        describe("length property", () => {
            it("works with explicit comparison for length", () => {
                const columns = createMockColumns("Name", "John");
                const template =
                    '{{#if Name.length() == "4"}}<div data-testid="content">4-letter name</div>{{/if}}';

                const { getByTestId } = render(
                    <CustomTemplateView
                        rowData={mockRowData}
                        columns={columns}
                        template={template}
                        onRowClick={mockOnRowClick}
                    />
                );

                expect(getByTestId("content")).toBeInTheDocument();
            });
        });
    });

    describe("Basic Conditional Logic", () => {
        it("shows content when field exists and has value", () => {
            const columns = createMockColumns("Status", "Active");
            const template = '{{#if Status}}<div data-testid="content">{{Status}}</div>{{/if}}';

            const { getByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(getByTestId("content")).toHaveTextContent("Active");
        });

        it("hides content when field is empty", () => {
            const columns = createMockColumns("Status", "");
            const template = '{{#if Status}}<div data-testid="content">{{Status}}</div>{{/if}}';

            const { queryByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(queryByTestId("content")).not.toBeInTheDocument();
        });

        it("works with explicit string comparison", () => {
            const columns = createMockColumns("Priority", "High");
            const template =
                '{{#if Priority == "High"}}<div data-testid="content">High Priority</div>{{/if}}';

            const { getByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(getByTestId("content")).toBeInTheDocument();
        });
    });

    describe("Boolean Field Handling", () => {
        it("shows content when boolean field is true", () => {
            const columns = createMockColumns("IsActive", true, "Boolean");
            const template = '{{#if IsActive}}<div data-testid="content">Active</div>{{/if}}';

            const { getByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(getByTestId("content")).toBeInTheDocument();
        });

        it("hides content when boolean field is false", () => {
            const columns = createMockColumns("IsActive", false, "Boolean");
            const template = '{{#if IsActive}}<div data-testid="content">Active</div>{{/if}}';

            const { queryByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(queryByTestId("content")).not.toBeInTheDocument();
        });

        it("works with explicit boolean comparison", () => {
            const columns = createMockColumns("IsActive", false, "Boolean");
            const template =
                '{{#if IsActive == "false"}}<div data-testid="content">Inactive</div>{{/if}}';

            const { getByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(getByTestId("content")).toBeInTheDocument();
        });
    });

    describe("Logical Operators", () => {
        it("works with AND operator", () => {
            const columns = [
                createMockColumn("Status", "Active"),
                createMockColumn("Priority", "High")
            ];
            const template =
                '{{#if Status == "Active" && Priority == "High"}}<div data-testid="content">Active High</div>{{/if}}';

            const { getByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(getByTestId("content")).toBeInTheDocument();
        });

        it("works with OR operator", () => {
            const columns = createMockColumns("Type", "Bug");
            const template =
                '{{#if Type == "Bug" || Type == "Issue"}}<div data-testid="content">Problem</div>{{/if}}';

            const { getByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(getByTestId("content")).toBeInTheDocument();
        });
    });

    describe("Template Processing", () => {
        it("processes placeholders correctly", () => {
            const columns = createMockColumns("Name", "John Doe");
            const template = '<div data-testid="content">Hello {{Name}}!</div>';

            const { getByTestId } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template={template}
                    onRowClick={mockOnRowClick}
                />
            );

            expect(getByTestId("content")).toHaveTextContent("Hello John Doe!");
        });

        it("handles missing templates gracefully", () => {
            const columns = createMockColumns("Name", "John");

            const { container } = render(
                <CustomTemplateView
                    rowData={mockRowData}
                    columns={columns}
                    template=""
                    onRowClick={mockOnRowClick}
                />
            );

            // Should render fallback view
            expect(container.firstChild).toBeInTheDocument();
        });
    });
});
