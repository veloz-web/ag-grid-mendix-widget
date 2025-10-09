# Quick Setup Guide: Sort & Filter Configuration

## Recent Updates

✨ **NEW:** Default Sort configuration - Set initial sort order when grid loads! See DEFAULT_SORT_GUIDE.md

## The Issues

### Issue 1: Sort Not Applying from Drawer
**Symptom:** You select sort in filter drawer but grid doesn't show sort arrows or update.

### Issue 2: Filter Columns Not Showing
**Symptom:** You marked columns "Include in Filters = Yes" but they don't appear in filter drawer.

## Quick Fix Steps

### For Both Issues: Redeploy Widget

1. **Rebuild the widget** (I just did this with debug logging):
   ```bash
   cd /home/anthonyd/Git/ag-grid-mendix-widget
   npm run release
   ```
   ✅ Done - the widget now has debug logging

2. **Copy to your Mendix project:**
   ```bash
   cp dist/1.0.0/mendix.AGGrid.mpk /path/to/your/mendix/project/widgets/
   ```

3. **Force refresh in Studio Pro:**
   - Delete the widget from your page
   - Press **F4** to synchronize
   - Re-add the widget
   - Configure it again

### Configure Filters Correctly

For columns you want to filter (like Status fields):

1. Open widget properties → Columns
2. Select the column (e.g., "Status")
3. **Check these boxes:**
   - ✅ **Filter** = Yes
   - ✅ **Include in Filters** = Yes
   - ✅ **Sortable** = Yes (if you want to sort too)
   - ✅ **Include in Sort Options** = Yes (if you want to sort too)
4. Save

**Which columns to mark for filters:**
- ✅ Status (Pending/Approved/Rejected)
- ✅ Categories (Electronics/Clothing/etc)
- ✅ Priority (High/Medium/Low)
- ✅ Department, Role, Type fields
- ✅ Boolean fields (Active/Inactive)
- ❌ NOT: IDs, names, descriptions, dates, emails (too many unique values)

### Configure Sort Correctly

For columns you want in the sort dropdown:

1. Open widget properties → Columns
2. Select the column
3. **Check these boxes:**
   - ✅ **Sortable** = Yes
   - ✅ **Include in Sort Options** = Yes
4. **(Optional) Set Default Sort:**
   - **Default Sort** = "Ascending" or "Descending" to pre-sort on load
   - **Sort Priority** = 0 (for primary sort), 1 (secondary), etc. if using multi-sort
   - See DEFAULT_SORT_GUIDE.md for details
5. Save

### Quick Example: Default Sort Setup

**Scenario:** You want orders to load sorted by newest first.

**Configuration:**
- Order Date column:
  - Sortable: ✅ Yes
  - Include in Sort Options: ✅ Yes
  - **Default Sort:** Descending
  - Sort Priority: (leave empty for single sort)

**Result:** Grid loads with Order Date sorted descending, showing ↓ arrow in header.

## Test with Debug Logs

After redeploying the widget, open your browser console (F12) and look for:

```
[AGGrid] Filterable columns: [...]
```
This shows which columns are marked for filtering.

```
[GridView] Column definitions: [...]
```
This shows all columns with their field names and sortable status.

```
[AGGrid] applySortFromDrawer called: {columnId: "Status", direction: "asc"}
[AGGrid] Applying sort to grid API
[AGGrid] Grid sort model after applying: [{colId: "Status", sort: "asc"}]
```
This shows sort is being applied correctly.

## Common Mistakes

### Mistake 1: Column ID Mismatch
The column's "field" in the grid must match the "colId" in the sort model.
- Both use `col.attribute?.id`
- Check the debug logs to verify they match

### Mistake 2: Grid Not Ready
If you open the filter drawer before the grid loads, the sort won't apply.
- Look for warning: `Grid API not available yet`
- Close and reopen the drawer after grid loads

### Mistake 3: Wrong Properties Checked
- **Include in Filters** = Shows in filter drawer dropdowns
- **Filter** = Enables filtering (grid level)
- **Include in Sort Options** = Shows in sort dropdown
- **Sortable** = Enables sorting (grid level)

You need BOTH properties checked for each feature to work.

### Mistake 4: No Data
If the data source is empty or columns return null/undefined:
- Filter dropdowns will be empty
- Sort won't show values

## Expected Behavior After Fix

### Filter Drawer Should Show:

1. **Global Search** - Search across all columns
2. **Sort Section:**
   - "Sort By Column" dropdown
   - Shows all columns where "Include in Sort Options" = Yes
   - "Ascending" and "Descending" buttons
3. **Column Filters Section:**
   - Shows all columns where "Include in Filters" = Yes
   - Each has dropdown with distinct values from data
   - Clear button (X) for active filters

### Grid Should Show:

1. **Sort arrows in headers** when sorted
2. **Filtered data** when filter applied
3. **Sync between grid and drawer:**
   - Click column header → drawer sort updates
   - Change drawer sort → grid header arrow updates

## Next Steps

1. ✅ Rebuild widget (done)
2. 📦 Copy `dist/1.0.0/mendix.AGGrid.mpk` to your project
3. 🔄 Remove and re-add widget in Studio Pro
4. ⚙️ Configure columns:
   - For status/category fields: Check "Include in Filters"
   - For sortable fields: Check "Include in Sort Options"
5. 🧪 Test and check browser console for debug logs
6. 📋 Share console logs if issues persist

## Files Created

I've created these helpful docs:
- **SORT_FILTER_TROUBLESHOOTING.md** - Detailed debugging guide
- **DEPLOYMENT_STEPS.md** - How to deploy widget updates
- **COLUMN_WIDTH_CONFIGURATION.md** - How to use new flexible widths

## Still Having Issues?

Check the browser console after testing and share:
1. The `[AGGrid]` and `[GridView]` log lines
2. Which columns you marked for filtering
3. Screenshot of your column configuration in Studio Pro

The debug logs will tell us exactly what's happening!
