# Troubleshooting Guide: Sort & Filter Issues

## Issue 1: Sort from Drawer Not Applying to Grid

### Symptoms
- User selects sort column and direction in filter drawer
- Grid doesn't show sort arrow indicators in column headers
- Data may or may not actually be sorted

### Root Cause Analysis

The sort logic chain:
1. FilterDrawer calls `onSortChange(columnId, direction)`
2. AGGrid.tsx `applySortFromDrawer` sets state and calls `gridApi.setSortModel()`
3. Grid should update and show sort indicators

### Debugging Steps

**Step 1: Verify Column IDs Match**

The sort model uses `colId` which must match the `field` property in ColDef.

Check in browser console:
```javascript
// In AGGrid.tsx applySortFromDrawer, add console.log:
console.log('Setting sort model:', columnId, direction);

// In GridView.tsx getColumnDefs, add console.log:
console.log('Column field:', col.attribute?.id);
```

**Step 2: Check if gridApi Exists**

The `gridApi` is set when `onGridReady` fires. If sort is called before grid is ready, it will fail silently.

Add to AGGrid.tsx:
```typescript
private applySortFromDrawer = (columnId: string, direction: 'asc' | 'desc' | null) => {
    console.log('applySortFromDrawer called:', { columnId, direction, gridApiExists: !!this.gridApi });
    
    const newSortModel = direction 
        ? [{ colId: columnId, sort: direction }]
        : [];
    
    this.setState({ sortModel: newSortModel });
    
    // Apply to grid if it's ready
    if (this.gridApi) {
        console.log('Applying sort to grid:', newSortModel);
        this.gridApi.setSortModel(newSortModel);
    } else {
        console.warn('Grid API not available yet');
    }
};
```

**Step 3: Verify Sort Indicator Shows**

AG Grid should show sort arrows when sorted. If data is sorted but no arrows, check:
- Column `sortable: true` in ColDef
- defaultColDef not overriding column sortable property
- AG Grid theme CSS loaded properly

### Solution

If column IDs don't match or sortable is false, the fix is in GridView.tsx:

```typescript
const colDef: ColDef = {
    headerName: col.header?.value || "",
    field: col.attribute?.id || "",  // This must match the colId in sort model
    sortable: col.sortable,          // Must be true for sorting to work
    // ... rest
};
```

## Issue 2: Filter Columns Not Showing in Drawer

### Symptoms
- Columns have "Include in Filters" set to "Yes" in Studio Pro
- Filter drawer doesn't show those columns
- No dropdown filters available

### Root Cause Analysis

The filter chain:
1. AGGrid.tsx `getFilterableColumns()` filters `columns.filter(col => col.includeInFilters)`
2. Passed to FilterDrawer as `filterableColumns` prop
3. FilterDrawer maps over filterableColumns to create dropdowns

### Debugging Steps

**Step 1: Check Property Value**

In AGGrid.tsx render method, add:
```typescript
console.log('All columns:', this.props.columns.map(c => ({ 
    header: c.header?.value, 
    includeInFilters: c.includeInFilters 
})));
console.log('Filterable columns:', filterableColumns.map(c => c.header?.value));
```

**Step 2: Verify XML Property**

Check AGGrid.xml has:
```xml
<property key="includeInFilters" type="boolean" defaultValue="false">
    <caption>Include in Filters</caption>
    <description>Make this column available in the filter drawer</description>
</property>
```

**Step 3: Check TypeScript Types**

Verify typings/AGGridProps.d.ts has:
```typescript
export interface ColumnsType {
    // ... other properties
    includeInFilters: boolean;
}
```

If not, run `npm run release` to regenerate types.

**Step 4: Verify Studio Pro Setting**

1. Edit widget in Studio Pro
2. Open Columns configuration
3. For each column, check "Include in Filters" is checked
4. Save and re-run

### Solution

If `includeInFilters` is undefined or always false:

1. **Rebuild the widget:**
   ```bash
   cd /home/anthonyd/Git/ag-grid-mendix-widget
   npm run release
   ```

2. **Re-deploy to Mendix:**
   - Copy `dist/1.0.0/mendix.AGGrid.mpk` to your project
   - Delete widget instance from page
   - Press F4 to sync
   - Re-add widget and configure columns

3. **Check each column setting:**
   - Open widget properties
   - Click on Columns
   - For status/category columns, set "Include in Filters" to Yes
   - Save

## Common Configuration Mistakes

### Mistake 1: Wrong Columns Marked for Filtering

**❌ Don't mark these for filtering:**
- Long text fields (descriptions, addresses)
- Unique IDs
- Timestamps (too many distinct values)

**✅ Do mark these for filtering:**
- Status fields (Pending, Approved, Rejected)
- Categories/Types
- Boolean fields (Active/Inactive)
- Enum fields
- Any field with < 50 distinct values

### Mistake 2: Not Marking Columns for Sorting

The drawer only shows columns where `includeInSort: true`. Check this property too.

### Mistake 3: Column Not Sortable at All

If `sortable: false` in column config, it won't appear in sort dropdown AND won't have sort arrows in grid header.

## Testing Checklist

After applying fixes, test:

### Sort Testing
- [ ] Open filter drawer
- [ ] Select a column from "Sort By Column" dropdown
- [ ] Click "Ascending" - Grid header should show ↑ arrow
- [ ] Click "Descending" - Grid header should show ↓ arrow
- [ ] Data should be sorted correctly
- [ ] Clicking column header should update drawer sort selection
- [ ] Select "No sorting" - arrows should disappear

### Filter Testing
- [ ] Open filter drawer
- [ ] Should see "Column Filters" section
- [ ] Each column with "Include in Filters" = Yes should appear
- [ ] Each dropdown should show distinct values from data
- [ ] Selecting a value should filter grid to show only matching rows
- [ ] Clear button (X) should reset that filter
- [ ] "Clear All Filters" should reset everything

## Quick Fix Code

If you want to force-enable debugging, add this to AGGrid.tsx render method:

```typescript
// DEBUG: Log sort and filter state
if (typeof window !== 'undefined') {
    (window as any).aggridDebug = {
        sortModel: this.state.sortModel,
        activeFilters: this.state.activeFilters,
        filterableColumns: filterableColumns.map(c => c.header?.value),
        sortableColumns: sortableColumns.map(c => c.header?.value),
        gridApiExists: !!this.gridApi
    };
}
```

Then in browser console:
```javascript
// Check debug info
window.aggridDebug

// Manually trigger sort
window.aggridDebug.gridApi?.setSortModel([{ colId: 'Status', sort: 'asc' }])
```

## Need More Help?

If issues persist:
1. Share browser console logs
2. Export widget configuration from Studio Pro
3. Check which Mendix version you're using
4. Verify AG Grid CSS is loading (check Network tab)
