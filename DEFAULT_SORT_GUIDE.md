# Default Sort Configuration

## Overview

The AG Grid widget now supports configuring a default sort order for your columns. This ensures that:
1. Data loads with your preferred sorting already applied
2. Users can see which column(s) are sorted (arrows in headers)
3. The filter drawer shows the active sort state
4. Your Mendix data view sort preferences are communicated to users

## Configuration

### Single Column Sort

**Most common use case:** Sort by one column on load.

**Example:** Sort by "Created Date" descending (newest first)

1. Open widget properties → Columns
2. Select "Created Date" column
3. Set **Default Sort** = "Descending"
4. Leave **Sort Priority** empty (or set to 0)
5. Save

Result: Grid loads with "Created Date" sorted descending, showing ↓ arrow in header.

### Multi-Column Sort

**Advanced use case:** Sort by multiple columns (e.g., Status first, then Date).

**Example:** Sort by Status ascending, then by Date descending

1. **Status column:**
   - Default Sort = "Ascending"
   - Sort Priority = 0 (first priority)

2. **Date column:**
   - Default Sort = "Descending"
   - Sort Priority = 1 (second priority)

Result: Grid loads sorted by Status (A→Z), then within each status, by Date (newest→oldest).

**Note:** If you only have one column with Default Sort, you can leave Sort Priority at 999 (the default).

## Properties

### Default Sort
- **Type:** Dropdown
- **Options:**
  - None (default) - No initial sort
  - Ascending - Sort A→Z, 0→9, oldest→newest
  - Descending - Sort Z→A, 9→0, newest→oldest
- **Usage:** Set this to apply initial sort when grid loads

### Sort Priority
- **Type:** Integer
- **Default:** 999 (low priority)
- **Usage:** For multi-column sorting
- **Values:**
  - 0 = First sort column (primary sort)
  - 1 = Second sort column (secondary sort)
  - 2 = Third sort column, etc.
  - 999 = Default (not used in multi-sort, will be ignored if other columns have lower values)
- **Note:** Only needed when multiple columns have Default Sort set

## Common Patterns

### Pattern 1: Date-based Content
**Use case:** Blog posts, news articles, activities

**Configuration:**
- Created Date column: Default Sort = "Descending"

**Result:** Newest items appear first

### Pattern 2: Status-based Workflow
**Use case:** Task lists, requests, orders

**Configuration:**
- Status column: Default Sort = "Ascending", Sort Priority = 0
- Priority column: Default Sort = "Descending", Sort Priority = 1
- Date column: Default Sort = "Descending", Sort Priority = 2

**Result:** Groups by Status, then by Priority within each status, then by Date

### Pattern 3: Alphabetical Listing
**Use case:** Contact lists, product catalogs

**Configuration:**
- Name column: Default Sort = "Ascending"

**Result:** Items sorted A→Z

### Pattern 4: Priority Queue
**Use case:** Support tickets, incident management

**Configuration:**
- Priority column: Default Sort = "Descending", Sort Priority = 0 (High → Low)
- Created Date column: Default Sort = "Ascending", Sort Priority = 1 (Oldest first)

**Result:** High priority items first, oldest high-priority items at the top

## How It Works

### On Grid Load

1. Widget reads column configurations
2. Builds initial sort model from columns with Default Sort ≠ "None"
3. Sorts by Sort Priority (0, 1, 2, etc.)
4. Applies sort to grid when ready
5. Grid shows sort arrows in headers
6. Filter drawer reflects the active sort

### User Interaction

- **Clicking column headers** changes sort (overrides default)
- **Using filter drawer** changes sort
- **Clear All Filters** button resets to default sort
- **Refreshing data** maintains current sort (doesn't reset to default)

### Debug Logging

Check browser console for:
```
[AGGrid] Default sort model: [{colId: "CreatedDate", sort: "desc"}]
[AGGrid] Applying default sort to grid: [{colId: "CreatedDate", sort: "desc"}]
```

## Examples

### Example 1: E-commerce Orders

```
Columns:
- Order Number: sortable, no default sort
- Customer Name: sortable, no default sort
- Order Date: sortable, Default Sort = "Descending"
- Status: sortable, no default sort
- Total: sortable, no default sort
```

**Result:** Orders appear newest-first by default. Users can click any header to re-sort.

### Example 2: Employee Directory

```
Columns:
- Photo: not sortable
- Last Name: sortable, Default Sort = "Ascending", Sort Priority = 0
- First Name: sortable, Default Sort = "Ascending", Sort Priority = 1
- Department: sortable, filterable
- Email: sortable
```

**Result:** Employees sorted by Last Name (A→Z), then First Name (A→Z) for same last names.

### Example 3: Project Tasks

```
Columns:
- Task ID: sortable
- Task Name: sortable
- Status: sortable, filterable, Default Sort = "Ascending", Sort Priority = 0
- Priority: sortable, filterable, Default Sort = "Descending", Sort Priority = 1
- Due Date: sortable, Default Sort = "Ascending", Sort Priority = 2
```

**Result:** 
1. Groups by Status (Pending, In Progress, Done)
2. Within each status, High priority first
3. Within same status+priority, earliest due date first

### Example 4: News Articles

```
Columns:
- Title: sortable, Default Sort = "Ascending"
- Author: sortable
- Published Date: sortable, Default Sort = "Descending"
- Category: sortable, filterable
```

**Wait, two columns with default sort but no priorities?**

If you set Default Sort on multiple columns without Sort Priority:
- The order is determined by column order in the configuration
- First column with default sort = priority 0
- Second column with default sort = priority 1
- And so on...

**Better practice:** Explicitly set Sort Priority to avoid confusion.

## Best Practices

### 1. Match Your Data View Sort
If your Mendix data source has a default sort:
- Configure the same sort in the widget
- This makes the sort visible to users
- Grid header shows sort arrows on load

### 2. Consider User Expectations
Common expectations:
- **Dates:** Newest first (descending)
- **Names:** Alphabetical (ascending)
- **Status:** Logical order (Pending → In Progress → Done)
- **Priority:** Highest first (descending)
- **Numbers/IDs:** Lowest first (ascending)

### 3. Use Multi-Sort Wisely
Good for:
- ✅ Status → Priority → Date (2-3 levels)
- ✅ Last Name → First Name (natural grouping)

Avoid:
- ❌ More than 3 sort levels (too complex)
- ❌ Unrelated columns (Name → Price → Date makes no sense)

### 4. Make It Clear
- Sort by columns users expect
- Use sensible priorities
- Don't hide important sort orders in 3rd or 4th priority

### 5. Test Edge Cases
- Empty data (no rows to sort)
- Single row (sort has no effect)
- Null values (where do they appear?)
- Very large datasets (performance)

## Troubleshooting

### Issue: Default sort not applying

**Check:**
1. Column has "Sortable" = Yes
2. Column has "Default Sort" ≠ "None"
3. Column has a valid attribute assigned
4. Widget was rebuilt after XML changes
5. Browser console shows: `[AGGrid] Default sort model: [...]`

**Debug:**
```javascript
// In browser console
window.aggridDebug.sortModel
```

### Issue: Wrong sort order

**Check:**
1. Sort direction (Ascending vs Descending)
2. Sort Priority values (0, 1, 2, ...)
3. Multiple columns have same priority (conflict)
4. Column attribute returns expected data type

### Issue: Multi-sort not working as expected

**Verify:**
- Each column has unique Sort Priority
- Priorities start at 0 and increment (0, 1, 2, not 1, 5, 10)
- All sorted columns have "Sortable" = Yes

### Issue: Sort arrows don't show on load

**Causes:**
- Grid not loaded yet (wait a moment)
- AG Grid theme CSS not loaded
- Column "Sortable" = No (can't show arrow)

**Check console for:**
```
[AGGrid] Applying default sort to grid: [...]
```

## Migration from Previous Versions

### If you don't set Default Sort
- Behavior: Same as before (no default sort)
- Grid loads with data in source order
- No changes needed to existing widgets

### If you previously relied on Mendix data view sort
- **Before:** Sort was invisible to users
- **After:** Configure Default Sort to match → users see sort arrows
- **Benefit:** Clear communication of sort order

## Advanced: Clearing Default Sort

Users can change the sort, but how do they get back to default?

### Option 1: Clear All Filters Button
In the filter drawer, "Clear All Filters" also resets sort to default.

### Option 2: Manual Reset
Click the sorted column header twice:
- First click: Reverses sort
- Second click: Removes sort (back to unsorted or default)

### Option 3: Programmatic
If you add a custom button:
```typescript
// Reset to default sort
gridApi.setSortModel([
    { colId: 'Status', sort: 'asc' },
    { colId: 'Date', sort: 'desc' }
]);
```

## Summary

**Quick setup:**
1. Choose column to sort by default
2. Set "Default Sort" = Ascending or Descending
3. For multi-sort, set "Sort Priority" (0, 1, 2, ...)
4. Save and rebuild widget

**Result:**
- Grid loads pre-sorted
- Sort arrows visible in headers
- Filter drawer shows active sort
- Users understand data ordering

**Common configs:**
- Single sort by Date desc (newest first)
- Multi-sort by Status asc, Priority desc (workflow)
- Multi-sort by LastName asc, FirstName asc (directory)
