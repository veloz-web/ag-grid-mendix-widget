// src/hooks/useDataPolling.js
import { useEffect, useRef, useCallback } from "react";
import { getRowData, getRowSignature } from "../utils/data";
import { ValueStatus } from "mendix";
import {
    shouldShowNotification,
    calculateCumulativeChange,
    formatCumulativeMessage,
    normalizePollingInterval
} from "../utils/polling";
import { debugLog } from "../utils/logger";

export const useDataPolling = (props, showToast, _gridApiRef) => {
    const { enablePolling, pollingInterval, enableNotifications, dataSource } = props;
    const pollIntervalRef = useRef(null);
    const lastRowSignatureRef = useRef("");

    // All three of these values change inside checkForNewData. Keeping them as
    // useState entries causes checkForNewData to be recreated on every change,
    // which in turn restarts setInterval via the polling useEffect.
    // Using refs avoids the recreation while still tracking the latest values.
    const lastKnownDataCountRef = useRef(0);
    const isPollingReloadRef = useRef(false);
    const cumulativeChangeRef = useRef(0);

    // Initialize baseline count
    useEffect(() => {
        if (dataSource && dataSource.status === ValueStatus.Available) {
            const initialData = getRowData(dataSource);
            const initialCount = initialData.length;
            lastKnownDataCountRef.current = initialCount;
            lastRowSignatureRef.current = getRowSignature(initialData);
            debugLog("[AGGrid] Initialized baseline count on mount:", initialCount);
        }
    }, [dataSource]);

    const checkForNewData = useCallback(async () => {
        if (!enablePolling || isPollingReloadRef.current) return;

        isPollingReloadRef.current = true;

        try {
            if (dataSource && typeof dataSource.reload === "function") {
                debugLog("[AGGrid Polling] Calling datasource.reload()...");
                await dataSource.reload();
            }

            const currentData = getRowData(dataSource);
            const currentCount = currentData.length;
            const currentSignature = getRowSignature(currentData);

            if (currentSignature === lastRowSignatureRef.current) {
                lastKnownDataCountRef.current = currentCount;
                return;
            }

            lastRowSignatureRef.current = currentSignature;

            const decision = shouldShowNotification(
                currentCount,
                lastKnownDataCountRef.current,
                enableNotifications
            );

            if (decision.shouldShow) {
                const newCumulative = calculateCumulativeChange(
                    decision.delta,
                    cumulativeChangeRef.current,
                    true
                );
                cumulativeChangeRef.current = newCumulative;
                const message = formatCumulativeMessage(newCumulative);
                showToast(message, newCumulative > 0 ? "success" : "info", "polling-notification");
                debugLog("[AGGrid Polling] showToast called with:", message);
            }

            lastKnownDataCountRef.current = currentCount;
        } catch (error) {
            console.error("[AGGrid] Error checking for new data:", error);
        } finally {
            isPollingReloadRef.current = false;
        }
    }, [
        // All three refs (isPollingReloadRef, cumulativeChangeRef, lastKnownDataCountRef)
        // are stable objects – they do not need to be in the dep array.
        // This keeps checkForNewData stable so the interval effect below does not
        // restart the timer on every data change.
        enablePolling,
        dataSource,
        enableNotifications,
        showToast
    ]);

    // Start/Stop polling effect
    useEffect(() => {
        if (!enablePolling) {
            return;
        }

        const intervalMs = normalizePollingInterval(pollingInterval);
        debugLog("[AGGrid Polling] Starting polling", {
            intervalSeconds: pollingInterval,
            intervalMs
        });

        pollIntervalRef.current = setInterval(() => {
            checkForNewData();
        }, intervalMs);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [enablePolling, pollingInterval, checkForNewData]);

    // Visibility change effect
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && enablePolling) {
                checkForNewData();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enablePolling, checkForNewData]);
};
