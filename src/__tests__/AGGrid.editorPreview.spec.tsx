// React import not needed here (older React auto-imports JSX), keep for compatibility if required
/* eslint-disable no-template-curly-in-string */
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
// No user interaction in preview tests - static rendering is asserted
import { preview } from "../AGGrid.editorPreview";
import * as renderers from "../utils/renderers";

// Mock Mendix ValueStatus for preview templates
jest.mock("mendix", () => ({
    ValueStatus: {
        Available: "available",
        Unavailable: "unavailable",
        Loading: "loading"
    }
}));

describe("AGGrid Editor Preview templates", () => {
    it("renders card template with sample values", async () => {
        const props: any = {
            className: "",
            class: "",
            style: "",
            styleObject: {},
            readOnly: true,
            renderMode: "design",
            translate: (t: string) => t,
            dataSource: null,
            columns: [
                {
                    header: "Name",
                    attribute: "name",
                    // eslint-disable-next-line no-template-curly-in-string
                    template: "<div>${name}</div>",
                    headerAlign: "left"
                }
            ],
            // eslint-disable-next-line no-template-curly-in-string
            customCardTemplate: "<div class='card'>${name}</div>",
            customListTemplate: "",
            enableViewSelector: true,
            enableFilterDrawer: false,
            customFormatters: []
        };

        render(preview(props));
        // No user interactions required for this preview test

        // Card templates are visible in the preview by default
        const card = await screen.findByText(/Sample name/i);
        expect(card).toBeTruthy();
    });

    it("renders both card and list preview sections when configured", async () => {
        const props: any = {
            className: "",
            class: "",
            style: "",
            styleObject: {},
            readOnly: true,
            renderMode: "design",
            translate: (t: string) => t,
            dataSource: null,
            columns: [
                {
                    header: "Name",
                    attribute: "name",
                    // eslint-disable-next-line no-template-curly-in-string
                    template: "<div>${name}</div>",
                    headerAlign: "left"
                }
            ],
            customCardTemplate: "<div class='card'>${name}</div>",
            // eslint-disable-next-line no-template-curly-in-string
            customListTemplate: "<div class='list-item'>${name}</div>",
            enableViewSelector: true,
            enableFilterDrawer: false,
            customFormatters: []
        };

        render(preview(props));
        // No user interactions required for this preview test

        expect(await screen.findByText(/Card Template Preview/i)).toBeInTheDocument();
        expect(await screen.findByText(/List Template Preview/i)).toBeInTheDocument();
    });

    it("renders list template rows with sample values", async () => {
        const props: any = {
            className: "",
            class: "",
            style: "",
            styleObject: {},
            readOnly: true,
            renderMode: "design",
            translate: (t: string) => t,
            dataSource: null,
            columns: [
                {
                    header: "Name",
                    attribute: "name",
                    template: "<div>${name}</div>",
                    headerAlign: "left"
                }
            ],
            customCardTemplate: "",
            customListTemplate: "<div class='list-item'>${name}</div>",
            enableViewSelector: true,
            enableFilterDrawer: false,
            customFormatters: []
        };

        render(preview(props));
        // No user interactions required for this preview test

        const listTemplate = await screen.findByText(/List Template Preview/i);
        expect(listTemplate).toBeInTheDocument();
        expect(await screen.findByText(/Sample name/i)).toBeInTheDocument();
    });
});

describe("AGGrid Editor Preview indicators", () => {
    const baseProps: any = {
        className: "",
        class: "",
        style: "",
        styleObject: {},
        readOnly: true,
        renderMode: "design",
        translate: (t: string) => t,
        dataSource: null,
        columns: [],
        customCardTemplate: "",
        customListTemplate: "",
        enableViewSelector: false,
        enableFilterDrawer: false,
        customFormatters: [],
        pagination: false,
        pageSize: 20,
        height: 400,
        theme: "alpine",
        enablePolling: false,
        pollingInterval: 5000,
        enableNotifications: false,
        rowModelType: "clientSide",
        rowBuffer: 10,
        suppressRowVirtualisation: false,
        cacheBlockSize: 100,
        maxBlocksInCache: 0,
        maxConcurrentRequests: 2
    };

    it("shows virtual scrolling warning when virtualisation is suppressed", () => {
        const props = {
            ...baseProps,
            suppressRowVirtualisation: true
        };

        render(preview(props));

        expect(screen.getByText(/Virtual scrolling tips/i)).toBeInTheDocument();
        expect(screen.getByText(/virtualisation is disabled/i)).toBeInTheDocument();
    });

    it("shows row class rules banner when rules are configured", () => {
        const props = {
            ...baseProps,
            rowClassRules: '{"row-danger":"data.status === \'High\'"}'
        };

        render(preview(props));

        expect(screen.getByText(/Row Class Rules/i)).toBeInTheDocument();
        expect(screen.getByText(/Rules are enabled/i)).toBeInTheDocument();
    });

    it("shows row class rules error banner when JSON is invalid", () => {
        const props = {
            ...baseProps,
            rowClassRules: "{invalid-json}"
        };

        render(preview(props));

        expect(screen.getByText(/Row Class Rules Error/i)).toBeInTheDocument();
        expect(screen.getByText(/Row Class Rules JSON error/i)).toBeInTheDocument();
    });

    it("shows custom formatter warning banner for unknown names", () => {
        const props = {
            ...baseProps,
            columns: [
                {
                    header: "Status",
                    attribute: "status",
                    formatter: "none",
                    customFormatterName: "MissingFormatter"
                }
            ],
            customFormatters: [
                {
                    formatterName: "AvailableFormatter",
                    formatterType: "javascript",
                    formatterCode: "return value;",
                    formatterConfig: ""
                }
            ]
        };

        render(preview(props));

        expect(screen.getByText(/Custom Formatter Errors/i)).toBeInTheDocument();
        const warningContainer = screen.getByText(/Custom Formatter Errors/i).closest("div");
        expect(warningContainer).not.toBeNull();
        const warning = warningContainer as HTMLElement;

        expect(
            within(warning).getByText((_, element) =>
                Boolean(
                    element &&
                        element.tagName === "LI" &&
                        element.textContent &&
                        element.textContent
                            .replace(/\s+/g, " ")
                            .includes('Column "Status" references formatter "MissingFormatter"')
                )
            )
        ).toBeInTheDocument();
        expect(within(warning).getByText(/Available formatters:/i)).toHaveTextContent(
            /Available formatters:\s+AvailableFormatter/i
        );
    });

    it("renders filter drawer button and status counts", () => {
        const props = {
            ...baseProps,
            enableFilterDrawer: true,
            columns: [
                {
                    header: "Priority",
                    attribute: "priority",
                    filter: true,
                    filterLocation: "drawer"
                },
                {
                    header: "Region",
                    attribute: "region",
                    filter: true,
                    filterLocation: "toolbar"
                }
            ]
        };

        render(preview(props));

        expect(
            screen.getByTitle(/Filter drawer with 1 filterable column: Priority/i)
        ).toBeInTheDocument();
        const filterStatusContainer = screen
            .getByText(/Filter Configuration Status/i)
            .closest("div") as HTMLElement;
        const drawerRow = within(filterStatusContainer).getByText((_, element) =>
            Boolean(
                element &&
                    element.tagName === "LI" &&
                    element.textContent &&
                    element.textContent.includes("Filter Drawer:")
            )
        );
        const toolbarRow = within(filterStatusContainer).getByText((_, element) =>
            Boolean(
                element &&
                    element.tagName === "LI" &&
                    element.textContent &&
                    element.textContent.includes("Toolbar Filters:")
            )
        );
        expect(drawerRow.textContent).toContain("✓ Available (1 column)");
        expect(toolbarRow.textContent).toContain("✓ 1 column configured");
        expect(within(filterStatusContainer).getByText(/Drawer columns:/i)).toHaveTextContent(
            /Priority/i
        );
        expect(within(filterStatusContainer).getByText(/Toolbar columns:/i)).toHaveTextContent(
            /Region/i
        );
    });

    it("shows template error message when evaluateTemplate throws", () => {
        const spy = jest.spyOn(renderers, "evaluateTemplate").mockImplementation(() => {
            throw new Error("invalid template");
        });
        const props = {
            ...baseProps,
            columns: [
                {
                    header: "Name",
                    attribute: "name"
                }
            ],
            customCardTemplate: "<div>${name</div>"
        };

        render(preview(props));

        expect(screen.getByText(/Invalid template syntax/i)).toBeInTheDocument();
        spy.mockRestore();
    });
});
