# DOM Layout Configuration Guide

## What is DOM Layout?

DOM Layout controls how AG Grid renders its container and manages scrolling. This is **completely different** from row height modes.

## Available Modes

### Normal (Default) ✅ Recommended for most use cases
- **Description**: Fixed-height container with internal scrolling
- **Behavior**: 
  - Grid has fixed height (e.g., 500px)
  - Rows are virtualized (only visible rows rendered)
  - Scroll bar appears when content exceeds height
  - Pagination works normally
- **Use For**: Standard grids, large datasets, any grid with pagination
- **Performance**: Excellent (virtualization enabled)

### Auto Height ⚠️ Use with caution
- **Description**: Grid expands to fit ALL rows (no scrolling)
- **Behavior**:
  - Grid height grows to show every row
  - **Disables row virtualization** (all rows in DOM)
  - **Disables pagination** (shows all rows at once)
  - Configured `height` prop is ignored
- **Use For**: Small datasets only (<100 rows), embedded grids, print views
- **Performance**: Poor for large datasets (renders everything)
- **Conflicts With**:
  - ❌ Pagination (gets disabled)
  - ❌ Fixed height setting (gets ignored)
  - ❌ Server-Side row model (defeats the purpose)
  - ❌ Large datasets (causes performance issues)

### Print 🖨️ Special purpose only
- **Description**: Optimized layout for printing
- **Behavior**:
  - Similar to Auto Height but with print-specific styling
  - Disables virtualization
  - Disables pagination
  - Removes scrollbars for clean printing
- **Use For**: Print-only views, PDF exports
- **Performance**: Same as Auto Height

## Configuration Conflicts & Warnings

### Pagination + Auto Height
**Problem**: Auto Height shows ALL rows at once, making pagination pointless.

**Resolution**: 
- Pagination will be disabled
- Page size setting is ignored
- Grid expands to show all data

**Editor Warning**:
```
DOM Layout 'Auto Height' conflicts with Pagination. 
Pagination will be disabled because the grid expands to show all rows.
```

### Fixed Height + Auto Height
**Problem**: Auto Height ignores the configured height.

**Resolution**: 
- Configured height (e.g., 500px) is ignored
- Grid expands to fit content
- Container has no fixed height

**Editor Warning**:
```
DOM Layout 'Auto Height' ignores the configured height (500px). 
The grid will expand to fit all rows.
```

### Virtualization + Auto Height
**Problem**: Auto Height requires rendering all rows at once.

**Resolution**:
- Row virtualization is automatically disabled
- ALL rows rendered in DOM
- Can cause memory/performance issues with large datasets

**Editor Warning**:
```
DOM Layout 'Auto Height' disables row virtualization. 
ALL rows will be rendered in the DOM, which can cause performance 
issues with large datasets (>100 rows).
```

### Server-Side Model + Auto Height
**Problem**: Server-Side is designed for huge datasets, Auto Height loads everything.

**Resolution**:
- Still works technically, but defeats the purpose
- Loads all server data at once (no lazy loading)
- Massive performance hit

**Editor Warning**:
```
DOM Layout 'Auto Height' is NOT recommended with Server-Side row model. 
Server-Side is designed for large datasets, but Auto Height loads all rows at once.
```

## When to Use Each Mode

| Scenario | Recommended Mode | Why |
|----------|-----------------|-----|
| Standard data grid | **Normal** | Supports pagination, virtualization, large datasets |
| Grid with 1000+ rows | **Normal** | Virtualization essential for performance |
| Grid with pagination | **Normal** | Auto Height disables pagination |
| Embedded widget (<50 rows) | Auto Height | OK for small datasets, expands to fit |
| Dashboard card | Auto Height | No scrolling needed, shows all data |
| Print view | Print | Optimized for printing, no scroll bars |
| Export to PDF | Print | Clean layout without UI elements |

## Comparison with Row Height Modes

**DOM Layout vs Row Height - Different Concepts:**

| Feature | DOM Layout | Row Height Mode |
|---------|-----------|-----------------|
| **Controls** | Grid container behavior | Individual row sizing |
| **Affects** | Scrolling, virtualization | Cell content wrapping |
| **Normal Mode** | Fixed height with scroll | Rows have set height |
| **Auto Mode** | Expand to fit all rows | Rows expand to fit content |
| **Can combine?** | ✅ Yes | ✅ Yes |

**Valid Combinations:**

```typescript
// ✅ Normal DOM Layout + Auto Row Height
domLayout: "normal"           // Grid has fixed 500px height with scroll
rowHeightMode: "auto"         // Each row expands to fit content

// ✅ Auto Height DOM Layout + Fixed Row Height  
domLayout: "autoHeight"       // Grid expands to show all rows
rowHeightMode: "fixed"        // Each row is 40px tall

// ✅ Normal DOM Layout + Fixed Row Height
domLayout: "normal"           // Grid has fixed height with scroll
rowHeightMode: "fixed"        // Each row is 40px tall (most common)
```

## Best Practices

### DO:
- ✅ Use "Normal" for most grids
- ✅ Use "Auto Height" only for small datasets (<100 rows)
- ✅ Test performance with "Auto Height" before deploying
- ✅ Use "Print" mode only for actual printing
- ✅ Check Studio Pro warnings for configuration conflicts

### DON'T:
- ❌ Use "Auto Height" with pagination (defeats purpose)
- ❌ Use "Auto Height" with 1000+ rows (major performance hit)
- ❌ Use "Auto Height" with Server-Side model (defeats lazy loading)
- ❌ Expect fixed height to work with "Auto Height"
- ❌ Use "Print" mode for normal display

## Implementation Details

### XML Configuration (AGGrid.xml)
```xml
<property key="domLayout" type="enumeration" defaultValue="normal">
    <caption>DOM Layout</caption>
    <description>
        Controls grid container behavior. Normal = fixed height with scrolling. 
        Auto Height = grid expands to fit all rows (no scrolling). 
        WARNING: Auto Height disables virtualization and pagination
    </description>
    <enumerationValues>
        <enumerationValue key="normal">Normal (fixed height with scrolling)</enumerationValue>
        <enumerationValue key="autoHeight">Auto Height (expand to fit all rows)</enumerationValue>
        <enumerationValue key="print">Print (optimized for printing)</enumerationValue>
    </enumerationValues>
</property>
```

### Runtime Application (GridView.tsx)
```typescript
<AgGridReact
    domLayout={domLayout}  // "normal" | "autoHeight" | "print"
    // ... other props
/>
```

### Preview Validation (AGGrid.editorPreview.tsx)
```typescript
const domLayoutWarnings: string[] = [];
if (domLayout === "autoHeight") {
    if (pagination) {
        domLayoutWarnings.push("Conflicts with Pagination");
    }
    if (!suppressRowVirtualisation) {
        domLayoutWarnings.push("Disables virtualization");
    }
    // ... more validations
}
```

## Troubleshooting

### Grid shows scrollbar but I want it to expand
**Solution**: Set DOM Layout to "Auto Height"

### Grid expands too much and breaks page layout
**Solution**: Set DOM Layout to "Normal" and configure fixed height

### Pagination disappeared after setting Auto Height
**Expected**: Auto Height disables pagination (shows all rows)
**Solution**: Use "Normal" mode if you need pagination

### Performance is terrible with Auto Height
**Diagnosis**: Too many rows being rendered at once
**Solution**: 
- Use "Normal" mode for large datasets
- Enable pagination
- Consider Server-Side row model

### Height setting is ignored
**Diagnosis**: DOM Layout is set to "Auto Height" or "Print"
**Solution**: Use "Normal" mode to respect fixed height

## Related Documentation

- **AUTO_HEIGHT_QUICK_REFERENCE.md**: Row-level auto-height (different feature!)
- **ROW_HEIGHT_FIX_SUMMARY.md**: Row height troubleshooting
- **AG Grid Docs**: https://www.ag-grid.com/javascript-data-grid/grid-size/#dom-layout
