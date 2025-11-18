# Data Export Guide

## Overview

The AG Grid widget supports multiple data export formats:
- **CSV Export**: Export to comma-separated values (.csv) file
- **Excel Export**: Export to Microsoft Excel (.xlsx) file *(requires AG Grid Enterprise license)*
- **PDF Export**: Export to formatted PDF document using pdfMake

All export formats respect current filters and sorting applied to the grid.

## Configuration

### CSV Export Configuration

In Mendix Studio Pro, configure your AG Grid widget:

1. Select the AG Grid widget
2. Go to **Properties** → **Data Export** tab
3. Configure CSV export options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Enable CSV Export** | Boolean | false | Show the CSV export button in the toolbar |
| **CSV File Name** | String | "export" | Default filename for the exported CSV (without .csv extension) |
| **Export All Columns** | Boolean | true | Export all columns. Set to false to only export visible columns |

**Example:**
```
✓ Enable CSV Export: true
  CSV File Name: "customer-data"
  ✓ Export All Columns: true
```

### Excel Export Configuration

**⚠️ Requires AG Grid Enterprise License** - See [LICENSE_SETUP.md](./LICENSE_SETUP.md)

1. Select the AG Grid widget
2. Go to **Properties** → **Data Export** tab
3. Configure Excel export options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Enable Excel Export** | Boolean | false | Show the Excel export button in the toolbar |
| **Excel File Name** | String | "export" | Default filename for the exported Excel file (without .xlsx extension) |
| **Export All Columns (Excel)** | Boolean | true | Export all columns. Set to false to only export visible columns |

**Example:**
```
✓ Enable Excel Export: true
  Excel File Name: "customer-data"
  ✓ Export All Columns (Excel): true
```

### PDF Export Configuration

1. Select the AG Grid widget
2. Go to **Properties** → **Data Export** tab
3. Configure PDF export options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Enable PDF Export** | Boolean | false | Show the PDF export button in the toolbar |
| **PDF File Name** | String | "export" | Default filename for the exported PDF (without .pdf extension) |
| **PDF Page Orientation** | Enum | landscape | Page orientation: "landscape" or "portrait" |
| **PDF Document Title** | String | "" | Optional title displayed at the top of the PDF document |

**Example:**
```
✓ Enable PDF Export: true
  PDF File Name: "report"
  PDF Page Orientation: landscape
  PDF Document Title: "Sales Report Q4 2025"
```

## How It Works

### Export Buttons

When enabled, export buttons appear in the toolbar (right side, after the filters button):

**CSV Export Button:**
- Download icon with "CSV" text
- Tooltip: "Export to CSV"
- Accessible via keyboard navigation

**Excel Export Button:**
- Download icon with "XLSX" text
- Tooltip: "Export to Excel"
- Only works with valid AG Grid Enterprise license

**PDF Export Button:**
- Download icon with "PDF" text
- Tooltip: "Export to PDF"
- Works without any license required

### What Gets Exported

All export formats (CSV, Excel, PDF) include:

✅ **Current grid data** - Only rows currently displayed  
✅ **Filtered data** - Respects active filters  
✅ **Sorted data** - Respects current sorting  
✅ **Formatted values** - Uses display values (not raw data)  
✅ **Column headers** - Includes column names  

**PDF exports additionally include:**
- Sort indicators in headers (↑ for ascending, ↓ for descending)
- Alternating row colors for readability
- Optional document title
- Automatic page numbers
- Generation timestamp
- Professional table formatting

**Export options:**
- **All Columns**: Exports all configured columns (including hidden ones)
- **Visible Columns Only**: Exports only columns currently visible in the grid

### File Naming

Files are named based on the configured property:

**CSV Export:**
- Format: `{csvFileName}.csv`
- Example: Property value `customer-data` → File `customer-data.csv`

**Excel Export:**
- Format: `{excelFileName}.xlsx`
- Example: Property value `sales-report` → File `sales-report.xlsx`

**PDF Export:**
- Format: `{pdfFileName}.pdf`
- Example: Property value `monthly-report` → File `monthly-report.pdf`

## User Experience

### Export Flow

**CSV Export:**
1. User clicks **CSV** button in toolbar
2. Widget automatically switches to Grid view if needed (returns to original view after export)
3. Browser downloads `.csv` file automatically
4. File opens in default CSV application (Excel, Google Sheets, etc.)

**Excel Export:**
1. User clicks **XLSX** button in toolbar
2. Browser downloads `.xlsx` file automatically
3. File opens in Microsoft Excel or compatible application
4. Data includes Excel-specific formatting

**PDF Export:**
1. User clicks **PDF** button in toolbar
2. Browser downloads `.pdf` file automatically
3. File opens in default PDF viewer (Acrobat, Browser, etc.)
4. Data rendered in formatted table with styling

### What Users See

```
┌─────────────────────────────────┐
│  [Grid] [Cards] [Search...]     │  [Filters] [📥 CSV] [📥 XLSX] [📥 PDF] [⋮]
└─────────────────────────────────┘
```

Click any export button → Instant download in chosen format

## Use Cases

### Common Scenarios

1. **Export filtered results**
   - User applies filters to find specific records
   - Clicks CSV export
   - Gets only the filtered data

2. **Export sorted data**
   - User sorts by a column (e.g., Date Descending)
   - Exports CSV
   - CSV maintains the sort order

3. **Export visible columns only**
   - User hides unnecessary columns
   - Sets "Export All Columns" to false
   - Exports only visible columns

4. **Scheduled reports**
   - User exports data regularly
   - Custom filename helps organize exports
   - Files named by purpose (e.g., "weekly-sales")

## Technical Details

### AG Grid API

The widget uses different export approaches:

**CSV Export:**
```typescript
gridApi.exportDataAsCsv({
    fileName: 'export.csv',
    allColumns: true
});
```

**Excel Export (Enterprise):**
```typescript
gridApi.exportDataAsExcel({
    fileName: 'export.xlsx',
    allColumns: true
});
```

**PDF Export:**
```typescript
// Uses pdfMake library
exportToPDF(gridApi, {
    fileName: 'export',
    pageOrientation: 'landscape',
    title: 'My Report'
});
```

### Browser Compatibility

All export formats work in all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### License Requirements

| Feature | License Required |
|---------|-----------------|
| CSV Export | ❌ No - Available in Community edition |
| Excel Export | ✅ Yes - Requires AG Grid Enterprise license |
| PDF Export | ❌ No - Uses pdfMake library (MIT license) |

Configure Enterprise license: [LICENSE_SETUP.md](./LICENSE_SETUP.md)

### File Formats

**CSV Format:**
- Encoding: UTF-8
- Delimiter: Comma (`,`)
- Line endings: CRLF (`\r\n`)
- Text qualification: Quoted strings for values containing commas
- Headers: First row contains column names

**Excel Format (.xlsx):**
- Native Excel file format
- Preserves data types (numbers, dates, text)
- Single worksheet with grid data
- Column headers in first row
- Compatible with Excel 2007+

**PDF Format (.pdf):**
- Generated using pdfMake library
- Professional table layout with borders
- Alternating row colors (gray/white)
- Sort indicators in headers
- Configurable page orientation
- Automatic page breaks
- Page numbers and timestamp in footer
- Optional document title
- Compatible with all PDF viewers

## Troubleshooting

### Export Button Not Visible

**Cause**: Export feature is disabled in widget properties

**Solution**:
1. Select the widget in Studio Pro
2. Go to Properties → Data Export
3. Check "Enable CSV Export", "Enable Excel Export", or "Enable PDF Export"
4. Save and redeploy

### Excel Export Button Shows But Doesn't Work

**Cause**: Missing or invalid AG Grid Enterprise license

**Solution**:
1. Verify you have an Enterprise license key
2. Configure license in widget properties (General tab → License Key)
3. See [LICENSE_SETUP.md](./LICENSE_SETUP.md) for detailed instructions
4. Check browser console for license-related errors

### Empty Export File

**Cause**: No data in grid (all rows filtered out)

**Solution**:
- Check filters - may be too restrictive
- Clear filters and try again
- Verify data source has records

### Wrong Columns Exported

**Cause**: "Export All Columns" setting doesn't match expectation

**Solution**:
- **To export all**: Set "Export All Columns" to true
- **To export visible only**: Set "Export All Columns" to false

### File Name Issues

**Cause**: Special characters in filename

**Solution**:
- Use alphanumeric characters and hyphens
- Avoid: `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`
- Good: `customer-data`, `sales-2025`, `report-q1`

### PDF Export Issues

**Problem**: PDF exports with wrong orientation

**Solution**:
- Check "PDF Page Orientation" setting in widget properties
- Choose "landscape" for wide tables (many columns)
- Choose "portrait" for narrow tables (few columns)

**Problem**: PDF table doesn't fit on page

**Solution**:
- Use landscape orientation for tables with many columns
- Consider exporting visible columns only (hide unnecessary columns first)
- Reduce column count if possible

**Problem**: PDF doesn't show document title

**Solution**:
- Set "PDF Document Title" property in widget configuration
- Leave blank if you don't want a title

## Future Enhancements

Potential improvements (see [ROADMAP.md](../ROADMAP.md)):

- [ ] **Custom column selection**: Interactive dialog to choose columns before export
- [ ] **Export selected rows**: Export only user-selected rows
- [ ] **Export options dialog**: Advanced settings (margins, fonts, colors)
- [ ] **Schedule exports**: Automatic exports on a schedule
- [ ] **Multi-sheet Excel**: Export related data across multiple worksheets
- [ ] **PDF images**: Include image columns in PDF export
- [ ] **PDF charts**: Embed charts/graphs in PDF documents

## Examples

### Example 1: CSV Export

```
Configuration:
- Enable CSV Export: true
- CSV File Name: "customer-list"
- Export All Columns: true

Result: Downloads "customer-list.csv" with all columns
```

### Example 2: Excel Export (Enterprise)

```
Configuration:
- Enable Excel Export: true
- Excel File Name: "sales-data"
- Export All Columns (Excel): true
- License Key: [configured in General tab]

Result: Downloads "sales-data.xlsx" in Excel format
```

### Example 3: PDF Export

```
Configuration:
- Enable PDF Export: true
- PDF File Name: "quarterly-report"
- PDF Page Orientation: landscape
- PDF Document Title: "Q4 2025 Sales Report"

Result: Downloads "quarterly-report.pdf" with:
        - Landscape orientation
        - Document title at top
        - Formatted table with alternating row colors
        - Page numbers and timestamp
```

### Example 4: Filtered Export

```
User Actions:
1. Applies filter: Status = "Active"
2. Sorts by: Name (Ascending)
3. Clicks any export button (CSV, XLSX, or PDF)

Result: Export contains only active records, sorted by name
        PDF shows sort indicator (↑) in Name column header
```

### Example 5: All Formats Enabled

```
Configuration:
✓ Enable CSV Export: true
  CSV File Name: "data"
✓ Enable Excel Export: true
  Excel File Name: "data"
✓ Enable PDF Export: true
  PDF File Name: "data"
  PDF Page Orientation: landscape

Result: Users can choose between CSV, Excel, or PDF format
        Three export buttons appear in toolbar
```

## Best Practices

1. **Use descriptive filenames**: Help users organize exported files (e.g., `sales-q4-2025`, `customer-report-nov`)
2. **Export visible columns only**: When users have hidden irrelevant columns, set Export All Columns to false
3. **Choose the right format**: 
   - **CSV** for simple data, universal compatibility, data import/exchange
   - **Excel** for formatted data, formulas, corporate environments
   - **PDF** for presentation, reports, archiving, read-only distribution
4. **PDF orientation matters**:
   - Use **landscape** for wide tables (5+ columns)
   - Use **portrait** for narrow tables or vertical lists
5. **Add PDF titles**: Set document title for professional reports (e.g., "Monthly Sales Report - November 2025")
6. **Document for users**: Explain export buttons in your app's help text
7. **Test filters first**: Ensure filters work correctly before exporting
8. **Consider data volume**: 
   - CSV/Excel: Can handle 50,000+ rows efficiently
   - PDF: Best for <1,000 rows (larger documents get slow/unwieldy)
9. **Enterprise license**: Only enable Excel export if you have a valid license configured

## Consolidated Export Control

**New in version 1.0.0+**: When multiple export formats are enabled, the widget automatically consolidates them into a single "Export" button with a dropdown menu.

### How It Works

- **Single export enabled**: Shows dedicated CSV/Excel/PDF button
- **Multiple exports enabled**: Shows single "Export" button that opens a menu

### Export Menu Features

1. **Format Selection**: Choose between enabled formats (CSV, Excel, PDF)
2. **Custom Filename**: Override the default filename per export
3. **All Columns Toggle**: Choose whether to export all or only visible columns
4. **PDF Options**: Set page orientation and document title
5. **Preference Persistence**: Your last export choice is remembered

### Using the Export Menu

1. Click the **Export** button in the toolbar
2. Select your preferred format (CSV, Excel, or PDF)
3. Optionally customize:
   - Filename
   - All columns toggle
   - PDF-specific options (orientation, title)
4. Click **Export** to download

**Example:**
```
User clicks Export → Selects "Excel" → Changes filename to "Q4-Sales" 
→ Unchecks "Export all columns" → Clicks Export
→ Downloads Q4-Sales.xlsx with only visible columns
→ Next time: Excel is pre-selected with previous settings
```

## Troubleshooting

### CSV Export Issues

**Problem**: CSV export button clicked but no file downloads

**Solutions**:
1. **Check browser console** (F12) for diagnostic messages:
   - Look for `[AGGrid] Getting CSV data from grid` message
   - Check `displayedRowCount` - should be > 0
   - If count is 0, grid has no data loaded

2. **Verify grid has data**:
   - Check that the grid displays data visually
   - Verify datasource is loaded (check Mendix network tab)

3. **Browser popup blockers**:
   - Allow downloads from your Mendix app domain
   - Check browser settings for blocked downloads

4. **Check filename**: Ensure filename doesn't contain invalid characters (`/`, `\`, `:`, `*`, `?`, `<`, `>`, `|`)

**Note**: CSV export automatically switches to Grid view if you're in Card or List view, exports the data, then switches back to your original view. This happens in about 500ms (half a second) and ensures CSV export works from any view mode.

**Problem**: "Error: Could not generate CSV data. Make sure you're in Grid view and the grid is fully loaded."

**Cause**: Grid API not fully initialized when export is triggered

**Solutions**:
1. **Wait for initial load**: Give the grid 1-2 seconds to fully initialize after page load before attempting first export
2. **Try again**: If you get this error, simply click export again - the second attempt usually succeeds
3. **Check console logs** (F12) for detailed diagnostic info:
   - `[AGGrid] Grid API available: true/false`
   - `[AGGrid] Current view mode: grid/cards/list`
   - `displayedRowCount` should be > 0
   - Look for `apiMethods` check to verify grid is ready

**Advanced Debugging**:
If the error persists, check the console for:
```
[AGGrid] Grid state validated {
  currentView: "grid",
  displayedRowCount: 123,  // Should be > 0
  totalColumns: 8,          // Should match your column count
  apiMethods: {             // All should be "function"
    getDisplayedRowCount: "function",
    getDataAsCsv: "function",
    getAllGridColumns: "function"
  }
}
```

If `displayedRowCount` is 0 or any `apiMethods` are not "function", the grid is not fully initialized.

**Problem**: CSV contains sample data (Toyota, Ford, Porsche) instead of actual grid data

**Cause**: Mendix datasource not loaded when export is triggered

**Solutions**:
1. Check console for `displayedRowCount` in export logs
2. Ensure Mendix datasource has `status === "available"`
3. Verify grid displays correct data visually before exporting
4. Try refreshing the page and waiting for data to load completely

**Problem**: "Export all columns" checkbox has no effect

**Expected Behavior**:
- ✅ Checked: Exports ALL columns (including hidden ones)
- ❌ Unchecked: Exports ONLY visible columns

**Debug Steps**:
1. Open browser console (F12)
2. Click export
3. Look for `allColumns: true` or `allColumns: false` in console logs
4. Verify column visibility settings in grid

### Excel Export Issues

**Problem**: Excel export button doesn't appear

**Solution**: Verify you have:
1. Set `Enable Excel Export` to true in widget properties
2. Configured AG Grid Enterprise license in widget settings
3. Restarted Mendix app after adding license

**Problem**: Excel export throws license error

**Solution**: See [LICENSE_SETUP.md](./LICENSE_SETUP.md) for proper license configuration

### PDF Export Issues

**Problem**: PDF is too wide or text is cut off

**Solution**: Change page orientation to landscape in widget settings

**Problem**: PDF has too many rows and is slow

**Solution**: PDF export works best with <1,000 rows. Consider filtering data first or using CSV/Excel for large datasets

### General Export Issues

**Problem**: Exported file has wrong data or is empty

**Debug Checklist**:
1. ✅ Grid visually displays correct data
2. ✅ Filters are applied as expected
3. ✅ Browser console shows no errors
4. ✅ Datasource status is "available"
5. ✅ Column configuration is correct

**Problem**: Export triggered but nothing happens

1. Check browser's Downloads folder
2. Check browser's download history (Ctrl+J / Cmd+Shift+J)
3. Look for blocked downloads in browser address bar
4. Check browser console for JavaScript errors

## Related Documentation

- [LICENSE_SETUP.md](./LICENSE_SETUP.md) - Configure AG Grid Enterprise license for Excel export
- [CONFIGURATION_EXAMPLES.md](./CONFIGURATION_EXAMPLES.md) - Widget configuration examples
- [VIEW_MODES_GUIDE.md](./VIEW_MODES_GUIDE.md) - Understanding view modes
- [SORT_FILTER_TROUBLESHOOTING.md](./SORT_FILTER_TROUBLESHOOTING.md) - Debugging filters

---

**Feature Status**: 
- ✅ CSV Export: Available in version 1.0.0+
- ✅ Excel Export: Available in version 1.0.0+ (Enterprise license required)
- ✅ PDF Export: Available in version 1.0.0+ (No license required)
- ✅ Consolidated Export Menu: Available in version 1.0.0+
