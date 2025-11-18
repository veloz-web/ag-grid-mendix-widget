// src/hooks/useToast.js
import { useState, useCallback, useRef, useEffect } from "react";

export const useToast = (autoHideDuration) => {
    const [toastNotifications, setToastNotifications] = useState([]);
    const toastTimers = useRef(new Map());
    const duration = autoHideDuration ?? 5000;

    const dismissToast = useCallback((toastId) => {
        // Clear any pending timer
        const timer = toastTimers.current.get(toastId);
        if (timer) {
            clearTimeout(timer);
            toastTimers.current.delete(toastId);
        }

        setToastNotifications((prev) => prev.filter((t) => t.id !== toastId));
    }, []);

    const showToast = useCallback(
        (message, type = "info", toastKey) => {
            const toastId = toastKey || `toast-${Date.now()}`;

            setToastNotifications((prev) => {
                const existing = prev.find((t) => t.id === toastId);
                const newToast = { id: toastId, message, type, duration };

                // Clear existing timer if we're updating a toast
                if (existing) {
                    const oldTimer = toastTimers.current.get(toastId);
                    if (oldTimer) {
                        clearTimeout(oldTimer);
                    }
                }

                // Set new auto-dismiss timer
                if (duration > 0) {
                    const timer = setTimeout(() => {
                        dismissToast(toastId);
                    }, duration);
                    toastTimers.current.set(toastId, timer);
                }

                if (existing) {
                    // Update existing toast
                    return prev.map((t) => (t.id === toastId ? newToast : t));
                } else {
                    // Add new toast
                    return [...prev, newToast];
                }
            });
        },
        [duration, dismissToast]
    );

    // Clear all timers on unmount
    useEffect(() => {
        const currentTimers = toastTimers.current;
        return () => {
            currentTimers.forEach((timer) => clearTimeout(timer));
            currentTimers.clear();
        };
    }, []);

    return { toastNotifications, showToast, dismissToast };
};
