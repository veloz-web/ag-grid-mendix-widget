export interface DateRangeValue {
    from?: string;
    to?: string;
}

export type RelativeDateRangeKey =
    | "last7Days"
    | "last14Days"
    | "last30Days"
    | "last60Days"
    | "last90Days"
    | "last180Days"
    | "last365Days";

export interface RelativeDateRangeOption {
    key: RelativeDateRangeKey;
    label: string;
    days: number;
}

const DATE_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

const formatDateParts = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const cloneAtStartOfDay = (date: Date): Date => {
    const clone = new Date(date.getTime());
    clone.setHours(0, 0, 0, 0);
    return clone;
};

const RELATIVE_DATE_RANGE_DEFINITIONS: RelativeDateRangeOption[] = [
    { key: "last7Days", label: "Last 7 days", days: 7 },
    { key: "last14Days", label: "Last 14 days", days: 14 },
    { key: "last30Days", label: "Last 1 month", days: 30 },
    { key: "last60Days", label: "Last 2 months", days: 60 },
    { key: "last90Days", label: "Last 3 months", days: 90 },
    { key: "last180Days", label: "Last 6 months", days: 180 },
    { key: "last365Days", label: "Last 12 months", days: 365 }
];

export const relativeDateRangeOptions: RelativeDateRangeOption[] = RELATIVE_DATE_RANGE_DEFINITIONS;

export const isRelativeDateRangeKey = (value: unknown): value is RelativeDateRangeKey => {
    if (typeof value !== "string") {
        return false;
    }
    return RELATIVE_DATE_RANGE_DEFINITIONS.some((option) => option.key === value);
};

const subtractDays = (date: Date, days: number): Date => {
    const result = cloneAtStartOfDay(date);
    result.setDate(result.getDate() - (days - 1));
    return result;
};

export const resolveRelativeDateRange = (
    key: RelativeDateRangeKey,
    referenceDate: Date = new Date()
): DateRangeValue | null => {
    const definition = RELATIVE_DATE_RANGE_DEFINITIONS.find((option) => option.key === key);
    if (!definition) {
        return null;
    }

    const end = cloneAtStartOfDay(referenceDate);
    let start = cloneAtStartOfDay(referenceDate);

    if (definition.days != null) {
        start = subtractDays(referenceDate, definition.days);
    }

    return {
        from: formatDateParts(start),
        to: formatDateParts(end)
    };
};

export const normalizeDateInputValue = (value?: string | null): string => {
    if (!value) {
        return "";
    }

    if (DATE_PATTERN.test(value)) {
        return value.slice(0, 10);
    }

    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
        return "";
    }

    return formatDateParts(parsed);
};

export const isDateRangeValue = (value: unknown): value is DateRangeValue => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    return "from" in candidate || "to" in candidate;
};

export const normalizeDateRangeValue = (
    value?: DateRangeValue | null
): DateRangeValue | null => {
    if (!value) {
        return null;
    }

    const from = normalizeDateInputValue(value.from ?? null);
    const to = normalizeDateInputValue(value.to ?? null);

    const normalized: DateRangeValue = {};
    if (from) {
        normalized.from = from;
    }
    if (to) {
        normalized.to = to;
    }

    return normalized.from || normalized.to ? normalized : null;
};

export const toComparableDate = (
    value: string | Date | undefined | null
): number | null => {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
        return null;
    }

    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};
