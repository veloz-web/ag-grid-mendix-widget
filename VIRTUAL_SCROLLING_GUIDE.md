# Virtual Scrolling & Performance Tuning Guide

## Overview

AG Grid uses **DOM row virtualisation** by default — only the rows visible in the viewport (plus a small buffer) are rendered in the DOM. This means your grid can handle thousands of rows without performance degradation, regardless of the row model.

This widget exposes AG Grid's virtualisation tuning knobs so you can optimize for your specific use case.

## How Virtual Scrolling Works

```
┌──────────────────────────────┐
│      Buffer rows (hidden)    │  ← rowBuffer rows above viewport
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │   Visible Row 1        │  │
│  │   Visible Row 2        │  │  ← Only these rows exist in the DOM
│  │   Visible Row 3        │  │
│  │   ...                  │  │
│  │   Visible Row N        │  │
│  └────────────────────────┘  │
├──────────────────────────────┤
│      Buffer rows (hidden)    │  ← rowBuffer rows below viewport
└──────────────────────────────┘
         Total dataset:
    Could be 10,000+ rows
    but only ~30 are in the DOM
```

## Configuration Reference

### Client-Side Options (Grid Options tab)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Row Buffer** | Integer | `10` | Extra rows rendered above/below the visible area. Higher values reduce flicker during fast scrolling but use more memory. |
| **Suppress Row Virtualisation** | Boolean | `false` | When enabled, ALL rows are rendered in the DOM at once. **Only** use for small datasets or print/export layouts. |

### Server-Side Cache Options (Server-Side Configuration tab)

These options only take effect when **Row Model** is set to "Server-Side (Large Data)".

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Cache Block Size** | Integer | `100` | Number of rows fetched per request. Larger blocks = fewer requests, more memory. |
| **Max Blocks in Cache** | Integer | `0` | Maximum blocks kept in memory. `0` = unlimited (keep all fetched data). Reduce to limit memory for very large datasets. |
| **Max Concurrent Requests** | Integer | `2` | Maximum simultaneous data requests to the server. Higher values improve perceived speed but increase server load. |

## Quick Start

### Default (Zero Configuration)

The widget works optimally out of the box for most use cases. No changes needed.

- Client-side: All rows loaded in memory, only visible rows + 10 buffer rows rendered in DOM
- Server-side: Rows fetched in blocks of 100, unlimited cache, 2 concurrent requests

### For Fast-Scrolling Datasets

If users scroll quickly through large datasets and see flickering:

1. Open widget properties → **Grid Options**
2. Set **Row Buffer** to `20` or `30`

### For Server-Side Large Datasets (Memory Constrained)

If users are browsing 100K+ row datasets and you want to limit memory:

1. Open widget properties → **Server-Side Configuration**
2. Set **Cache Block Size** to `50` (smaller blocks, less memory per block)
3. Set **Max Blocks in Cache** to `10` (only keep 10 blocks = 500 rows in memory)
4. Set **Max Concurrent Requests** to `1` (reduce server load)

### For Print/Export Layouts

If you need all rows rendered for PDF/print:

1. Open widget properties → **Grid Options**
2. Set **Suppress Row Virtualisation** to `Yes`
3. ⚠️ **Warning**: Only use with small datasets (< 500 rows). Large datasets will freeze the browser.

## Examples

### Example 1: Standard Grid (Default)
```
Row Buffer: 10
Suppress Row Virtualisation: No
```
Best for: Most use cases with up to 10,000 rows.

### Example 2: Smooth Scrolling
```
Row Buffer: 25
Suppress Row Virtualisation: No
```
Best for: Dashboards where users frequently scroll. Slightly higher memory for smoother feel.

### Example 3: Server-Side with Memory Limits
```
Row Model: Server-Side (Large Data)
Cache Block Size: 50
Max Blocks in Cache: 20
Max Concurrent Requests: 2
```
Best for: 50K+ row datasets. Keeps max 1,000 rows in memory (20 blocks × 50 rows).

### Example 4: Server-Side High Performance
```
Row Model: Server-Side (Large Data)
Cache Block Size: 200
Max Blocks in Cache: 0 (unlimited)
Max Concurrent Requests: 4
```
Best for: Fast servers with powerful clients. Prefetches aggressively for seamless scrolling.

### Example 5: Small Dataset Print Layout
```
Row Buffer: 10
Suppress Row Virtualisation: Yes
```
Best for: Small datasets (< 200 rows) that need to be fully rendered for screenshots or print.

## Performance Guidelines

| Dataset Size | Recommended Settings |
|-------------|---------------------|
| < 500 rows | Defaults work perfectly. `suppressRowVirtualisation` is safe if needed. |
| 500–5,000 rows | Defaults work well. Consider `rowBuffer: 15-20` for smooth scrolling. |
| 5,000–50,000 rows | Use defaults. **Do not** suppress virtualisation. |
| 50,000+ rows | Switch to **Server-Side** row model. Tune `cacheBlockSize` to match your page size. |
| 100,000+ rows | Server-Side with `maxBlocksInCache: 10-20` to cap memory. |

### Memory Impact

| Setting | Approximate Impact |
|---------|-------------------|
| `rowBuffer: 10` (default) | ~20 extra DOM elements (10 above + 10 below) |
| `rowBuffer: 50` | ~100 extra DOM elements |
| `suppressRowVirtualisation: true` with 1,000 rows | ~1,000 DOM elements (expensive!) |
| `cacheBlockSize: 100` (server-side) | ~100 rows × row data size per block |
| `maxBlocksInCache: 10` (server-side) | Max ~1,000 rows kept in JavaScript memory |

## Troubleshooting

### Grid feels sluggish when scrolling fast
- **Increase** `rowBuffer` to 20-30
- Check that `suppressRowVirtualisation` is **disabled**

### Browser tab uses too much memory
- **Decrease** `rowBuffer` to 5
- For server-side: Set `maxBlocksInCache` to 5-10
- For server-side: **Decrease** `cacheBlockSize` to 25-50

### Server is overloaded with requests
- **Decrease** `maxConcurrentRequests` to 1
- **Increase** `cacheBlockSize` to 200+ (fewer, larger requests)
- Set `maxBlocksInCache` to 0 (keep fetched blocks, avoid re-fetching)

### Grid shows blank rows when scrolling quickly (server-side)
- **Increase** `maxConcurrentRequests` to 3-4
- **Increase** `cacheBlockSize` for more data per request
- Check server response time — slow responses cause blank rows

### Print/Export shows only visible rows
- Set `suppressRowVirtualisation` to `Yes`
- Or use the built-in Export to Excel/CSV/PDF features instead (recommended)

## Relationship to Other Features

| Feature | Interaction with Virtual Scrolling |
|---------|-----------------------------------|
| **Pagination** | When pagination is enabled, virtualisation applies within each page. Row buffer is less important with small page sizes. |
| **Row Height (Auto)** | Auto row height + large row buffer can be expensive since each row's height must be calculated. Keep buffer moderate (10-15). |
| **Row Grouping** | Group rows are also virtualised. The row buffer applies to visible group rows. |
| **Server-Side Model** | Cache settings (`cacheBlockSize`, `maxBlocksInCache`) only apply when using server-side. Client-side loads all data upfront. |
