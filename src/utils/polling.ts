// src/utils/polling.ts
/**
 * Polling utility functions for data change detection and notification management
 */

export interface NotificationDecision {
    shouldShow: boolean;
    delta: number;
    message: string;
    type: "success" | "info" | "warning" | "error";
}

/**
 * Determines if a notification should be shown based on data count changes
 * @param currentCount - Current number of records
 * @param baselineCount - Previously known number of records
 * @param enableNotifications - Whether notifications are enabled
 * @returns Notification decision with message details
 */
export function shouldShowNotification(
    currentCount: number,
    baselineCount: number,
    enableNotifications: boolean
): NotificationDecision {
    // Don't show if notifications disabled
    if (!enableNotifications) {
        return {
            shouldShow: false,
            delta: 0,
            message: "",
            type: "info"
        };
    }

    // Don't show if baseline hasn't been set yet (initial load)
    if (baselineCount === 0) {
        return {
            shouldShow: false,
            delta: 0,
            message: "",
            type: "info"
        };
    }

    const delta = currentCount - baselineCount;

    // No change detected
    if (delta === 0) {
        return {
            shouldShow: false,
            delta: 0,
            message: "",
            type: "info"
        };
    }

    // Changes detected
    const absCount = Math.abs(delta);
    const message =
        delta > 0
            ? `${absCount} new record${absCount !== 1 ? "s" : ""} added`
            : `${absCount} record${absCount !== 1 ? "s" : ""} removed`;

    return {
        shouldShow: true,
        delta,
        message,
        type: delta > 0 ? "success" : "info"
    };
}

/**
 * Calculates cumulative change count for multi-poll scenarios
 * @param currentDelta - Current change amount
 * @param existingCumulative - Existing cumulative count
 * @param hasExistingNotification - Whether a notification is already showing
 * @returns Updated cumulative count
 */
export function calculateCumulativeChange(
    currentDelta: number,
    existingCumulative: number,
    hasExistingNotification: boolean
): number {
    if (!hasExistingNotification) {
        // First notification - start fresh
        return currentDelta;
    }
    // Subsequent notification - add to cumulative
    return existingCumulative + currentDelta;
}

/**
 * Generates notification message for cumulative changes
 * @param cumulativeCount - Total cumulative change count
 * @returns Formatted message
 */
export function formatCumulativeMessage(cumulativeCount: number): string {
    const absCount = Math.abs(cumulativeCount);
    return cumulativeCount > 0
        ? `${absCount} new record${absCount !== 1 ? "s" : ""} added`
        : `${absCount} record${absCount !== 1 ? "s" : ""} removed`;
}

/**
 * Validates and normalizes polling interval (minimum 10 seconds)
 * @param intervalSeconds - Desired interval in seconds
 * @returns Normalized interval in milliseconds
 */
export function normalizePollingInterval(intervalSeconds: number): number {
    const MIN_INTERVAL_MS = 10000; // 10 seconds
    const intervalMs = intervalSeconds * 1000;
    return Math.max(intervalMs, MIN_INTERVAL_MS);
}
