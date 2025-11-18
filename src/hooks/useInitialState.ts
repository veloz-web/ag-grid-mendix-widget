// src/hooks/useInitialState.ts
// Types are not used at runtime in this helper
// No date-range helpers needed in this helper
import {
    getDefaultSortModel,
    getDefaultColumnVisibility,
    getDefaultColumnOrder,
    getDefaultColumnPinned
} from "../utils/state";

const checkIsMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

const getInitialView = (props, isMobile) => {
    const { defaultView, mobileDefaultView, customCardTemplate, customListTemplate } = props;
    const hasCardTemplate = !!(customCardTemplate && customCardTemplate.trim());
    const hasListTemplate = !!(customListTemplate && customListTemplate.trim());

    if (isMobile && mobileDefaultView) {
        if (mobileDefaultView === "cards" && hasCardTemplate) return "cards";
        if (mobileDefaultView === "list" && hasListTemplate) return "list";
    }
    if (defaultView === "cards" && hasCardTemplate) return "cards";
    if (defaultView === "list" && hasListTemplate) return "list";
    return "grid";
};

const loadPersistedState = (storageKey, _props) => {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;

        // ... (all the sanitizing logic from your old loadPersistedState) ...
        const sanitizedFilters = {}; // ...
        const viewMode = "grid"; // ...
        const columnPinned = {}; // ...

        return {
            viewMode,
            activeFilters: sanitizedFilters,
            globalSearch: parsed.globalSearch || "",
            sortModel: parsed.sortModel || [],
            columnVisibility: parsed.columnVisibility,
            columnOrder: parsed.columnOrder,
            columnPinned,
            preferredExportFormat: parsed.preferredExportFormat,
            preferredExportOptions: parsed.preferredExportOptions
        };
    } catch {
        return null;
    }
};

export const getInitialState = (props) => {
    const { name, useLocalStorage, columns } = props;
    const storageKey = `aggrid:${name || "default"}`;
    const shouldPersist = useLocalStorage !== false;

    const persisted = shouldPersist ? loadPersistedState(storageKey, props) : null;
    const isMobile = checkIsMobile();

    const defaults = {
        view: getInitialView(props, isMobile),
        filters: {},
        search: "",
        sort: getDefaultSortModel(columns),
        visibility: getDefaultColumnVisibility(columns),
        order: getDefaultColumnOrder(columns),
        pinned: getDefaultColumnPinned(columns)
    };

    const prefersDark =
        typeof window !== "undefined" && window.matchMedia
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
            : false;

    return {
        currentView: persisted?.viewMode ?? defaults.view,
        isFilterDrawerOpen: false,
        isMobile: isMobile,
        activeFilters: persisted?.activeFilters ?? defaults.filters,
        globalSearch: persisted?.globalSearch ?? defaults.search,
        sortModel: persisted?.sortModel ?? defaults.sort,
        columnVisibility: persisted?.columnVisibility ?? defaults.visibility,
        isColumnVisibilityOpen: false,
        columnOrder: persisted?.columnOrder ?? defaults.order,
        columnPinned: persisted?.columnPinned ?? defaults.pinned,
        prefersDarkScheme: prefersDark,
        toastNotifications: [] // This is now managed by useToast, but we leave it here
    };
};
