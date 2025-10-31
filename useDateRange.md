# Column Date Range Filtering

The widget now supports date range filtering per column. Enable it in the column configuration (Filter Tab → Use Date Range Picker). When the attribute type is `DateTime` or a date formatter/date-inference marks the column as a date, the filter drawer swaps the single-value dropdown for two `<input type="date">` controls. The grid applies the selection as an inclusive range and persists it in local storage.

## UI Behavior

- Both inputs optional. Leaving either blank creates an open-ended range.
- Clear the range via the inline "Clear range" link.
- The existing dropdown path remains for non-date columns or when the flag is disabled.

## Persistence and Data Flow

1. The Filter Drawer stores the range as `{ from?: string; to?: string }` with `YYYY-MM-DD` values.
2. `applyFiltersFromDrawer` sanitizes the range using `normalizeDateRangeValue`. Empty ranges are dropped.
3. `applyFiltersToGrid` maps ranges to AG Grid `agDateColumnFilter` models:
   - both endpoints → `inRange`
   - start only → `greaterThanOrEqual`
   - end only → `lessThanOrEqual`
4. `onFilterChanged` converts filter state back into `{ from, to }` for local storage.
5. Non-grid views (`getFilteredData`) reuse the same range to filter manually using day-level comparisons.

## Column Definition Changes

When `useDateRange` is `true`, `mapMendixColumnToColDef` sets the filter to `agDateColumnFilter`, provides an inclusive comparator, and optionally enables floating filters.

## CSS Additions

`src/ui/AGGrid.css` includes `.filter-date-range`, `.filter-date-field`, and `.clear-filter-link` for layout and interactions.

## Notes & Edge Cases

- UI only renders when the attribute is `DateTime` or the column is inferred as a date based on formatter/values. Otherwise, the legacy path stays intact.
- `normalizeDateInputValue` drops invalid values; range inputs refuse malformed entries.
- As with other grid filters, local-storage persistence is gated by `useLocalStorage`.
- The range is inclusive of both start and end dates for grid and non-grid rendering modes.
