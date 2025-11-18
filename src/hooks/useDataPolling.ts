// src/hooks/useDataPolling.js
import { useEffect, useRef, useState, useCallback } from "react";
import { getRowData } from "../utils/data";
import { ValueStatus } from "mendix";
import {
    shouldShowNotification,
    calculateCumulativeChange,
    formatCumulativeMessage,
    normalizePollingInterval
} from "../utils/polling";

export const useDataPolling = (props, showToast, _gridApiRef) => {
    const { enablePolling, pollingInterval, enableNotifications, dataSource } = props;
    const pollIntervalRef = useRef(null);
    const [lastKnownDataCount, setLastKnownDataCount] = useState(0);
    const [isPollingReload, setIsPollingReload] = useState(false);
    const [cumulativeChange, setCumulativeChange] = useState(0);

    // Initialize baseline count
    useEffect(() => {
        if (dataSource && dataSource.status === ValueStatus.Available) {
            const initialCount = getRowData(dataSource).length;
            setLastKnownDataCount(getRowData(dataSource).length);
            console.log("[AGGrid] Initialized baseline count on mount:", initialCount);
        }
    }, [dataSource]);

    const checkForNewData = useCallback(async () => {
        if (!enablePolling || isPollingReload) return;

        setIsPollingReload(true);

        try {
            if (dataSource && typeof dataSource.reload === "function") {
                console.log("[AGGrid Polling] Calling datasource.reload()...");
                await dataSource.reload();
                console.log(
                    "[AGGrid Polling] datasource.reload() returned",
                    dataSource.items?.length
                );
            }

            // After reload, dataSource prop will update, triggering the effect below
            // Or we can get it from the ref if Mendix updates it
            const currentData = getRowData(dataSource); // Use freshest prop
            const currentCount = currentData.length;

            const decision = shouldShowNotification(
                currentCount,
                lastKnownDataCount,
                enableNotifications
            );

            console.log(
                "[AGGrid Polling] Notification decision (shouldShow, delta):",
                decision.shouldShow,
                decision.delta
            );

            if (decision.shouldShow) {
                const newCumulative = calculateCumulativeChange(
                    decision.delta,
                    cumulativeChange,
                    true
                ); // Assume existing
                setCumulativeChange(newCumulative);
                const message = formatCumulativeMessage(newCumulative);
                showToast(message, newCumulative > 0 ? "success" : "info", "polling-notification");
                console.log("[AGGrid Polling] showToast called with:", message);
            }

            setLastKnownDataCount(currentCount);
        } catch (error) {
            console.error("[AGGrid] Error checking for new data:", error);
        } finally {
            setIsPollingReload(false);
        }
    }, [
        enablePolling,
        isPollingReload,
        dataSource,
        lastKnownDataCount,
        enableNotifications,
        cumulativeChange,
        showToast
    ]);

    // Start/Stop polling effect
    useEffect(() => {
        if (!enablePolling) {
            console.log("[AGGrid Polling] Not starting - polling disabled");
            return;
        }

        console.log("[AGGrid Polling] ✓ Starting polling (hook)");

        if (enablePolling) {
            const intervalMs = normalizePollingInterval(pollingInterval);
            console.log("[AGGrid Polling] ✓ Starting polling", {
                intervalSeconds: pollingInterval,
                intervalMs
            });

            // Start the interval
            pollIntervalRef.current = setInterval(() => {
                console.log("[AGGrid Polling] ⏰ Interval fired - triggering check");
                checkForNewData();
            }, intervalMs);

            return () => {
                if (pollIntervalRef.current) {
                    console.log("[AGGrid Polling] Stopping polling");
                    clearInterval(pollIntervalRef.current);
                }
            };
        }
    }, [enablePolling, pollingInterval, checkForNewData]); // Add checkForNewData

    // Visibility change effect
    useEffect(() => {
        const handleVisibilityChange = () => {
            console.log("[AGGrid Polling] Check triggered");
            if (!document.hidden && enablePolling) {
                checkForNewData();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enablePolling, checkForNewData]); // Add checkForNewData
};
