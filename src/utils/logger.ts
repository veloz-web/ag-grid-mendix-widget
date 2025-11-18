const DEBUG_STORAGE_KEY = "aggrid:debugLogging";

const isDebugFlagEnabled = (): boolean => {
    if (typeof window === "undefined") {
        return false;
    }

    // Global escape hatch (set via browser console): window.__AGGRID_DEBUG_LOGS__ = true
    if ((window as unknown as { __AGGRID_DEBUG_LOGS__?: boolean }).__AGGRID_DEBUG_LOGS__) {
        return true;
    }

    try {
        const stored = window.localStorage?.getItem(DEBUG_STORAGE_KEY);
        if (stored != null) {
            return stored === "true";
        }
    } catch {
        // Ignore storage access issues
    }

    // Optional query param toggle: ?aggridDebug=true
    if (typeof window.location?.search === "string") {
        return window.location.search.includes("aggridDebug=true");
    }

    return false;
};

export const debugLog = (...args: unknown[]): void => {
    if (!isDebugFlagEnabled()) {
        return;
    }

    if (typeof console !== "undefined" && typeof console.log === "function") {
        console.log(...args);
    }
};

export const setDebugLogging = (enabled: boolean): void => {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(DEBUG_STORAGE_KEY, enabled ? "true" : "false");
    } catch {
        // Ignore storage errors
    }
};
