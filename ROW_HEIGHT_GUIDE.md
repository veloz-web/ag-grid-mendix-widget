# Row Height Configuration Guide

Control how your AG Grid rows are sized — from uniform fixed heights to content-aware auto-expanding rows.

## Overview

The widget supports three row height modes:

| Mode | Description | Best For |
|------|-------------|----------|
| **Fixed** (default) | All rows share the same height | Uniform data, maximum performance |
| **Auto** | Rows expand to fit their content | Long text, descriptions, notes |
| **Custom** | JavaScript expression per row | Conditional heights based on data |

## Quick Start

### Fixed Height (Default)

No configuration needed. All rows are 40px by default.

To change:
1. Open widget properties → **Row Height**
2. Set **Row Height Mode** to `Fixed`
3. Set **Row Height (px)** to your desired value (e.g., `50`)

### Auto Height (Content-Aware)

Rows expand to fit wrapped text content.

**Two steps required:**

1. **Grid level**: Set **Row Height Mode** to `Auto (fit content)`
2. **Column level**: Enable **Wrap Text** on columns that should drive row expansion

> Without enabling **Wrap Text** on at least one column, auto mode has no effect — rows need wrapping content to expand.

### Custom Height (Per-Row Logic)

Use a JavaScript expression to compute height per row.

1. Set **Row Height Mode** to `Custom (JavaScript expression)`
2. Enter your expression in **Custom Row Height Expression**

## Configuration Reference

### Grid-Level Properties

Found in the **Row Height** property group:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Row Height Mode** | Enum | `Fixed` | `Fixed`, `Auto`, or `Custom` |
| **Row Height (px)** | Integer | `40` | Fixed height, or default/minimum for Auto and Custom |
| **Custom Row Height Expression** | String | _(empty)_ | JavaScript expression returning height in pixels (Custom mode only) |
| **Max Row Height (px)** | Integer | `0` | Maximum row height cap. `0` = unlimited. Recommended: `200`–`500` for auto-height |

### Column-Level Property

Found in each column's **Column Sizing** group:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Wrap Text** | Boolean | `false` | Enable text wrapping. Combined with Auto row height, rows expand to fit |

## Examples

### Example 1: Simple Fixed Height

All rows at 50px:

```
Row Height Mode: Fixed
Row Height (px): 50
```

### Example 2: Auto Height for Description Column

A grid with a "Notes" column that can have long text:

**Grid settings:**
```
Row Height Mode: Auto (fit content)
Max Row Height (px): 300
```

**Column settings for "Notes" column:**
```
Wrap Text: Yes
```

All other columns remain single-line. Only the Notes column wraps and expands the row.

### Example 3: Conditional Heights by Data Type

Different row heights based on a row's `type` field:

```
Row Height Mode: Custom (JavaScript expression)
Custom Row Height Expression:
  data && data.type === 'header' ? 80 : data && data.type === 'detail' ? 60 : 40
```

### Example 4: Height Based on Content Length

Scale height by the length of a text field:

```
Row Height Mode: Custom (JavaScript expression)
Custom Row Height Expression:
  data && data.description ? Math.max(40, Math.min(200, data.description.length / 2)) : 40
```

This scales from 40px (short text) to 200px (long text).

### Example 5: Alternating Row Heights

Taller rows for even-indexed rows (useful for visual grouping):

```
Row Height Mode: Custom (JavaScript expression)
Custom Row Height Expression:
  rowIndex % 2 === 0 ? 60 : 40
```

## Custom Expression Reference

When using **Custom** mode, your expression has access to:

| Variable | Type | Description |
|----------|------|-------------|
| `data` | `object` | The row's data object (all column values) |
| `rowIndex` | `number` | The row's index in the grid (0-based) |

The expression must **return a number** (height in pixels).

### Expression Tips

```javascript
// Simple conditional
data && data.priority === 'high' ? 60 : 40

// Multi-level conditional  
data && data.type === 'group' ? 80 : data && data.type === 'summary' ? 60 : 40

// Math-based scaling
Math.max(40, Math.min(300, (data && data.text ? data.text.length : 0) / 3))

// Default fallback pattern
data ? (data.expanded ? 120 : 40) : 40
```

> **Always null-check `data`** — during grid initialization, `data` may be `undefined`.

## Performance & Limitations

### Auto Height Performance

| Dataset Size | Impact | Recommendation |
|-------------|--------|----------------|
| < 500 rows | ✅ Negligible | Use freely |
| 500–2000 rows | ⚠️ Moderate | Enable pagination |
| > 2000 rows | ❌ Significant | Use Fixed or Custom mode |

Auto height requires the grid to **measure DOM elements** for each visible row, which adds rendering overhead.

### Server-Side Row Model

**Auto height is not supported** with the Server-Side row model. The widget automatically falls back to Fixed mode and logs a console warning.

Use **Fixed** or **Custom** mode with server-side data.

### Max Row Height

When using Auto mode, very long text can produce extremely tall rows. Use **Max Row Height** to cap expansion:

- `0` = No limit (default)
- `200` = Good for 4–5 lines of text
- `400` = Good for paragraphs
- `500` = Maximum recommended

When the cap is reached, overflow content is hidden with ellipsis.

## How It Works Internally

| Mode | AG Grid Property | Mechanism |
|------|-----------------|-----------|
| Fixed | `rowHeight={N}` | Static height on `<AgGridReact>` |
| Auto | Column `autoHeight: true` + `wrapText: true` | AG Grid measures each cell's DOM |
| Custom | `getRowHeight` callback | Widget compiles your expression into a function |

### Auto Mode Details

When you enable **Wrap Text** on a column:
1. The column's `ColDef` gets `wrapText: true` (enables CSS wrapping)
2. The column's `ColDef` gets `autoHeight: true` (tells AG Grid to measure this cell)
3. AG Grid renders the cell, measures it, and sets the row height to fit

Multiple columns can have Wrap Text enabled — AG Grid uses the tallest cell in each row.

### Max Row Height CSS

When Max Row Height > 0 in Auto mode, the widget applies:
- CSS class `aggrid-max-row-height` on the grid wrapper
- CSS variable `--ag-max-row-height` with the pixel value
- CSS rules that cap `.ag-row` height and add overflow handling

## Troubleshooting

### Rows Not Expanding

**Check:**
1. Row Height Mode is set to `Auto`
2. At least one column has **Wrap Text** enabled
3. The column actually has content that would wrap (short text won't trigger expansion)

### Extremely Tall Rows

**Fix:** Set **Max Row Height** to a reasonable value (200–400px)

### Custom Expression Not Working

**Check:**
1. Expression returns a **number** (not a string)
2. Expression handles `data === undefined` (null check)
3. Check browser console for `[AG Grid] Invalid row height expression` errors

### Performance Degradation

**Fix:**
1. Enable pagination to limit visible rows
2. Switch from Auto to Custom mode (avoids DOM measurement)
3. For 2000+ rows, use Fixed mode

### Server-Side Fallback

If you see the warning `"Auto row height is not supported with the Server-Side row model"`:
- Switch to **Fixed** or **Custom** mode
- This is an AG Grid limitation, not a widget bug
