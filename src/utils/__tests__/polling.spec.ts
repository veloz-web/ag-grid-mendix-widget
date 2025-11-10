// src/utils/__tests__/polling.spec.ts
import {
    shouldShowNotification,
    calculateCumulativeChange,
    formatCumulativeMessage,
    normalizePollingInterval
} from "../polling";

describe("Polling Utilities", () => {
    describe("shouldShowNotification", () => {
        it("returns false when notifications are disabled", () => {
            const result = shouldShowNotification(10, 5, false);

            expect(result.shouldShow).toBe(false);
            expect(result.delta).toBe(0);
            expect(result.message).toBe("");
        });

        it("returns false when baseline is 0 (initial load)", () => {
            const result = shouldShowNotification(10, 0, true);

            expect(result.shouldShow).toBe(false);
            expect(result.delta).toBe(0);
        });

        it("returns false when counts are equal (no change)", () => {
            const result = shouldShowNotification(5, 5, true);

            expect(result.shouldShow).toBe(false);
            expect(result.delta).toBe(0);
        });

        it("shows success notification when records are added", () => {
            const result = shouldShowNotification(10, 5, true);

            expect(result.shouldShow).toBe(true);
            expect(result.delta).toBe(5);
            expect(result.message).toBe("5 new records added");
            expect(result.type).toBe("success");
        });

        it("uses singular form for single record added", () => {
            const result = shouldShowNotification(6, 5, true);

            expect(result.message).toBe("1 new record added");
        });

        it("shows info notification when records are removed", () => {
            const result = shouldShowNotification(5, 10, true);

            expect(result.shouldShow).toBe(true);
            expect(result.delta).toBe(-5);
            expect(result.message).toBe("5 records removed");
            expect(result.type).toBe("info");
        });

        it("uses singular form for single record removed", () => {
            const result = shouldShowNotification(9, 10, true);

            expect(result.message).toBe("1 record removed");
        });
    });

    describe("calculateCumulativeChange", () => {
        it("returns current delta when no existing notification", () => {
            const result = calculateCumulativeChange(5, 0, false);

            expect(result).toBe(5);
        });

        it("adds to cumulative when notification exists", () => {
            const result = calculateCumulativeChange(3, 5, true);

            expect(result).toBe(8);
        });

        it("handles negative deltas correctly", () => {
            const result = calculateCumulativeChange(-2, 5, true);

            expect(result).toBe(3);
        });

        it("resets cumulative when starting fresh", () => {
            const result = calculateCumulativeChange(10, 100, false);

            expect(result).toBe(10);
        });
    });

    describe("formatCumulativeMessage", () => {
        it("formats positive cumulative count correctly", () => {
            const message = formatCumulativeMessage(10);

            expect(message).toBe("10 new records added");
        });

        it("formats negative cumulative count correctly", () => {
            const message = formatCumulativeMessage(-5);

            expect(message).toBe("5 records removed");
        });

        it("uses singular form for count of 1", () => {
            const message = formatCumulativeMessage(1);

            expect(message).toBe("1 new record added");
        });

        it("uses singular form for count of -1", () => {
            const message = formatCumulativeMessage(-1);

            expect(message).toBe("1 record removed");
        });

        it("handles zero count", () => {
            const message = formatCumulativeMessage(0);

            expect(message).toBe("0 records removed");
        });
    });

    describe("normalizePollingInterval", () => {
        it("converts seconds to milliseconds", () => {
            const result = normalizePollingInterval(30);

            expect(result).toBe(30000);
        });

        it("enforces minimum of 10 seconds", () => {
            const result = normalizePollingInterval(5);

            expect(result).toBe(10000);
        });

        it("allows intervals greater than minimum", () => {
            const result = normalizePollingInterval(60);

            expect(result).toBe(60000);
        });

        it("handles exactly 10 seconds", () => {
            const result = normalizePollingInterval(10);

            expect(result).toBe(10000);
        });

        it("handles very small intervals", () => {
            const result = normalizePollingInterval(1);

            expect(result).toBe(10000);
        });

        it("handles zero interval", () => {
            const result = normalizePollingInterval(0);

            expect(result).toBe(10000);
        });
    });
});
