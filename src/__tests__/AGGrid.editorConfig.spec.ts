import { validate } from "../AGGrid.editorConfig";

const baseProps: any = {
    rowClassMode: "none",
    rowClassAttribute: undefined,
    rowClassRules: "",
    rowClassMapping: "",
    rowClassDefault: "",
    rowClassExpression: "",
    columns: [],
    enablePolling: false,
    pollingInterval: 60,
    enableNotifications: false,
    rowBuffer: 10,
    suppressRowVirtualisation: false,
    rowModelType: "clientSide",
    cacheBlockSize: 100,
    maxBlocksInCache: 0,
    maxConcurrentRequests: 2
};

describe("AGGrid editorConfig validate", () => {
    it("returns error when rowClassRules JSON is invalid", () => {
        const errors = validate({
            ...baseProps,
            rowClassRules: "{invalid-json}"
        } as any);

        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: "rowClassRules",
                    severity: "error"
                })
            ])
        );
    });

    it("returns error when mapping mode is missing attribute", () => {
        const errors = validate({
            ...baseProps,
            rowClassMode: "mapping",
            rowClassAttribute: undefined
        } as any);

        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: "rowClassAttribute",
                    severity: "error"
                })
            ])
        );
    });

    it("returns no errors for valid rules", () => {
        const errors = validate({
            ...baseProps,
            rowClassRules: '{"row-danger":"data.status === \'High\'"}',
            rowClassMode: "mapping",
            rowClassAttribute: { id: "Status" }
        } as any);

        expect(errors).toHaveLength(0);
    });
});
