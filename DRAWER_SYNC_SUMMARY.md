# Filter Drawer Grid State Synchronization

## Overview
The filter drawer now properly synchronizes with the grid's current state when opened, ensuring that any sorts applied via column header clicks are reflected in the drawer controls.

## Problem Solved
Previously, if a user:
1. Clicked a column header to sort the grid
2. Then opened the filter drawer

The drawer would not show which column was sorted or in which direction. This created a confusing UX where the grid showed one sort state but the drawer controls showed another (or no) state.

## Solution Implemented

### Grid State Sync on Drawer Open
When the filter drawer opens, it now:
1. Queries the AG Grid API for the current sort model
2. Updates the component state with this current sort
3. Opens the drawer with synchronized state

### Code Changes

#### AGGrid.tsx - toggleFilterDrawer Method
```typescript
private toggleFilterDrawer = () => {
    // If opening the drawer, sync state with current grid state
    if (!this.state.isFilterDrawerOpen && this.gridApi) {
        const currentSortModel = this.gridApi.getSortModel();
        console.log('[AGGrid] Opening filter drawer, syncing sort from grid:', currentSortModel);
        this.setState({ 
            sortModel: currentSortModel,
            isFilterDrawerOpen: true 
        });
    } else {
        this.setState({ isFilterDrawerOpen: !this.state.isFilterDrawerOpen });
    }
};
```

**Key Points:**
- Only syncs when **opening** the drawer (`!this.state.isFilterDrawerOpen`)
- Checks that `gridApi` is available
- Uses `getSortModel()` to get current grid state
- Updates state before setting `isFilterDrawerOpen: true`
- Includes debug logging for troubleshooting

#### FilterDrawer.tsx - useEffect Hook
```typescript
// Sync with props when drawer opens or props change
useEffect(() => {
    setLocalFilters(activeFilters);
    setLocalSearch(globalSearch);
    setLocalSort(sortModel);
}, [isOpen, activeFilters, globalSearch, sortModel]);
```

**Key Points:**
- Already existed, but now receives updated `sortModel` from parent
- Triggers when `isOpen` changes (drawer opens)
- Syncs all state: filters, search, and **sort**
- Sets local state that controls the drawer UI

## User Experience Flow

### Example 1: Column Header Sort → Open Drawer
```
1. User clicks "Status" column header
   → Grid sorts by Status Ascending
   → Grid state: sortModel = [{ colId: 'status', sort: 'asc' }]

2. User clicks filter button to open drawer
   → toggleFilterDrawer() called
   → Gets current sort from grid: [{ colId: 'status', sort: 'asc' }]
   → Updates state.sortModel
   → Opens drawer with isFilterDrawerOpen: true

3. FilterDrawer receives props with sortModel: [{ colId: 'status', sort: 'asc' }]
   → useEffect fires (isOpen changed from false to true)
   → setLocalSort([{ colId: 'status', sort: 'asc' }])
   → Drawer UI shows:
      - Sort dropdown: "Status" selected
      - Direction buttons: "Ascending" active
```

### Example 2: Multiple Column Header Clicks → Open Drawer
```
1. User clicks "Name" column header → Sorts by Name Asc
2. User clicks "Name" column header again → Sorts by Name Desc
3. User clicks "Date" column header → Sorts by Date Asc
   → Grid state: sortModel = [{ colId: 'date', sort: 'asc' }]

4. User opens filter drawer
   → Syncs with grid
   → Drawer shows: "Date" selected, "Ascending" active
   → User sees current grid state reflected accurately
```

### Example 3: Drawer Changes → Apply → Reopen Drawer
```
1. Grid sorted by "Name" Asc (via column header)
2. User opens drawer → Shows "Name" Asc
3. User changes to "Status" Desc
4. User clicks "Apply Changes"
   → Grid updates to Status Desc
   → Drawer closes
   → state.sortModel = [{ colId: 'status', sort: 'desc' }]

5. User reopens drawer later
   → Syncs with grid (Status Desc)
   → Shows "Status" selected, "Descending" active
   → Consistent state maintained
```

## Benefits

### 1. Consistent UI State
- What you see in the grid matches what you see in the drawer
- No confusion about current sort state
- Users can modify existing sorts with full context

### 2. Seamless Integration
- Column header sorting and drawer sorting work together
- Either method can be used interchangeably
- State is always synchronized

### 3. Better UX for Sort Modification
- User sorts via column header (quick, familiar)
- Opens drawer to see current state
- Can modify or add additional filters while seeing current sort
- Can change sort direction or column from drawer

### 4. Debugging Support
- Console logging shows sync operations
- Easy to trace state flow
- Can verify grid state is captured correctly

## Technical Details

### State Flow
```
Grid Sort (via column header)
    ↓
AG Grid API: setSortModel()
    ↓
Grid renders with new sort
    ↓
User clicks filter button
    ↓
toggleFilterDrawer() called
    ↓
gridApi.getSortModel() → current sort state
    ↓
this.setState({ sortModel: currentSort, isFilterDrawerOpen: true })
    ↓
FilterDrawer receives updated props
    ↓
useEffect fires (isOpen = true)
    ↓
setLocalSort(sortModel) → updates drawer controls
    ↓
Drawer UI reflects grid state
```

### Timing Considerations
- Sync happens **before** drawer opens
- `setState` is batched by React
- Both `sortModel` and `isFilterDrawerOpen` update together
- useEffect in FilterDrawer fires after component receives new props
- No race conditions because state update is synchronous

### Edge Cases Handled

#### 1. Grid API Not Ready
```typescript
if (!this.state.isFilterDrawerOpen && this.gridApi) {
    // Only sync if gridApi exists
}
```
- Checks `this.gridApi` exists before calling `getSortModel()`
- Falls back to current state if API not available

#### 2. Closing the Drawer
```typescript
} else {
    this.setState({ isFilterDrawerOpen: !this.state.isFilterDrawerOpen });
}
```
- Simple toggle when closing
- No need to sync state when closing

#### 3. Multiple Sorts (AG Grid Enterprise)
- `getSortModel()` returns array of sorts
- Currently widget supports single sort
- Will work with multi-sort if enabled in future

## Testing Checklist

### Manual Testing Steps
- [ ] Sort grid by clicking column header (ascending)
- [ ] Open filter drawer → Verify correct column and direction shown
- [ ] Close drawer without changes
- [ ] Click same column header again (descending)
- [ ] Open drawer → Verify direction changed to descending
- [ ] Click different column header
- [ ] Open drawer → Verify new column selected
- [ ] Make changes in drawer and apply
- [ ] Reopen drawer → Verify applied changes are shown
- [ ] Clear all filters
- [ ] Verify drawer shows no sort selected

### Automated Testing Considerations
```typescript
// Test: Drawer syncs with grid sort on open
it('should sync sortModel from grid when opening drawer', () => {
    // Setup: Grid has sort applied
    const gridApi = { getSortModel: () => [{ colId: 'name', sort: 'asc' }] };
    
    // Action: Open drawer
    component.toggleFilterDrawer();
    
    // Assert: State updated with grid sort
    expect(component.state.sortModel).toEqual([{ colId: 'name', sort: 'asc' }]);
    expect(component.state.isFilterDrawerOpen).toBe(true);
});
```

## Future Enhancements

### 1. Sync Filters as Well
- Currently only syncs sort
- Could sync active filters if grid filtering is implemented
- Would require tracking filter state in grid

### 2. Visual Indicator
- Show indicator on filter button if sorts/filters are active
- Already exists: badge shows number of active filters
- Could enhance to show sort status too

### 3. Performance Optimization
- `getSortModel()` is already performant
- State update is batched by React
- No optimization needed currently

### 4. Multi-Column Sort Support
- AG Grid supports multi-column sorting
- Current implementation handles array of sorts
- Would need UI updates in drawer to show multiple sorts

## Related Files
- `/src/AGGrid.tsx` - Main component with toggleFilterDrawer method
- `/src/components/FilterDrawer.tsx` - Drawer component with useEffect sync
- `/APPLY_CHANGES_PATTERN.md` - Documentation on Apply Changes button pattern
- `/SORT_INTERFACE.md` - Documentation on sort functionality

## Commit Message Suggestion
```
feat: Sync filter drawer with grid sort state on open

When the filter drawer opens, it now queries the AG Grid API
to get the current sort model and updates the drawer controls
to reflect any sorts applied via column header clicks.

This ensures the drawer always shows the current grid state,
providing a consistent user experience whether sorting via
column headers or the filter drawer.

Changes:
- Update toggleFilterDrawer to call getSortModel on open
- Set sortModel state before opening drawer
- Add debug logging for troubleshooting
- Update documentation with sync behavior
```
