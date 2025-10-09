# Apply Changes Pattern Documentation

## Overview
The FilterDrawer now implements an "Apply Changes" pattern where users can make multiple filter, search, and sort selections, and then apply them all at once with a single button click.

## User Experience

### Previous Behavior (Immediate Updates)
- Changes were applied immediately as users interacted with controls
- Could cause race conditions and feedback loops
- Sort toggle would sometimes not update properly
- No way to experiment with settings before applying

### New Behavior (Staged Updates)
- When drawer opens, it syncs with the current grid state (including sorts from column header clicks)
- All changes are staged locally in the drawer
- Nothing updates in the grid until user clicks "Apply Changes"
- Users can experiment freely, seeing their selections
- Changes can be discarded by closing drawer without applying
- "Clear All" resets all local selections

## Button Behavior

### Apply Changes Button
- **Location**: Bottom right of filter drawer
- **Style**: Primary blue (#1976d2)
- **Action**: Applies all staged filters, search, and sort to the grid
- **Side Effect**: Automatically closes the drawer after applying
- **Implementation**: Calls `onApplyFilters(localFilters, localSearch, localSort)`

### Clear All Button
- **Location**: Bottom left of filter drawer
- **Style**: Secondary outline (red border)
- **Action**: Clears all local selections (filters, search, sort)
- **Side Effect**: Also calls `onClearFilters()` to clear grid immediately
- **Implementation**: Resets all local state and grid state

## Technical Implementation

### FilterDrawer Component

#### Local State
```typescript
const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
const [localSearch, setLocalSearch] = useState<string>('');
const [localSort, setLocalSort] = useState<SortModelItem[]>([]);
```

#### State Synchronization
```typescript
useEffect(() => {
    if (isOpen) {
        // Sync local state with props when drawer opens
        setLocalFilters(activeFilters);
        setLocalSearch(globalSearch);
        setLocalSort(sortModel);
    }
}, [isOpen, activeFilters, globalSearch, sortModel]);
```

#### Apply Handler
```typescript
const handleApply = () => {
    onApplyFilters(localFilters, localSearch, localSort);
    onClose();
};
```

#### Clear Handler
```typescript
const handleClear = () => {
    setLocalFilters({});
    setLocalSearch('');
    setLocalSort([]);
    onClearFilters();
};
```

### AGGrid Component

#### Toggle Filter Drawer (with Grid Sync)
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

This ensures that if a user has sorted by clicking a column header in the grid, when they open the filter drawer, the sort controls will reflect the current grid state.

#### Batch Apply Method
```typescript
private applyFiltersFromDrawer = (
    filters: { [key: string]: any }, 
    search: string, 
    sort: Array<{ colId: string; sort: 'asc' | 'desc' }>
) => {
    // Set flag to prevent feedback loop
    this.isSettingSortProgrammatically = true;
    
    // Apply sort to grid
    if (this.gridApi) {
        this.gridApi.setSortModel(sort);
    }
    
    // Update state with all changes at once
    this.setState({ 
        activeFilters: filters,
        globalSearch: search,
        sortModel: sort
    }, () => {
        // Clear flag after state update
        setTimeout(() => {
            this.isSettingSortProgrammatically = false;
        }, 100);
    });
};
```

#### FilterDrawer Props
```typescript
<FilterDrawer
    isOpen={isFilterDrawerOpen}
    filterableColumns={filterableColumns}
    sortableColumns={columns.filter(col => col.sortable)}
    activeFilters={activeFilters}
    globalSearch={globalSearch}
    sortModel={sortModel}
    getDistinctValues={this.getDistinctValuesForColumn}
    onClose={this.toggleFilterDrawer}
    onApplyFilters={this.applyFiltersFromDrawer}
    onClearFilters={this.clearFilters}
/>
```

## Benefits

### 1. Eliminates Race Conditions
- No more competing updates between drawer and grid
- Single source of truth: local state until applied
- Programmatic flag prevents feedback loops

### 2. Better User Experience
- Users can experiment with filter combinations
- Preview selections before committing
- Discard changes by closing drawer
- Clear feedback on what will be applied

### 3. Simpler Code
- No need for complex synchronization logic
- Reduced number of callback props
- Single batch update method instead of three separate methods
- Easier to maintain and debug

### 4. Performance
- Reduces number of grid updates
- Single batch update instead of multiple individual updates
- Less re-rendering of grid during filter configuration

## CSS Styling

### Footer Layout
```css
.filter-drawer-footer {
    padding: 16px 20px;
    border-top: 1px solid #ddd;
    background: #f9f9f9;
    display: flex;
    gap: 12px;
}
```

### Clear All Button (Secondary)
```css
.clear-filters-btn {
    flex: 1;
    padding: 10px;
    border: 1px solid #d32f2f;
    background: white;
    color: #d32f2f;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.clear-filters-btn:hover {
    background: #d32f2f;
    color: white;
}
```

### Apply Changes Button (Primary)
```css
.apply-filters-btn {
    flex: 1;
    padding: 10px;
    border: 1px solid #1976d2;
    background: #1976d2;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.apply-filters-btn:hover {
    background: #1565c0;
    border-color: #1565c0;
}
```

## Usage Example

### Scenario 1: User sorts via column header, then opens drawer
1. User clicks "Name" column header in grid → Grid sorts by Name Ascending
2. User opens filter drawer
3. Drawer automatically syncs and shows "Name" selected with "Ascending" direction
4. User can now add additional filters or change the sort
5. Clicks "Apply Changes" → All changes applied

### Scenario 2: User makes multiple changes in drawer
1. User opens filter drawer
2. Types search term "John" → staged locally, grid unchanged
3. Selects sort by "Name" Ascending → staged locally, grid unchanged
4. Adds filter Status = "Active" → staged locally, grid unchanged
5. Clicks "Apply Changes" → All three changes apply to grid at once, drawer closes
6. Grid now shows filtered, searched, and sorted results

### Scenario 3: User clears all filters
1. User opens filter drawer
2. Makes multiple changes
3. Realizes they want to start over
4. Clicks "Clear All" → Local selections cleared, grid cleared, drawer stays open
5. Can make new selections

### Scenario 4: User discards changes
1. User opens filter drawer
2. Makes some experimental changes
3. Closes drawer without clicking Apply
4. Changes are discarded, grid remains unchanged

## Migration Notes

### Removed Methods
- `onFilterChange` - Replaced by `onApplyFilters`
- `onGlobalSearchChange` - Replaced by `onApplyFilters`
- `onSortChange` - Replaced by `onApplyFilters`
- `applySortFromDrawer` - Replaced by `applyFiltersFromDrawer`
- `applyFilter` - No longer needed (handled by batch apply)
- `applyGlobalSearch` - No longer needed (handled by batch apply)

### New Methods
- `onApplyFilters(filters, search, sort)` - Single callback for all changes
- `applyFiltersFromDrawer(filters, search, sort)` - Batch update implementation

## Future Enhancements

1. **Apply on Close Option**: Add a setting to optionally apply changes when drawer closes without clicking Apply
2. **Unsaved Changes Warning**: Show indicator when there are unapplied changes
3. **Keyboard Shortcuts**: Add Ctrl+Enter to apply, Escape to close without applying
4. **Preview Mode**: Show number of rows that would match before applying (requires API enhancement)
