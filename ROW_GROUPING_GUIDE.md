# Row Grouping Guide

This guide explains how to configure and use **hierarchical row grouping** in the AG Grid Mendix Widget to organize your data into collapsible groups.

---

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Usage Examples](#usage-examples)
4. [How It Works](#how-it-works)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Use Cases](#advanced-use-cases)

---

## Overview

Row grouping allows you to **hierarchically organize data** by grouping rows based on column values. This is perfect for:

- **Departmental reports** (group by Department → Team → Employee)
- **Sales analysis** (group by Region → Product Category → Product)
- **Inventory management** (group by Warehouse → Shelf → SKU)
- **Time-based data** (group by Year → Quarter → Month)

### Key Features

- ✅ **Multi-level grouping** - Group by multiple columns with configurable order
- ✅ **Expand/collapse controls** - Interactive UI to show/hide grouped data
- ✅ **Aggregations on groups** - Show totals, counts, averages within each group
- ✅ **Flexible display modes** - Inline groups or separate group rows
- ✅ **Configurable defaults** - Control which levels are expanded on load

---

## Configuration

### Step 1: Enable Row Grouping Globally

In Studio Pro, configure the widget properties:

1. Navigate to **UI Elements** section
2. Enable **"Enable Row Grouping"** toggle
3. Configure display options:

| Property | Description | Default |
|----------|-------------|---------|
| **Enable Row Grouping** | Master toggle to enable row grouping | `false` |
| **Group Default Expanded** | Number of levels to expand by default<br/>• `-1` = expand all<br/>• `0` = collapse all<br/>• `1` = expand first level only<br/>• `2` = expand first two levels | `-1` |
| **Show Groups on Separate Line** | Display group headers on dedicated rows (cleaner layout) | `false` |
| **Suppress Aggregation on Group Rows** | Hide aggregations in group rows (show only in footer) | `false` |

### Step 2: Configure Columns for Grouping

For each column you want to group by, go to the **Row Grouping** section:

| Property | Description | Default |
|----------|-------------|---------|
| **Enable Row Group** | Enable this column for grouping | `false` |
| **Row Group Index** | Order for multi-level grouping (0 = first level, 1 = second level, etc.)<br/>Lower values group first | `999` |
| **Show in Group Column** | Display this column's values in the auto-generated group column instead of its own column | `false` |

### Step 3: (Optional) Configure Aggregations

To show totals/counts/averages on grouped data, configure the **Aggregation** section for numeric columns:

| Property | Description |
|----------|-------------|
| **Enable Aggregation** | Enable aggregation for this column |
| **Aggregation Function** | `sum`, `avg`, `min`, `max`, `count`, `first`, `last` |

---

## Usage Examples

### Example 1: Simple Single-Level Grouping (Sales by Region)

**Scenario:** Group sales data by region

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
└─ Group Default Expanded: -1 (expand all)

Columns:
├─ Region (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 0
├─ Sales Rep (String)
│  └─ Enable Row Group: ✗
├─ Revenue (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ Count (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▼ North (Sum: $1.2M, Count: 45)
  - John Doe      | $250K | 12
  - Jane Smith    | $300K | 15
  - ...
▼ South (Sum: $950K, Count: 38)
  - Bob Johnson   | $180K | 8
  - ...
```

---

### Example 2: Multi-Level Grouping (Department → Team → Employee)

**Scenario:** Organizational hierarchy with nested groups

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
└─ Group Default Expanded: 1 (expand only first level)

Columns:
├─ Department (String)
│  ├─ Enable Row Group: ✓
│  ├─ Row Group Index: 0
│  └─ Show in Group Column: ✗
├─ Team (String)
│  ├─ Enable Row Group: ✓
│  ├─ Row Group Index: 1
│  └─ Show in Group Column: ✗
├─ Employee (String)
│  └─ Enable Row Group: ✗
├─ Salary (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ Headcount (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▼ Engineering (Sum: $2.5M, Count: 25)
  ▶ Backend Team (Sum: $1.2M, Count: 12)
  ▶ Frontend Team (Sum: $800K, Count: 8)
  ▶ DevOps Team (Sum: $500K, Count: 5)
▶ Sales (Sum: $1.8M, Count: 20)
▶ Marketing (Sum: $950K, Count: 10)
```

---

### Example 3: Time-Based Grouping (Year → Quarter → Month)

**Scenario:** Financial data grouped by time periods

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
├─ Group Default Expanded: 0 (collapse all)
└─ Show Groups on Separate Line: ✓

Columns:
├─ Year (String/Integer)
│  ├─ Enable Row Group: ✓
│  ├─ Row Group Index: 0
│  └─ Show in Group Column: ✓
├─ Quarter (String)
│  ├─ Enable Row Group: ✓
│  ├─ Row Group Index: 1
│  └─ Show in Group Column: ✓
├─ Month (String)
│  ├─ Enable Row Group: ✓
│  ├─ Row Group Index: 2
│  └─ Show in Group Column: ✓
├─ Revenue (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ Transactions (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▶ 2024 (Sum: $12.5M, Count: 1,250)
▶ 2025 (Sum: $15.2M, Count: 1,450)
  ▶ Q1 (Sum: $3.8M, Count: 380)
    ▶ January (Sum: $1.2M, Count: 120)
    ▶ February (Sum: $1.3M, Count: 130)
    ▶ March (Sum: $1.3M, Count: 130)
  ▶ Q2 (Sum: $4.1M, Count: 410)
  ...
```

---

### Example 4: Product Catalog Grouping (Category → Subcategory → Product)

**Scenario:** E-commerce product hierarchy

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
└─ Group Default Expanded: 2 (expand first two levels)

Columns:
├─ Category (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 0
├─ Subcategory (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 1
├─ Product Name (String)
│  └─ Enable Row Group: ✗
├─ Price (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: avg
├─ Stock (Integer)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ SKU Count (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▼ Electronics (Avg: $450, Stock: 1,250, SKUs: 125)
  ▼ Laptops (Avg: $1,200, Stock: 45, SKUs: 15)
    - MacBook Pro 16"  | $2,499 | 12 | 1
    - Dell XPS 15      | $1,799 | 18 | 1
    - ...
  ▼ Monitors (Avg: $350, Stock: 120, SKUs: 40)
    - LG 27" 4K       | $499  | 30 | 1
    - ...
▼ Furniture (Avg: $280, Stock: 350, SKUs: 85)
  ...
```

---

### Example 5: Project Management (Status → Priority → Task)

**Scenario:** Task tracking with grouping by status and priority

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
└─ Group Default Expanded: -1 (expand all)

Columns:
├─ Status (Enum: "Open", "In Progress", "Done")
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 0
├─ Priority (Enum: "High", "Medium", "Low")
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 1
├─ Task Name (String)
│  └─ Enable Row Group: ✗
├─ Assigned To (String)
│  └─ Enable Row Group: ✗
├─ Hours Estimated (Integer)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ Task Count (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▼ Open (Sum: 120 hrs, Count: 15)
  ▼ High (Sum: 45 hrs, Count: 5)
    - Fix critical bug | Alice | 8 hrs
    - Security patch   | Bob   | 12 hrs
    ...
  ▼ Medium (Sum: 50 hrs, Count: 7)
  ▼ Low (Sum: 25 hrs, Count: 3)
▼ In Progress (Sum: 80 hrs, Count: 10)
  ...
▼ Done (Sum: 200 hrs, Count: 25)
  ...
```

---

### Example 6: Inventory Management (Warehouse → Aisle → Shelf)

**Scenario:** Track inventory across multiple locations

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
├─ Group Default Expanded: 1
└─ Show Groups on Separate Line: ✓

Columns:
├─ Warehouse (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 0
├─ Aisle (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 1
├─ Shelf (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 2
├─ Product SKU (String)
│  └─ Enable Row Group: ✗
├─ Quantity (Integer)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
├─ Value (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ Item Count (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▼ Warehouse A (Qty: 15,000, Value: $450K, Items: 1,200)
  ▶ Aisle 1 (Qty: 3,500, Value: $105K, Items: 280)
  ▶ Aisle 2 (Qty: 4,200, Value: $126K, Items: 340)
  ...
▶ Warehouse B (Qty: 12,000, Value: $360K, Items: 950)
▶ Warehouse C (Qty: 8,500, Value: $255K, Items: 680)
```

---

### Example 7: Customer Segmentation (Industry → Company Size → Customer)

**Scenario:** B2B customer analysis

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
└─ Group Default Expanded: 2

Columns:
├─ Industry (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 0
├─ Company Size (Enum: "Enterprise", "Mid-Market", "SMB")
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 1
├─ Customer Name (String)
│  └─ Enable Row Group: ✗
├─ Annual Revenue (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
├─ Contract Value (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: avg
└─ Customer Count (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▼ Technology (Revenue: $8.5M, Avg Contract: $425K, Count: 20)
  ▼ Enterprise (Revenue: $6M, Avg Contract: $750K, Count: 8)
    - Microsoft Corp   | $1.2M | $950K
    - Amazon Inc       | $1.5M | $1.1M
    ...
  ▼ Mid-Market (Revenue: $2M, Avg Contract: $250K, Count: 8)
  ▼ SMB (Revenue: $500K, Avg Contract: $125K, Count: 4)
▼ Healthcare (Revenue: $5.2M, Avg Contract: $325K, Count: 16)
  ...
```

---

### Example 8: Geographic Hierarchy (Country → State → City)

**Scenario:** Sales data by location

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
└─ Group Default Expanded: 0

Columns:
├─ Country (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 0
├─ State (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 1
├─ City (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 2
├─ Sales Rep (String)
│  └─ Enable Row Group: ✗
├─ Revenue (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ Deals (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▶ United States (Revenue: $25M, Deals: 2,500)
  ▶ California (Revenue: $8M, Deals: 800)
    ▶ San Francisco (Revenue: $3M, Deals: 300)
    ▶ Los Angeles (Revenue: $2.5M, Deals: 250)
    ...
  ▶ New York (Revenue: $6M, Deals: 600)
  ...
▶ Canada (Revenue: $5M, Deals: 500)
▶ Mexico (Revenue: $2M, Deals: 200)
```

---

### Example 9: Cost Center Reporting (Division → Department → Cost Center)

**Scenario:** Financial reporting by organizational structure

**Configuration:**
```
Widget Settings:
├─ Enable Row Grouping: ✓
├─ Group Default Expanded: 1
└─ Suppress Aggregation on Group Rows: ✓ (only show in footer)

Columns:
├─ Division (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 0
├─ Department (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 1
├─ Cost Center (String)
│  ├─ Enable Row Group: ✓
│  └─ Row Group Index: 2
├─ Budget (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
├─ Actual Spend (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
├─ Variance (Decimal)
│  ├─ Enable Aggregation: ✓
│  └─ Aggregation Function: sum
└─ Cost Centers (Integer)
   ├─ Enable Aggregation: ✓
   └─ Aggregation Function: count
```

**Result:**
```
▼ Operations Division
  ▶ Manufacturing
    ▶ Production Line A
    ▶ Production Line B
    ▶ Quality Assurance
  ▶ Logistics
    ▶ Warehousing
    ▶ Distribution
▶ Corporate Division
  ▶ HR
  ▶ Finance
  ▶ IT

Footer Row:
Budget: $15.5M | Actual: $14.8M | Variance: $700K | Centers: 45
```

---

## How It Works

### Grouping Mechanics

1. **Column Selection**: Columns with `Enable Row Group = true` become grouping dimensions
2. **Hierarchical Order**: `Row Group Index` determines nesting (0 = outermost, 1 = nested, etc.)
3. **Auto Group Column**: AG Grid creates a special column showing group names with expand/collapse controls
4. **Aggregation**: Values in grouped columns are aggregated according to configured functions

### Display Modes

**Inline Groups (default)**:
- Group values appear in the same row as data
- Compact layout, good for simple hierarchies

**Separate Line Groups** (`Show Groups on Separate Line = true`):
- Dedicated rows for group headers
- Cleaner visual separation
- Better for complex multi-level hierarchies

### Expansion Behavior

| `Group Default Expanded` | Behavior |
|-------------------------|----------|
| `-1` | Expand all levels |
| `0` | Collapse all levels |
| `1` | Expand first level only |
| `2` | Expand first two levels |
| `n` | Expand first n levels |

---

## Best Practices

### 1. **Limit Grouping Levels**
- 2-3 levels is optimal for readability
- More than 4 levels becomes difficult to navigate
- Consider filtering data instead of deeply nested groups

### 2. **Use Meaningful Group Indexes**
- Start with `0` for the outermost group
- Increment by 1 for each nested level
- Leave gaps (0, 10, 20) if you might insert levels later

### 3. **Combine with Aggregations**
- Always enable aggregations on numeric columns when grouping
- Use `sum` for totals, `avg` for averages, `count` for quantities
- Aggregations provide context for grouped data

### 4. **Configure Expansion Thoughtfully**
- Large datasets: Start collapsed (`0`) to avoid performance issues
- Small datasets: Expand all (`-1`) for immediate visibility
- Hierarchical navigation: Expand first level (`1`) for overview

### 5. **Performance Optimization**
- Use Server-Side Row Model for large datasets (>10,000 rows)
- Enable pagination to limit rendered rows
- Collapse unnecessary groups to reduce DOM elements

### 6. **Visual Clarity**
- Enable "Show Groups on Separate Line" for complex hierarchies
- Use contrasting themes to highlight group rows
- Keep group column wide enough to show full labels

### 7. **Accessibility**
- Ensure group labels are descriptive (not just IDs)
- Test keyboard navigation (Tab, Enter, Arrow keys)
- Verify screen reader compatibility

---

## Troubleshooting

### Problem: Groups Not Appearing

**Symptoms**: Data shows as flat list, no grouping visible

**Solutions**:
1. ✅ Verify **"Enable Row Grouping"** is checked in UI Elements
2. ✅ Ensure at least one column has **"Enable Row Group"** checked
3. ✅ Check that grouped columns have valid data (not null/empty)
4. ✅ Rebuild the widget and refresh Mendix cache (F4)

---

### Problem: Wrong Grouping Order

**Symptoms**: Groups nested incorrectly (e.g., Department before Division)

**Solutions**:
1. ✅ Check **Row Group Index** values (0 = outermost, higher = nested)
2. ✅ Ensure indexes are sequential (0, 1, 2) without gaps
3. ✅ Lower index = higher priority in hierarchy

---

### Problem: Groups Collapsed/Expanded Incorrectly

**Symptoms**: All groups collapsed when you want them expanded (or vice versa)

**Solutions**:
1. ✅ Adjust **"Group Default Expanded"** setting:
   - `-1` = expand all
   - `0` = collapse all
   - `1, 2, 3...` = expand that many levels
2. ✅ Clear browser localStorage to reset saved state
3. ✅ Disable "Use Local Storage" to prevent persistence

---

### Problem: Aggregations Not Showing in Groups

**Symptoms**: Group rows don't show totals/counts

**Solutions**:
1. ✅ Enable **"Enable Aggregation"** on relevant columns
2. ✅ Verify aggregation function is set (sum, avg, count, etc.)
3. ✅ Check "Suppress Aggregation on Group Rows" is `false`
4. ✅ Ensure column data type is numeric (Integer, Decimal, Long)

---

### Problem: Performance Issues with Large Datasets

**Symptoms**: Grid slow to load, browser freezes, laggy scrolling

**Solutions**:
1. ✅ Switch to **Server-Side Row Model** for datasets >10,000 rows
2. ✅ Enable **pagination** to limit rendered rows
3. ✅ Set **"Group Default Expanded"** to `0` (collapse all)
4. ✅ Reduce number of grouping levels (max 3)
5. ✅ Disable unnecessary features (floating filters, sidebar)

---

### Problem: Group Column Too Narrow

**Symptoms**: Group labels truncated, ellipsis (...) shown

**Solutions**:
1. ✅ Groups automatically use 200px minimum width
2. ✅ Drag column header to resize manually
3. ✅ Use `Show in Group Column` sparingly to avoid crowding
4. ✅ Shorten group labels in source data if possible

---

### Problem: Can't Ungroup Data

**Symptoms**: Need to remove grouping temporarily

**Solutions**:
1. ✅ Uncheck **"Enable Row Grouping"** in widget properties
2. ✅ Or uncheck **"Enable Row Group"** on all columns
3. ✅ Rebuild and refresh

---

## Advanced Use Cases

### Dynamic Grouping (User-Controlled)

Allow users to change grouping at runtime:

1. Create a microflow that updates widget configuration
2. Use Mendix page refresh to reload with new settings
3. Store user preferences in session/database

### Custom Group Renderers

Enhance group appearance with custom formatters:

1. Configure custom formatter for group column
2. Use `${value}` template to access group name
3. Add icons, badges, or HTML styling

### Combining Grouping with Filtering

Create powerful data exploration:

1. Enable row grouping for structure
2. Use Filter Drawer for drill-down
3. Combine with toolbar search for quick filtering
4. Result: Hierarchical, searchable, filterable data

### Exporting Grouped Data

Export hierarchical data to Excel/CSV:

1. Enable row grouping as desired
2. Use Export feature in toolbar
3. Groups are preserved in exported file
4. Aggregations included in output

---

## Related Documentation

- [Aggregations Guide](AGGREGATIONS_GUIDE.md) - Learn about sum, avg, count functions
- [Default Sort Guide](DEFAULT_SORT_GUIDE.md) - Multi-column sorting configuration
- [Server-Side Row Model](README.md#server-side-row-model) - Handle large datasets efficiently
- [Custom Formatters](CUSTOM_FORMATTERS_GUIDE.md) - Enhance group display

---

## Summary

Row grouping transforms flat data into hierarchical, navigable structures:

✅ **Enable globally** via "Enable Row Grouping"  
✅ **Configure per column** with "Enable Row Group" + "Row Group Index"  
✅ **Add aggregations** for totals/counts on grouped data  
✅ **Control expansion** with "Group Default Expanded"  
✅ **Optimize performance** with Server-Side Row Model for large datasets  

Need help? Check the [Troubleshooting](#troubleshooting) section or refer to the [AG Grid Row Grouping documentation](https://www.ag-grid.com/javascript-data-grid/grouping/).
