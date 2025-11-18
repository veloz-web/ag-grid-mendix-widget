// src/utils/initialState.ts
import { AGGridContainerProps, AGGridState, PersistedGridState } from "../types";
import { isDateRangeValue, normalizeDateRangeValue, isRelativeDateRangeKey } from "./dateRange";
import {
    getDefaultSortModel,
    getDefaultColumnVisibility,
    getDefaultColumnOrder,
    getDefaultColumnPinned
} from "./state";

const checkIsMobile = (): boolean => {
    return typeof window !== "undefined" && window.innerWidth < 768;
};

const getInitialViewMode = (props: AGGridContainerProps, isMobile: boolean) => {
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

const loadPersistedState = (storageKey: string): PersistedGridState | null => {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;

        // Sanitize filters
        const sanitizedFilters: Record<string, any> = {};
        if (parsed.activeFilters && typeof parsed.activeFilters === "object") {
            for (const [key, value] of Object.entries(parsed.activeFilters)) {
                if (isDateRangeValue(value)) {
                    sanitizedFilters[key] = normalizeDateRangeValue(value);
                } else if (isRelativeDateRangeKey(value)) {
                    sanitizedFilters[key] = value;
                } else if (Array.isArray(value)) {
                    sanitizedFilters[key] = value;
                } else if (
                    typeof value === "string" ||
                    typeof value === "number" ||
                    typeof value === "boolean"
                ) {
                    sanitizedFilters[key] = value;
                }
            }
        }

        // Validate view mode
        const validViews = ["grid", "cards", "list"];
        const viewMode = validViews.includes(parsed.viewMode) ? parsed.viewMode : "grid";

        // Sanitize column pinned state
        const columnPinned: Record<string, any> = {};
        if (parsed.columnPinned && typeof parsed.columnPinned === "object") {
            for (const [colId, pinState] of Object.entries(parsed.columnPinned)) {
                if (pinState === "left" || pinState === "right" || pinState === "none") {
                    columnPinned[colId] = pinState;
                } else {
                    columnPinned[colId] = "none";
                }
            }
        }

        const gridFilterModel =
            parsed.gridFilterModel && typeof parsed.gridFilterModel === "object"
                ? parsed.gridFilterModel
                : null;

        return {
            viewMode,
            activeFilters: sanitizedFilters,
            gridFilterModel,
            globalSearch: typeof parsed.globalSearch === "string" ? parsed.globalSearch : "",
            sortModel: Array.isArray(parsed.sortModel) ? parsed.sortModel : [],
            columnVisibility: parsed.columnVisibility || {},
            columnOrder: Array.isArray(parsed.columnOrder) ? parsed.columnOrder : [],
            columnPinned,
            preferredExportFormat: parsed.preferredExportFormat,
            preferredExportOptions: parsed.preferredExportOptions
        };
    } catch (error) {
        console.warn("[AGGrid] Error loading persisted state:", error);
        return null;
    }
};

export const getInitialState = (props: AGGridContainerProps): AGGridState => {
    const storageKey = `aggrid:${props.name || "default"}`;
    const shouldPersist = props.useLocalStorage !== false;
    const persisted = shouldPersist ? loadPersistedState(storageKey) : null;

    const isMobile = checkIsMobile();
    const initialView = persisted?.viewMode ?? getInitialViewMode(props, isMobile);
    const initialFilters = persisted?.activeFilters ?? {};
    const initialGridFilters = persisted?.gridFilterModel ?? null;
    const initialSearch = persisted?.globalSearch ?? "";
    const initialSort = persisted?.sortModel ?? getDefaultSortModel(props.columns);
    const initialColumnVisibility =
        persisted?.columnVisibility ?? getDefaultColumnVisibility(props.columns);
    const initialColumnOrder = persisted?.columnOrder ?? getDefaultColumnOrder(props.columns);
    const initialColumnPinned = persisted?.columnPinned ?? getDefaultColumnPinned(props.columns);

    const prefersDark =
        typeof window !== "undefined" && window.matchMedia
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
            : false;

    return {
        currentView: initialView,
        isFilterDrawerOpen: false,
        isMobile,
        activeFilters: initialFilters,
        gridFilterModel: initialGridFilters,
        globalSearch: initialSearch,
        sortModel: initialSort,
        columnVisibility: initialColumnVisibility,
        isColumnVisibilityOpen: false,
        isHiddenDrawerOpen: false,
        columnOrder: initialColumnOrder,
        columnPinned: initialColumnPinned,
        prefersDarkScheme: prefersDark,
        toastNotifications: []
    };
};
