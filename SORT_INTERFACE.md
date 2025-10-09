# Sort Interface - Single Dropdown Design

## Overview

The sort interface has been redesigned to use a single dropdown selector with direction buttons, providing a cleaner and more intuitive user experience.

## Design

### Before (Old Design)
```
❌ Multiple Sort Buttons (One per column)

Sort
├─ Name           [No sort ▼]
├─ Status         [Ascending ▲]
├─ Date           [No sort ▼]
└─ Priority       [No sort ▼]
```

**Problems:**
- Takes up too much space
- Overwhelming with many columns
- Hard to see which column is sorted

### After (New Design)
```
✅ Single Sort Dropdown + Direction Buttons

Sort
├─ Sort By Column:  [Status ▼]  [×]
└─ Sort Direction:  [▲ Ascending] [▼ Descending]
                        (active)     (inactive)
```

**Benefits:**
- Clean, compact interface
- Easy to see current sort column
- Clear visual indication of direction
- Less visual clutter

## Interface Components

### 1. Column Selector
```
Sort By Column: [Dropdown ▼] [Clear ×]
```

**Options:**
- "No sorting" (default)
- List of all sortable columns
- Shows currently selected column
- Clear button (×) appears when sorted

### 2. Direction Buttons
```
[▲ Ascending]  [▼ Descending]
```

**Behavior:**
- Only shown when a column is selected
- Two-button toggle (grid layout)
- Active button highlighted in blue
- Click to change direction

## Two-Way Sync

### Grid → Drawer
1. User clicks column header in AG Grid
2. `onSortChanged()` captures the change
3. Grid's sort model extracted via `getSortModel()`
4. Drawer state updates automatically
5. Dropdown shows the sorted column
6. Direction button activates appropriately

### Drawer → Grid
1. User selects column from dropdown
2. Default to ascending sort
3. `onSortChange()` called with column + direction
4. Grid's sort model updated via `setSortModel()`
5. AG Grid re-sorts the data
6. Column header shows sort indicator

### Direction Change
1. User clicks direction button (Asc/Desc)
2. `onSortChange()` called with new direction
3. Grid updates immediately
4. Visual feedback on both sides

## User Flows

### Flow 1: Sort from Drawer
```
1. Open filter drawer
2. Click "Sort By Column" dropdown
3. Select "Name"
   → Automatically sorts ascending
   → Direction buttons appear
4. Click "Descending" button
   → Grid re-sorts descending
   → AG Grid header updates
```

### Flow 2: Sort from Grid
```
1. Click "Name" column header in grid
   → Sorts ascending
   → Drawer dropdown updates to "Name"
   → "Ascending" button activates
2. Click "Name" header again
   → Sorts descending
   → "Descending" button activates
3. Click "Name" header third time
   → Clears sort
   → Drawer resets to "No sorting"
```

### Flow 3: Clear Sort
```
Option A (Drawer):
- Click [×] button next to dropdown
- Resets to "No sorting"
- Direction buttons hidden
- Grid sort cleared

Option B (Drawer):
- Select "No sorting" from dropdown
- Same result as Option A

Option C (Grid):
- Click sorted column header until cleared
- Drawer updates to "No sorting"

Option D (Clear All):
- Click "Clear All Filters" button
- Clears sort + filters + search
```

## State Management

### Sort Model Structure
```typescript
sortModel: Array<{ colId: string; sort: 'asc' | 'desc' | null }>

Examples:
- No sort:        []
- Ascending:      [{ colId: 'name', sort: 'asc' }]
- Descending:     [{ colId: 'status', sort: 'desc' }]
```

### Component State
```typescript
// In AGGrid.tsx
state = {
    sortModel: [],  // Synced with grid
    // ... other state
}

// Methods
onSortChanged()          // Grid → State
applySortFromDrawer()    // Drawer → Grid → State
clearFilters()           // Clear all
```

## Visual States

### No Sort Selected
```
┌─────────────────────────────┐
│ Sort By Column              │
│ [No sorting ▼]              │
└─────────────────────────────┘
(Direction buttons hidden)
```

### Column Selected (Ascending)
```
┌─────────────────────────────┐
│ Sort By Column              │
│ [Name ▼]            [×]     │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Sort Direction              │
│ ┌──────────┐ ┌──────────┐  │
│ │▲Ascending│ │▼Descending│ │
│ └──────────┘ └──────────┘  │
│   (active)     (inactive)   │
└─────────────────────────────┘
```

### Column Selected (Descending)
```
┌─────────────────────────────┐
│ Sort By Column              │
│ [Status ▼]          [×]     │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Sort Direction              │
│ ┌──────────┐ ┌──────────┐  │
│ │▲Ascending│ │▼Descending│ │
│ └──────────┘ └──────────┘  │
│  (inactive)     (active)    │
└─────────────────────────────┘
```

## CSS Classes

### Dropdown
```css
.filter-select         /* Main dropdown */
.filter-select-wrapper /* Container with clear btn */
.clear-filter-btn      /* Clear × button */
```

### Direction Buttons
```css
.sort-direction-buttons     /* Grid container */
.sort-direction-btn         /* Individual button */
.sort-direction-btn.active  /* Active state (blue) */
```

### States
- **Default**: Gray border, white background
- **Hover**: Blue border, light gray background
- **Active**: Blue border, light blue background, blue text

## Implementation Details

### Dropdown Logic
```typescript
// When dropdown changes
onChange={(e) => {
    const columnId = e.target.value;
    if (!columnId) {
        // "No sorting" selected
        onSortChange('', null);
    } else {
        // Column selected, default to ascending
        onSortChange(columnId, 'asc');
    }
}}
```

### Direction Button Logic
```typescript
// When direction button clicked
onClick={() => {
    const currentColId = sortModel[0].colId;
    onSortChange(currentColId, 'asc'); // or 'desc'
}}
```

### Clear Button Logic
```typescript
onClick={() => {
    onSortChange('', null);  // Clear sort
}}
```

## Advantages

1. **Space Efficient**: Single dropdown vs. multiple buttons
2. **Clearer Intent**: Obvious which column is sorted
3. **Better UX**: Fewer clicks, clearer options
4. **Scalable**: Works well with many sortable columns
5. **Mobile Friendly**: Touch-friendly larger buttons
6. **Accessible**: Clear labels and visual states

## Configuration

Only columns marked as `sortable: true` appear in the dropdown:

```xml
<property key="sortable" type="boolean" defaultValue="true">
    <caption>Sortable</caption>
</property>
```

## Testing Scenarios

### Test 1: Basic Sort
- [ ] Open drawer
- [ ] Select column from dropdown
- [ ] Verify ascending sort applied
- [ ] Verify grid header shows sort indicator

### Test 2: Direction Change
- [ ] Sort column ascending
- [ ] Click "Descending" button
- [ ] Verify grid re-sorts
- [ ] Verify direction button activates

### Test 3: Grid → Drawer Sync
- [ ] Click column header in grid
- [ ] Open drawer
- [ ] Verify dropdown shows sorted column
- [ ] Verify direction button matches grid

### Test 4: Clear Sort
- [ ] Sort a column
- [ ] Click clear × button
- [ ] Verify dropdown resets
- [ ] Verify grid clears sort
- [ ] Verify direction buttons hidden

### Test 5: Multiple Changes
- [ ] Sort by Column A ascending
- [ ] Change to Column B
- [ ] Verify Column A sort cleared
- [ ] Verify Column B sort applied
- [ ] Change to descending
- [ ] Verify sort direction updates

## Future Enhancements

Possible future improvements:
- Multi-column sort support
- Sort priority indicators (1, 2, 3)
- Remember last sort preference
- Sort presets/saved sorts
- Keyboard shortcuts (S for sort)

## Related Files

- `src/components/FilterDrawer.tsx` - UI implementation
- `src/AGGrid.tsx` - State management
- `src/ui/AGGrid.css` - Styling
- `src/components/GridView.tsx` - AG Grid integration
