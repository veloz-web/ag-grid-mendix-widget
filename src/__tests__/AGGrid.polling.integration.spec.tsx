// src/__tests__/AGGrid.polling.integration.spec.tsx
/**
 * Integration tests for polling functionality
 * These tests focus on the polling logic without React Testing Library's rerender limitations
 */

import {
    shouldShowNotification,
    calculateCumulativeChange,
    formatCumulativeMessage
} from "../utils/polling";

// Mock Mendix dependencies
jest.mock("mendix", () => ({
    ValueStatus: {
        Available: "available",
        Unavailable: "unavailable",
        Loading: "loading"
    }
}));

// Mock AG Grid modules
jest.mock("../agGridModules", () => ({}));
jest.mock("ag-grid-react", () => ({
    AgGridReact: () => null
}));

jest.mock("ag-grid-community", () => ({
    ModuleRegistry: { registerModules: jest.fn() }
}));

describe("AGGrid Polling - Integration Tests", () => {
    describe("Polling Logic with Utility Functions", () => {
        it("detects new records and generates correct notification", () => {
            const currentCount = 10;
            const baselineCount = 5;
            const enableNotifications = true;

            const decision = shouldShowNotification(
                currentCount,
                baselineCount,
                enableNotifications
            );

            expect(decision.shouldShow).toBe(true);
            expect(decision.delta).toBe(5);
            expect(decision.message).toBe("5 new records added");
            expect(decision.type).toBe("success");
        });

        it("handles cumulative changes correctly", () => {
            // Scenario: User goes to lunch, multiple polls happen
            // First poll: +5 records
            let hasNotification = false;
            let cumulative = 0;

            const firstDelta = 5;
            cumulative = calculateCumulativeChange(firstDelta, cumulative, hasNotification);
            hasNotification = true;

            expect(cumulative).toBe(5);
            expect(formatCumulativeMessage(cumulative)).toBe("5 new records added");

            // Second poll: +3 more records
            const secondDelta = 3;
            cumulative = calculateCumulativeChange(secondDelta, cumulative, hasNotification);

            expect(cumulative).toBe(8);
            expect(formatCumulativeMessage(cumulative)).toBe("8 new records added");

            // Third poll: +2 more records
            const thirdDelta = 2;
            cumulative = calculateCumulativeChange(thirdDelta, cumulative, hasNotification);

            expect(cumulative).toBe(10);
            expect(formatCumulativeMessage(cumulative)).toBe("10 new records added");
        });

        it("resets cumulative count after notification dismissal", () => {
            // Build up cumulative count
            let cumulative = 0;
            let hasNotification = false;

            // First change
            cumulative = calculateCumulativeChange(5, cumulative, hasNotification);
            hasNotification = true;
            expect(cumulative).toBe(5);

            // Second change
            cumulative = calculateCumulativeChange(3, cumulative, hasNotification);
            expect(cumulative).toBe(8);

            // User dismisses notification
            hasNotification = false;
            cumulative = 0; // Reset happens in dismissToast

            // New change starts fresh
            cumulative = calculateCumulativeChange(2, cumulative, hasNotification);
            expect(cumulative).toBe(2);
            expect(formatCumulativeMessage(cumulative)).toBe("2 new records added");
        });

        it("handles record removal correctly", () => {
            const currentCount = 5;
            const baselineCount = 10;

            const decision = shouldShowNotification(currentCount, baselineCount, true);

            expect(decision.shouldShow).toBe(true);
            expect(decision.delta).toBe(-5);
            expect(decision.message).toBe("5 records removed");
            expect(decision.type).toBe("info");
        });

        it("does not show notification when disabled", () => {
            const decision = shouldShowNotification(10, 5, false);

            expect(decision.shouldShow).toBe(false);
        });

        it("does not show notification on initial load", () => {
            const decision = shouldShowNotification(10, 0, true);

            expect(decision.shouldShow).toBe(false);
        });

        it("does not show notification when count unchanged", () => {
            const decision = shouldShowNotification(10, 10, true);

            expect(decision.shouldShow).toBe(false);
        });
    });

    describe("Cumulative Change Scenarios", () => {
        it("tracks changes during extended user absence", () => {
            // Simulate user away for 1 hour with 5-minute polling
            const polls = [
                { count: 105, expected: 5 },
                { count: 108, expected: 8 },
                { count: 112, expected: 12 },
                { count: 115, expected: 15 },
                { count: 120, expected: 20 }
            ];

            const baseline = 100;
            let cumulative = 0;
            let hasNotification = false;

            polls.forEach((poll, index) => {
                const delta = poll.count - (index === 0 ? baseline : polls[index - 1].count);
                cumulative = calculateCumulativeChange(delta, cumulative, hasNotification);
                hasNotification = true;

                expect(cumulative).toBe(poll.expected);
            });

            expect(formatCumulativeMessage(cumulative)).toBe("20 new records added");
        });

        it("handles mixed additions and removals", () => {
            // Records added, then some removed
            let cumulative = 0;
            let hasNotification = false;

            // +10 records
            cumulative = calculateCumulativeChange(10, cumulative, hasNotification);
            hasNotification = true;
            expect(cumulative).toBe(10);

            // -3 records (net: +7)
            cumulative = calculateCumulativeChange(-3, cumulative, hasNotification);
            expect(cumulative).toBe(7);
            expect(formatCumulativeMessage(cumulative)).toBe("7 new records added");
        });

        it("handles all records removed", () => {
            let cumulative = 0;
            let hasNotification = false;

            // Start with -50 records removed
            cumulative = calculateCumulativeChange(-50, cumulative, hasNotification);
            hasNotification = true;
            expect(cumulative).toBe(-50);

            // Another -10 removed
            cumulative = calculateCumulativeChange(-10, cumulative, hasNotification);
            expect(cumulative).toBe(-60);
            expect(formatCumulativeMessage(cumulative)).toBe("60 records removed");
        });
    });

    describe("Edge Cases", () => {
        it("handles zero delta (shouldn't happen but defensive)", () => {
            const decision = shouldShowNotification(10, 10, true);
            expect(decision.shouldShow).toBe(false);
            expect(decision.delta).toBe(0);
        });

        it("handles very large count changes", () => {
            const decision = shouldShowNotification(1000000, 1, true);
            expect(decision.shouldShow).toBe(true);
            expect(decision.delta).toBe(999999);
            expect(decision.message).toBe("999999 new records added");
        });

        it("handles negative baseline (shouldn't happen)", () => {
            // Baseline should never be negative, but test defensive behavior
            const decision = shouldShowNotification(10, -5, true);
            expect(decision.shouldShow).toBe(true);
            expect(decision.delta).toBe(15);
        });

        it("formats singular and plural correctly", () => {
            expect(formatCumulativeMessage(1)).toBe("1 new record added");
            expect(formatCumulativeMessage(2)).toBe("2 new records added");
            expect(formatCumulativeMessage(-1)).toBe("1 record removed");
            expect(formatCumulativeMessage(-2)).toBe("2 records removed");
        });
    });
});
