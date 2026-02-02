# Column Aggregations Guide

## Overview
Display summary statistics (sum, average, count, etc.) in column footers and the status bar. This feature helps users quickly understand their data without manual calculations.

## Features

### ✅ Available Aggregation Functions
- **Sum** - Total of all values (numeric columns)
- **Average (Avg)** - Mean of all values (numeric columns)
- **Count** - Number of rows/values
- **Min** - Smallest value (numeric columns)
- **Max** - Largest value (numeric columns)
- **First** - First value in the dataset
- **Last** - Last value in the dataset

### 📊 Display Options
1. **Status Bar** - Shows aggregations for selected rows
2. **Footer Row** - Displays aggregations in a pinned bottom row

## Configuration

### Step 1: Enable Aggregation Footer (Optional)
In the widget's **UI Elements** section:
```
☑️ Enable Aggregation Footer
```
This creates a pinned footer row showing all column aggregations.

### Step 2: Configure Column Aggregations
For each column that should have aggregations, in the **Aggregation** property group:

```
☑️ Enable Aggregation
Aggregation Function: Sum  (or Avg, Count, Min, Max, First, Last)
```

### Step 3: Enable Status Bar (Recommended)
For interactive aggregations on selected rows:
```
UI Elements > ☑️ Enable Status Bar
```

## Usage Examples

### Example 1: Sales Dashboard

**Scenario**: Display total sales, average order value, and order count

| Column | Data Type | Aggregation Function |
|--------|-----------|----------------------|
| Order Amount | Decimal | **Sum** |
| Order Amount | Decimal | **Avg** (create duplicate column) |
| Order ID | String | **Count** |

**Result Footer**:
```
Total Sales: $45,230.50 | Avg Order: $156.25 | Orders: 289
```

### Example 2: Inventory Management

**Scenario**: Track stock levels

| Column | Data Type | Aggregation Function |
|--------|-----------|----------------------|
| Quantity In Stock | Integer | **Sum** |
| Unit Price | Decimal | **Avg** |
| Quantity In Stock | Integer | **Min** |
| Quantity In Stock | Integer | **Max** |

**Result**:
```
Total Stock: 1,245 | Avg Price: $23.50 | Min: 0 | Max: 350
```

### Example 3: Survey Results

**Scenario**: Analyze survey responses

| Column | Data Type | Aggregation Function |
|--------|-----------|----------------------|
| Rating (1-5) | Integer | **Avg** |
| Rating (1-5) | Integer | **Count** |
| Response ID | String | **Count** |

**Result**:
```
Avg Rating: 4.2 | Total Responses: 156
```

## How It Works

### Footer Row Aggregations
- Calculated client-side from visible/filtered data
- Updates automatically when filters change
- Pinned to bottom of grid (scrolls with horizontal scroll)
- Respects column formatters (currency, number formatting, etc.)

### Status Bar Aggregations
- Shows aggregations for **selected rows only**
- Interactive: Select rows to see their aggregations
- Works with both footer and standalone

### Data Processing
```
1. Widget reads all row data
2. For each column with aggregation enabled:
   - Extracts values from rows
   - Filters out null/undefined
   - Applies aggregation function (sum, avg, etc.)
3. Formats result using column's formatter
4. Displays in footer row and/or status bar
```

## Best Practices

### ✅ Do
- Use **Sum** for totals (sales, quantities, costs)
- Use **Avg** for means (ratings, prices, scores)
- Use **Count** for row counts
- Enable **Status Bar** for interactive analysis
- Apply number formatters to aggregated columns

### ❌ Don't
- Don't aggregate text/string columns (use Count instead)
- Don't aggregate date columns (not meaningful)
- Don't enable too many aggregations (performance impact)

## Formatting Tips

### Ensure Proper Display
Aggregations inherit the column's formatter:

```xml
Column: Total Sales
Formatter: Currency (USD)
Aggregation: Sum

Footer displays: $45,230.50 ✅
```

### Custom Decimal Places
```xml
Column: Average Rating
Formatter: Decimal (2 places)
Aggregation: Avg

Footer displays: 4.23 ✅
```

## Performance Considerations

### Client-Side Calculation
- Aggregations calculated in browser
- Efficient for up to ~10,000 rows
- Updates on every filter/sort change

### Optimization Tips
1. Limit aggregations to essential columns
2. Use pagination for large datasets
3. Consider server-side row model for >10,000 rows

## Troubleshooting

### Footer Row Not Showing
**Check:**
- ✅ Enable Aggregation Footer is checked
- ✅ At least one column has aggregation enabled
- ✅ Data is available (not loading state)

### Aggregation Shows 0
**Possible causes:**
- Column data type is not numeric (Sum/Avg/Min/Max)
- All values are null/undefined
- Data type mismatch

**Solution:**
```
1. Verify column attribute is Integer/Long/Decimal
2. Check data source has values
3. Use Count for non-numeric columns
```

### Status Bar Aggregations Not Updating
**Solution:**
- Select rows by clicking them
- Aggregations update based on selection
- Clear selection to see all-data aggregations in footer

## Examples by Use Case

### Financial Reports
```
Revenue: Sum
Profit Margin: Avg
Transactions: Count
```

### E-commerce
```
Order Total: Sum
Items per Order: Avg
Orders: Count
Units Sold: Sum
```

### Analytics Dashboard
```
Page Views: Sum
Bounce Rate: Avg
Sessions: Count
Avg Session Duration: Avg
```

### HR/Employee Data
```
Total Salary: Sum
Average Salary: Avg
Employees: Count
Years of Service: Avg
```

## Advanced: Combining with Other Features

### With Filters
Aggregations update automatically when filters are applied:
```
1. Apply filter: Status = "Active"
2. Footer shows aggregations for active rows only
3. Status bar shows aggregations for selected active rows
```

### With Sorting
Aggregations remain consistent regardless of sort order:
```
1. Sort by Date (newest first)
2. Aggregations still calculate across all visible rows
3. Footer displays same totals
```

### With Pagination
Aggregations calculate across **all pages**, not just current page:
```
Page 1 of 5 displayed
Footer shows: Total across all 5 pages ✅
```

## Related Documentation
- **Status Bar Configuration**: Enable status bar for interactive aggregations
- **Formatters Guide**: Format aggregation display (currency, decimals, etc.)
- **Column Configuration**: Set up columns with proper data types
