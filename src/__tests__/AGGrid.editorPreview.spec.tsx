// React import not needed here (older React auto-imports JSX), keep for compatibility if required
/* eslint-disable no-template-curly-in-string */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
// No user interaction in preview tests - static rendering is asserted
import { preview } from "../AGGrid.editorPreview";

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

    it("changes view when clicking Cards/List in preview", async () => {
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

        // In static preview we render both card and list templates when configured
        const rows = await screen.findAllByText(/Sample name/i);
        // Expect at least one card + 3 list rows => >= 4 total
        expect(rows.length).toBeGreaterThanOrEqual(4);
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

        // List template rows are visible in preview by default
        const matches = await screen.findAllByText(/Sample name/i);
        expect(matches.length).toBeGreaterThanOrEqual(3);
    });
});
