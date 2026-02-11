# Auto Row Height - Quick Reference

## The Problem
When `rowHeightMode="auto"` is selected, AG Grid rows stay at 42px height instead of expanding to fit content. Text shows ellipsis instead of wrapping.

## The Solution
AG Grid's auto-height requires **two** `resetRowHeights()` calls at different lifecycle stages:

### 1. On Grid Ready (GridView.tsx lines 273-288)
```typescript
const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
        onGridReady(params);
        
        if (effectiveRowHeightMode === "auto") {
            setTimeout(() => {
                params.api?.resetRowHeights();
            }, 200); // Longer delay for initial setup
        }
    },
    [onGridReady, effectiveRowHeightMode]
);
```

### 2. On First Data Rendered (GridView.tsx lines 290-301)
```typescript
const handleFirstDataRendered = useCallback(
    (params: any) => {
        if (effectiveRowHeightMode === "auto") {
            setTimeout(() => {
                params.api?.resetRowHeights();
            }, 100); // Shorter delay, DOM already exists
        }
    },
    [effectiveRowHeightMode]
);
```

### 3. Wire Both Callbacks to AgGridReact
```typescript
<AgGridReact
    // ... other props
    onGridReady={handleGridReady}
    onFirstDataRendered={handleFirstDataRendered}
    // ... other props
/>
```

## Why This Works

### The AG Grid Auto-Height Requirements Checklist
For auto-height to work, ALL of these must be true:

- ✅ **Column level**: `wrapText: true` + `autoHeight: true` on column definitions
  - Set in `src/utils/column/mapping.ts` lines 529-534
  
- ✅ **Grid level**: NO `rowHeight` prop set on AgGridReact
  - Only applied when `rowHeightMode === "fixed"` (line 680)
  
- ✅ **API calls**: `resetRowHeights()` called after content renders
  - Called in `onGridReady` AND `onFirstDataRendered`

### Why Two Calls Are Needed

AG Grid rendering lifecycle:
```
1. Grid Initialized (onGridReady fires)
   └─> Container created, columns defined
   └─> Data might not be loaded yet
   └─> resetRowHeights() call #1 (200ms delay)

2. Data Loaded & Rendered (onFirstDataRendered fires)
   └─> Rows created with actual content
   └─> Content measured for height calculation
   └─> resetRowHeights() call #2 (100ms delay)
```

**Without both calls**: Rows may render with 42px default height and never recalculate.

## Common Issues

### Issue: Rows still show 42px height
**Diagnosis**:
- Check browser console for AG Grid warnings
- Verify `rowHeightMode` prop is actually set to `"auto"`
- Inspect DOM: rows should have NO inline `height` style
- Check columns have `wrapText` and `autoHeight` in column defs

**Fix**: Increase setTimeout delays (try 300ms and 200ms respectively)

### Issue: Heights recalculate but text still truncates
**Diagnosis**:
- Column `wrapText` might not be set
- CSS might be applying `white-space: nowrap`

**Fix**: Verify in `column/mapping.ts` that auto mode sets both properties:
```typescript
if (rowHeightMode === "auto") {
    colDefs.forEach((colDef) => {
        colDef.wrapText = true;
        colDef.autoHeight = true;
    });
}
```

### Issue: EditorPreview shows wrong height
**Diagnosis**: EditorPreview uses mock HTML, not AG Grid

**Fix**: See `src/AGGrid.editorPreview.tsx` lines 60-78 for preview-specific padding calculation.

## Testing Checklist

- [ ] Set `rowHeightMode="auto"`
- [ ] Add long text content (200+ characters) to a cell
- [ ] Verify row expands to show all content without scrolling
- [ ] Text wraps to multiple lines (no ellipsis)
- [ ] Multiple rows can have different heights based on content
- [ ] Heights update when cell content changes

## Related Files

- **GridView.tsx**: Main grid component with auto-height callbacks
- **column/mapping.ts**: Sets `wrapText` and `autoHeight` on column defs
- **AGGrid.editorPreview.tsx**: Studio Pro preview with dynamic padding
- **ROW_HEIGHT_FIX_SUMMARY.md**: Detailed explanation of both fixes
