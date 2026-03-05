// src/hooks/__tests__/useDataPolling.spec.ts
/**
 * Tests for useDataPolling hook
 *
 * Key regression: checkForNewData captured `isPollingReload` and
 * `cumulativeChange` in its useCallback dependency array. Because those values
 * change INSIDE the callback, React recreates the function reference after
 * each tick. The polling useEffect depends on [enablePolling, pollingInterval,
 * checkForNewData], so it clears and restarts setInterval on every detected
 * data change – resetting the countdown and making the interval unreliable.
 *
 * Fix: track isPollingReload and cumulativeChange via refs so the callback
 * stays stable and does not need to be in the dep array.
 */

import { renderHook, act, cleanup } from "@testing-library/react";
import { ValueStatus } from "mendix";
import { useDataPolling } from "../useDataPolling";

jest.mock("mendix", () => ({
    ValueStatus: {
        Available: "available",
        Unavailable: "unavailable",
        Loading: "loading"
    }
}));

const makeDataSource = (items: any[] = []) => ({
    status: ValueStatus.Available,
    items,
    reload: jest.fn().mockResolvedValue(undefined)
});

const makeProps = (overrides: Partial<any> = {}) => ({
    enablePolling: true,
    pollingInterval: 30,
    enableNotifications: true,
    dataSource: makeDataSource([{ id: 1 }, { id: 2 }]),
    ...overrides
});

// Drain pending microtasks without advancing fake timers
const flushPromises = (): Promise<void> =>
    act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });

describe("useDataPolling – interval stability regression", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Unmount BEFORE restoring real timers so effect cleanups run while
        // clearInterval is still the fake implementation (avoids "clearInterval
        // is not defined" crash on unmount when timers are already restored).
        cleanup();
        jest.useRealTimers();
    });

    it("should start exactly ONE interval when polling is enabled", () => {
        const setIntervalSpy = jest.spyOn(global, "setInterval");
        renderHook(() => useDataPolling(makeProps(), jest.fn(), { current: null }));
        expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it("should NOT restart the interval when data changes are detected mid-cycle (BUG: interval resets on every data change)", async () => {
        const setIntervalSpy = jest.spyOn(global, "setInterval");
        const clearIntervalSpy = jest.spyOn(global, "clearInterval");

        // Rows grow on every reload so a data change is always detected
        let rowCount = 5;
        const dataSource = {
            status: ValueStatus.Available,
            get items() {
                return Array.from({ length: rowCount }, (_, i) => ({ id: i }));
            },
            reload: jest.fn().mockImplementation(() => {
                rowCount += 3;
                return Promise.resolve();
            })
        };

        renderHook(() => useDataPolling(makeProps({ dataSource }), jest.fn(), { current: null }));

        // Fire three polling ticks, flushing microtasks after each
        for (let tick = 0; tick < 3; tick++) {
            act(() => {
                jest.advanceTimersByTime(30_000);
            });
            await flushPromises();
        }

        // BUG: without the ref fix, every detected data change triggers
        // checkForNewData recreation → effect re-runs → setInterval called again.
        // After the fix, setInterval is called exactly ONCE.
        expect(setIntervalSpy).toHaveBeenCalledTimes(1);

        // clearInterval must NOT be called during active polling.
        // (It is called once in afterEach when the hook unmounts – after this assertion.)
        expect(clearIntervalSpy).toHaveBeenCalledTimes(0);
    });

    it("should not start an interval when polling is disabled", () => {
        const setIntervalSpy = jest.spyOn(global, "setInterval");
        renderHook(() =>
            useDataPolling(makeProps({ enablePolling: false }), jest.fn(), { current: null })
        );
        expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    it("should stop the interval when enablePolling is toggled off", () => {
        const clearIntervalSpy = jest.spyOn(global, "clearInterval");
        const { rerender } = renderHook(
            ({ enabled }: { enabled: boolean }) =>
                useDataPolling(makeProps({ enablePolling: enabled }), jest.fn(), {
                    current: null
                }),
            { initialProps: { enabled: true } }
        );

        act(() => rerender({ enabled: false }));

        // Effect cleanup from the enablePolling=true render must call clearInterval
        expect(clearIntervalSpy).toHaveBeenCalled();
    });
});
