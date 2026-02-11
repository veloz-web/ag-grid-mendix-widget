# Row Height Fix Summary

## Issues Fixed

### 1. Auto Row Height Not Working in Runtime
**Problem**: When `rowHeightMode="auto"` was selected, text was truncating with ellipsis instead of wrapping to multiple lines. Rows remained at 42px height even after initial implementation.

**Root Cause**: AG Grid's auto-height feature requires:
- Column definitions with `wrapText: true` and `autoHeight: true` ✅ (already implemented)
- No fixed `rowHeight` prop on the grid ✅ (already implemented)
- Manual call to `resetRowHeights()` API after initial render ❌ (was missing)
- **Additional calls to `resetRowHeights()` after data is rendered** ❌ (was also missing)

AG Grid calculates row heights asynchronously. The first `resetRowHeights()` call on grid ready wasn't sufficient because data might not be fully rendered yet.

**Solution**: Added TWO callbacks in `GridView.tsx`:
1. **`handleGridReady`**: Calls `resetRowHeights()` after 200ms when grid initializes
2. **`handleFirstDataRendered`**: Calls `resetRowHeights()` after 100ms when data is first loaded

This ensures row heights are recalculated both at initialization AND after data rendering.

**Code Location**: `src/components/GridView.tsx` lines 273-301

```typescript
// Wrap onGridReady to handle auto-height recalculation
const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
        onGridReady(params);
        
        // For auto row height mode, force AG Grid to recalculate row heights
        // after initial render to ensure wrapText/autoHeight take effect
        if (effectiveRowHeightMode === "auto") {
            // Use setTimeout to let AG Grid finish initial render
            setTimeout(() => {
                params.api?.resetRowHeights();
            }, 200); // Increased delay to ensure content is fully rendered
        }
    },
    [onGridReady, effectiveRowHeightMode]
);

// Also reset row heights when data is first rendered (for auto mode)
const handleFirstDataRendered = useCallback(
    (params: any) => {
        if (effectiveRowHeightMode === "auto") {
            setTimeout(() => {
                params.api?.resetRowHeights();
            }, 100);
        }
    },
    [effectiveRowHeightMode]
);
```

**Applied to Grid** (line ~689):
```typescript
onGridReady={handleGridReady}
onFirstDataRendered={handleFirstDataRendered}
```

---

### 2. EditorPreview Showing Hardcoded 42px Height
**Problem**: In Mendix Studio Pro design mode, the preview showed hardcoded row heights (via `padding: "10px 12px"`) regardless of `rowHeight` or `rowHeightMode` settings.

**Root Cause**: The editorPreview mock HTML wasn't reading or applying the `rowHeight`/`rowHeightMode` props. It used static padding values.

**Solution**: 
1. Added `rowHeightMode` and `rowHeight` to destructured props in preview function
2. Added calculation logic to determine appropriate padding based on mode:
   - **Fixed mode**: Calculate padding to match configured height
   - **Auto mode**: Use generous padding + text wrapping
   - **Custom mode**: Use moderate default padding
3. Applied dynamic styles to preview rows:
   - `padding: previewRowPadding` (dynamic)
   - `whiteSpace`, `overflow`, `textOverflow` configured for auto-height wrapping

**Code Location**: `src/AGGrid.editorPreview.tsx`

**Props Destructuring** (lines ~54-57):
```typescript
// Row height
rowHeightMode,
rowHeight
```

**Calculation Logic** (lines ~60-78):
```typescript
// Calculate row height for preview
let previewRowPadding = "10px 12px"; // Default padding
let previewRowMinHeight: number | undefined;

if (rowHeightMode === "fixed" && rowHeight) {
    const configuredHeight = rowHeight;
    const verticalPadding = Math.max(6, Math.floor((configuredHeight - 22) / 2));
    previewRowPadding = `${verticalPadding}px 12px`;
} else if (rowHeightMode === "auto") {
    previewRowPadding = "12px 12px";
    previewRowMinHeight = undefined;
} else if (rowHeightMode === "custom") {
    previewRowPadding = "10px 12px";
}
```

**Applied to Rows** (lines ~664-679):
```typescript
<div
    key={rowIdx}
    style={{
        display: "flex",
        borderBottom: "1px solid #eee",
        fontSize: "13px",
        minHeight: previewRowMinHeight
    }}
>
    {columns.map((col, colIdx) => (
        <div
            key={colIdx}
            style={{
                padding: previewRowPadding,  // Dynamic padding
                // ... other styles
                whiteSpace: rowHeightMode === "auto" ? "normal" : "nowrap",
                overflow: rowHeightMode === "auto" ? "visible" : "hidden",
                textOverflow: rowHeightMode === "auto" ? "clip" : "ellipsis"
            }}
        >
```

---

## Testing Checklist

### Runtime Testing (GridView)
- [ ] Set `rowHeightMode="auto"` with long text in cells
- [ ] Verify rows expand to fit wrapped content
- [ ] No ellipsis truncation on multi-line content
- [ ] Test with different column widths

### Studio Pro Preview Testing (EditorPreview)
- [ ] Set `rowHeightMode="fixed"` with `rowHeight=60`
  - Preview should show taller rows with more padding
- [ ] Set `rowHeightMode="auto"`
  - Preview should show text wrapping (sample data is short, but whitespace should be "normal")
- [ ] Set `rowHeightMode="fixed"` with `rowHeight=30`
  - Preview should show compact rows with less padding

---

## Files Modified

1. **`src/components/GridView.tsx`**
   - Added `handleGridReady` callback with `resetRowHeights()` for auto-height mode
   - Moved callback placement after `effectiveRowHeightMode` calculation

2. **`src/AGGrid.editorPreview.tsx`**
   - Added `rowHeightMode` and `rowHeight` to props destructuring
   - Added row height calculation logic
   - Applied dynamic padding and text wrapping styles to preview rows

---

## Build Status

✅ **Build successful** - No TypeScript errors
✅ **Preview compilation** - EditorPreview compiled successfully

## Deployment

To test these fixes:

```bash
npm run release
```

Then copy the `.mpk` from `dist/1.2.0/` to your Mendix project's `widgets/` folder and sync in Studio Pro (F4).

---

## Technical Notes

### Why Two resetRowHeights() Calls?
AG Grid's rendering happens in stages:
1. **Grid Ready**: Container is initialized, but data may not be loaded yet
2. **First Data Rendered**: Data has been loaded and rows are rendered

For auto-height to work reliably, we need to recalculate heights at BOTH stages:
- `onGridReady` with 200ms delay: Handles cases where data is already available
- `onFirstDataRendered` with 100ms delay: Handles cases where data loads after grid initialization

Without both callbacks, rows can remain at 42px default height until user interacts with the grid.

### Why Different Timeouts?
- **200ms on grid ready**: Longer delay ensures grid container and initial DOM are fully constructed
- **100ms on data rendered**: Shorter delay since DOM is already initialized, just content changed

### Why Not Apply This to All Row Height Modes?
The `resetRowHeights()` calls are only needed for `auto` mode because:
- **Fixed mode**: Height is predetermined and applied immediately via `rowHeight` prop
- **Custom mode**: Expression-based heights are calculated per row via `getRowHeight` function
- **Auto mode**: Heights depend on rendered content size, which isn't known until after render

### EditorPreview Limitations
The preview uses mock HTML, not actual AG Grid. It cannot:
- Execute custom row height expressions
- Measure actual text content for precise auto-height
- Render long sample data for realistic wrapping demos

The preview provides a **visual approximation** of the configured height mode.
