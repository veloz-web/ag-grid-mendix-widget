# AG Grid Widget for Mendix

A powerful Mendix pluggable widget that integrates AG Grid into your Mendix applications, providing advanced data grid capabilities with multiple view modes, responsive design, filtering, and comprehensive formatting options.

## ✨ Key Features

- **AG Grid Enterprise Ready**: Built with Enterprise modules - just add your license key
- **Advanced Filtering**: Set filters, multi-filters, text/number/date filters included
- **Server-Side Row Model**: Handle large datasets with server-side operations
- **Data Export**: Export to Excel (.xlsx), CSV, and PDF with configurable options
- **Column Pinning**: Pin columns to left or right side for better data visibility
- **Multiple View Modes**: Switch between Grid, Cards, and List views
- **Custom Formatters**: Define reusable formatters in widget config (no code changes needed!)
- **Responsive Design**: Automatic view switching based on device (desktop/mobile)
- **Filter Drawer**: Slide-out filter panel with Apply Changes button for staged updates
- **Rich Formatters**: 16+ built-in formatters including status badges with JSON mapping
- **Dynamic Row Height**: Fixed, auto-expanding, or custom per-row heights with text wrapping
- **Virtual Scrolling & Performance Tuning**: Configurable row buffer, server-side cache blocks, and memory management
- **Row Styling**: Apply dynamic row class names based on data values
- **Inline Editing**: Edit cell values with Mendix microflow commits
- **Row Delete Actions**: Delete rows from toolbar or context menu with confirmation
- **Row Events**: Single-click and double-click actions with Mendix microflow/nanoflow support
- **Data Polling**: Auto-detect and notify users of new data
- **Theme Support**: 4 modern themes (Alpine, Balham, Material, Quartz)
- **Design-Time Preview**: See your grid in Mendix Studio Pro without running the app
- **Touch-Friendly**: Optimized for both desktop and mobile interactions

## 📚 Documentation Index

### Getting Started
- **[GETTING_STARTED.md](./docs/GETTING_STARTED.md)** - 📸 Visual walkthrough with screenshots
- **[QUICK_SETUP_GUIDE.md](./docs/QUICK_SETUP_GUIDE.md)** - Quick reference guide
- **[DEPLOYMENT_STEPS.md](./docs/DEPLOYMENT_STEPS.md)** - How to deploy the widget
- **[CONFIGURATION_EXAMPLES.md](./docs/CONFIGURATION_EXAMPLES.md)** - Real-world examples

### Features & Configuration
- **[VIEW_MODES_GUIDE.md](./VIEW_MODES_GUIDE.md)** - Grid, Cards, and List views
- **[CUSTOM_FORMATTERS_GUIDE.md](./CUSTOM_FORMATTERS_GUIDE.md)** - 📝 Create custom cell formatters with JavaScript
- **[CUSTOM_TEMPLATES_README.md](./CUSTOM_TEMPLATES_README.md)** - Custom card/list templates
- **[DATE_FORMATTING_GUIDE.md](./DATE_FORMATTING_GUIDE.md)** - Date formatting options
- **[DEFAULT_SORT_GUIDE.md](./DEFAULT_SORT_GUIDE.md)** - Configure default sorting
- **[TEXT_ALIGNMENT_GUIDE.md](./TEXT_ALIGNMENT_GUIDE.md)** - Align text in columns
- **[COLUMN_WIDTH_CONFIGURATION.md](./COLUMN_WIDTH_CONFIGURATION.md)** - Column width options
- **[ROW_GROUPING_GUIDE.md](./ROW_GROUPING_GUIDE.md)** - Hierarchical data grouping
- **[AGGREGATIONS_GUIDE.md](./AGGREGATIONS_GUIDE.md)** - Column footers with sum, avg, count
- **[ROW_HEIGHT_GUIDE.md](./ROW_HEIGHT_GUIDE.md)** - Dynamic row height configuration
- **[VIRTUAL_SCROLLING_GUIDE.md](./VIRTUAL_SCROLLING_GUIDE.md)** - Virtual scrolling & performance tuning
- **[ROW_CLASS_GUIDE.md](./ROW_CLASS_GUIDE.md)** - Dynamic row class styling
- **[INLINE_EDITING_GUIDE.md](./INLINE_EDITING_GUIDE.md)** - Inline editing configuration
- **[POLLING_GUIDE.md](./POLLING_GUIDE.md)** - Auto-detect new data
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** - Keyboard navigation & accessibility

### Troubleshooting
- **[ACTIONS_TROUBLESHOOTING.md](./docs/ACTIONS_TROUBLESHOOTING.md)** - Fix row click action issues
- **[ROW_CLICK_ACTIONS.md](./docs/ROW_CLICK_ACTIONS.md)** - Configure row click behavior
- **[SORT_FILTER_TROUBLESHOOTING.md](./docs/SORT_FILTER_TROUBLESHOOTING.md)** - Sort & filter debugging

### Advanced
- **[LICENSE_SETUP.md](./docs/LICENSE_SETUP.md)** - AG Grid Enterprise license configuration

### Project Info
- **[ROADMAP.md](./ROADMAP.md)** - Planned features and future enhancements

## 🔑 AG Grid Enterprise License

This widget supports both **AG Grid Community** (free) and **AG Grid Enterprise** (paid license).

**To use Enterprise features:**
1. Configure your license key in the widget properties (Grid Options section)
2. See [LICENSE_SETUP.md](./docs/LICENSE_SETUP.md) for setup guide

**Using Community Edition:**
- No configuration needed
- Leave license key empty
- All basic features work perfectly

## 📋 Requirements

**For using the widget:**
- Mendix 10.18.6 or higher

**For building from source:**
- Node.js 18 LTS
- npm or pnpm

## 🚀 Quick Start

### For Mendix Users

No code required! Configure the widget through Mendix Studio Pro:

1. **Add widget** to your page from the toolbox
2. **Select datasource** (Database, Microflow, or Nanoflow)
3. **Add columns** and map to your entity attributes
4. **Run** and see your data grid!

👉 **[Visual Walkthrough](./docs/GETTING_STARTED.md)** - Step-by-step guide with screenshots

### For Developers

Build the widget from source:
- `npm install` - Install dependencies
- `npm run release` - Build production .mpk file
- `npm start` - Development mode with hot reload

## 🎨 Key Capabilities

### Multiple View Modes
- **Grid View**: Traditional table with full AG Grid features
- **Cards View**: Mobile-friendly card layout
- **List View**: Compact format for simple browsing

**View selector adapts automatically** based on your configuration. Users can switch views with one click.

See **[VIEW_MODES_GUIDE.md](./docs/VIEW_MODES_GUIDE.md)** for details.

### Data Source Flexibility

Works with any Mendix data source:
- Database entities (with optional XPath filtering)
- Microflows (custom logic and calculations)
- Nanoflows (client-side data)
- Associations (related entities)

**No ListView or DataGrid2 required** - the widget handles data directly.

See **[CONFIGURATION_EXAMPLES.md](./docs/CONFIGURATION_EXAMPLES.md)** for real-world examples.
1. Retrieve Customer list from database
2. Apply custom filtering/sorting logic
3. Add calculated attributes
4. Return list
```

#### Example 3: Using Context with Association

When you have a context object (e.g., from a DataView) and want to show related entities:

```
Page Structure:
└── DataView (Context: Order)
    └── AG Grid Widget
        └── Data Source: Database
            └── Entity: MyModule.OrderLine
            └── XPath: [MyModule.OrderLine_Order = '[%CurrentObject%]']
```

Or using association directly:
```
└── DataView (Context: Order)
    └── AG Grid Widget
        └── Data Source: Association
            └── Association: Order_OrderLine
```

#### Example 4: Nanoflow for Client-Side Data

```
Page Structure:
└── AG Grid Widget
    └── Data Source: Nanoflow
        └── Nanoflow: ACT_FilterCustomersLocal
```

**Use Case:** When you want to filter/transform data on the client side without server round-trips.

## Widget Configuration

### 1. Data Source Setup

In the **Data Source** property group:

- **Data source**: Choose your entity and retrieval method
  - This will provide a **list** of objects to display
  - The widget expects `isList="true"` in the configuration

### 2. Column Configuration

For each column, you need to configure:

| Property | Description | Required |
|----------|-------------|----------|
| **Header** | Column header text displayed to users | Yes |
| **Attribute** | The entity attribute to display in this column | Yes |
| **Width** | Column width in pixels (default: 150) | No |
| **Sortable** | Enable sorting for this column (default: true) | No |
| **Filter** | Enable filtering for this column (default: true) | No |
| **Resizable** | Allow users to resize column (default: true) | No |

**Supported Attribute Types:**
- String
- Integer
- Long
- Decimal
- Boolean (displayed as "Yes"/"No")
- DateTime (formatted with locale)
- Enumeration

### 3. Grid Options

| Property | Description | Default |
|----------|-------------|---------|
| **Enable Pagination** | Show pagination controls | true |
| **Page Size** | Number of rows per page | 20 |
| **Height** | Grid height in pixels | 500 |
| **Theme** | Visual theme (Alpine/Balham/Material/Quartz) | Alpine |

### 4. Events

| Event | Description |
|-------|-------------|
| **On Row Click** | Action executed when user clicks a row |
| **On Row Double Click** | Action executed when user double-clicks a row |

## Complete Setup Example

### Scenario: Customer Management Grid

**Domain Model:**
```
Entity: Customer
Attributes:
  - Name (String)
  - Email (String)
  - Phone (String)
  - Status (Enumeration: Active/Inactive)
  - RegisteredDate (DateTime)
  - OrderCount (Integer)
```

**Page Setup:**

1. **Create a page** (e.g., `Customer_Overview`)
2. **Add the AG Grid widget** directly to the page (no DataView needed)
3. **Configure Data Source:**
   - Data Source Type: Database
   - Entity: `Customer`
   - XPath: `[Status = 'Active']` (optional filter)

4. **Configure Columns:**

   | Header | Attribute | Width | Sortable | Filter |
   |--------|-----------|-------|----------|--------|
   | Customer Name | Name | 200 | ✓ | ✓ |
   | Email | Email | 250 | ✓ | ✓ |
   | Phone | Phone | 150 | ✓ | ✓ |
   | Status | Status | 100 | ✓ | ✓ |
   | Registered | RegisteredDate | 180 | ✓ | ✓ |
   | Orders | OrderCount | 100 | ✓ | ✓ |

5. **Configure Grid Options:**
   - Enable Pagination: Yes
   - Page Size: 25
   - Height: 600
   - Theme: Alpine

6. **Configure Events (Optional):**
   - On Row Click: Call microflow `ACT_OpenCustomerDetails`
   - On Row Double Click: Call microflow `ACT_EditCustomer`
   - Pass the clicked Customer object to the microflow

## Advanced Usage

### Using Microflows for Complex Data

When you need to:
- Combine data from multiple entities
- Add calculated fields
- Apply complex business logic
- Format data before display

**Example Microflow (ACT_GetEnrichedCustomerList):**

```
1. Retrieve all Customers
2. For each Customer:
   - Calculate total order value
   - Count pending orders
   - Check last login date
3. Create a non-persistable entity with enriched data
4. Return list of enriched objects
```

Then configure the widget to use this microflow as the data source.

### Dynamic XPath Based on User Context

Use a microflow to build dynamic queries:

```
Input: CurrentUser
Output: List of Customer

Logic:
- If user role = 'Admin': Return all customers
- If user role = 'Manager': Return customers in user's region
- If user role = 'Sales': Return user's assigned customers
```

### Refresh Data

To refresh the grid data:
1. Use a **Refresh Object** action in a microflow
2. Trigger a **Data Source** refresh
3. Or use a **Change Object** action that modifies the data source

## Styling and Themes

The widget includes three built-in AG Grid themes:

### Alpine (Default)
Modern, clean design with good contrast
```
Theme: alpine
```

### Balham
Professional business theme
```
Theme: balham
```

### Material
Google Material Design inspired
```
Theme: material
```

### Custom Styling

You can add custom CSS to your theme:

```css
/* In your theme's CSS */
.ag-theme-alpine {
    --ag-header-background-color: #f0f0f0;
    --ag-odd-row-background-color: #fafafa;
}
```

## Performance Considerations

### Large Data Sets

For optimal performance with large datasets:

1. **Use Pagination**: Always enable pagination for 100+ rows
2. **XPath Filtering**: Filter data at the database level, not client-side
3. **Limit Columns**: Only show necessary columns
4. **Microflow Optimization**: Use batch operations and efficient queries

### Recommended Limits

- **Without Pagination**: Up to 100 rows
- **With Pagination**: Up to 10,000 rows
- **Above 10,000 rows**: Consider server-side pagination or on-demand loading

## Troubleshooting

### Widget Not Showing Data

**Check:**
1. Data source is configured correctly
2. Entity has data in the database
3. XPath constraint isn't too restrictive
4. User has read access to the entity

### Columns Not Displaying

**Check:**
1. Attributes are mapped correctly
2. Column headers are defined
3. Attribute types are supported

### Styling Issues

**Check:**
1. AG Grid CSS files are loaded
2. Theme is correctly selected
3. Height is set appropriately
4. No CSS conflicts with Mendix theme

### Performance Issues

**Solutions:**
1. Enable pagination
2. Reduce page size
3. Limit number of columns
4. Optimize data source (use indexes, efficient XPath)
5. Use microflow to pre-filter data

## Custom Formatters 🎨

**NEW!** Define custom cell formatters using JavaScript to create status badges, progress bars, icons, and more. Each formatter has two parts:
- **Formatter Code**: JavaScript function that transforms the cell value
- **Formatter Configuration**: JSON data passed to your function for customization

### How It Works

Both the **Formatter Code (Function)** and **Formatter Configuration (JSON)** work together:
- The configuration provides your data (mappings, colors, settings)
- The function uses that data to render each cell

### Quick Example: Status Badges

**Formatter Code**:
```javascript
try {
    const mappings = config || [];
    const mapping = mappings.find(m => m.value === value);
    
    if (!mapping) {
        return `<span class="badge badge-secondary">${value}</span>`;
    }
    
    return `<span class="badge ${mapping.className}">${mapping.label}</span>`;
} catch (e) {
    console.error("Formatter error:", e);
    return String(value || "");
}
```

**Formatter Configuration**:
```json
[
    {"value":"Approved","label":"✓ Approved","className":"badge-success"},
    {"value":"Denied","label":"✗ Denied","className":"badge-danger"},
    {"value":"Pending","label":"⏳ Pending","className":"badge-warning"}
]
```

**Result**: Your status values automatically render as colored badges with icons!

### Available Variables

Your formatter function receives:
- `value` - The cell's value
- `item` - Full row data (access other columns!)
- `column` - Column configuration
- `config` - Your JSON configuration (parsed)

### More Examples

See **[CUSTOM_FORMATTERS_GUIDE.md](./CUSTOM_FORMATTERS_GUIDE.md)** for comprehensive examples including:
- ✅ Status badges with color mapping
- 📊 Progress bars
- 🎨 Priority indicators with icons
- 💰 Currency formatting
- 👤 Multi-line user cards
- ⚡ Conditional formatting based on multiple columns
- And much more!

### Best Practices

1. ✅ **Always use try-catch** - Prevents grid crashes
2. ✅ **Handle null/undefined** - Data might be missing
3. ✅ **Keep it fast** - Runs for every cell
4. ✅ **Validate config** - JSON errors are easy to make
5. ✅ **Test edge cases** - Empty strings, special characters

👉 **[Read the Complete Guide](./CUSTOM_FORMATTERS_GUIDE.md)** for detailed examples and troubleshooting.

### Benefits
- ✅ Reusable across multiple widgets/columns
- ✅ Centralized formatting logic
- ✅ No widget code changes needed
- ✅ Self-documenting templates

### Documentation
- **[Custom Formatters Guide](./CUSTOM_FORMATTERS_GUIDE.md)** - Complete documentation with 5 examples
- **[Status Badge Example](./STATUS_BADGE_EXAMPLE.md)** - Quick-start migration guide
- **[Implementation Summary](./CUSTOM_FORMATTERS_SUMMARY.md)** - Technical details

## Development

### Code Quality & Linting

This project uses ESLint with TypeScript support for code quality. Key linting rules include:

- **Unused Variables/Parameters**: Parameters prefixed with underscore (`_`) are ignored by the linter
  - Example: `function myFunction(_unusedParam: string) { ... }`
  - This allows keeping function signatures consistent while indicating intentionally unused parameters
- **Formatting**: Prettier is used for consistent code formatting
- **TypeScript**: Strict type checking with some relaxed rules for Mendix widget compatibility

### Building & Testing

```bash
# Install dependencies
npm install

# Development server with hot reloading
npm start

# Build for development
npm run build

# Build for production/release
npm run release

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── components/          # React components
│   ├── GridView.tsx    # AG Grid integration
│   ├── CardView.tsx    # Mobile card layout
│   ├── FilterDrawer.tsx # Filter panel
│   └── CustomTemplateView.tsx # Custom HTML templates
├── utils/              # Utility functions
│   ├── formatters.ts   # Value formatting
│   ├── renderers.ts    # Cell renderers
│   └── customFormatters.ts # Runtime formatter compilation
└── types.ts           # TypeScript interfaces
```

## Feature Roadmap

### ✅ Implemented Features
- [x] **Export to Excel/CSV/PDF** - Full export functionality with configurable options
- [x] **Column pinning** - Pin columns to left or right, with user-configurable pinning via menu
- [x] **Custom cell renderers** - Via custom formatters and template system
- [x] **Server-side row model** - Handle very large datasets with server-side operations
- [x] **Advanced aggregations** - Sum, count, avg, min, max in column footers and group rows
- [x] **Row grouping** - Hierarchical data display with multi-level grouping (see [ROW_GROUPING_GUIDE.md](./ROW_GROUPING_GUIDE.md))
- [x] **Dynamic row height** - Fixed, auto-expanding, and custom per-row heights with text wrapping (see [ROW_HEIGHT_GUIDE.md](./ROW_HEIGHT_GUIDE.md))
- [x] **Virtual scrolling tuning** - Configure row buffer and server-side cache for large datasets (see [VIRTUAL_SCROLLING_GUIDE.md](./VIRTUAL_SCROLLING_GUIDE.md))
- [x] **Row class styling** - Apply CSS classes based on row values (see [ROW_CLASS_GUIDE.md](./ROW_CLASS_GUIDE.md))
- [x] **Inline editing** - Edit cells with Mendix action commits (see [INLINE_EDITING_GUIDE.md](./INLINE_EDITING_GUIDE.md))
- [x] **Row delete actions** - Delete rows from the toolbar or context menu
- [x] **Row double-click event** - Separate double-click action alongside single-click

### 🚧 Future Enhancements
- [ ] Cell editing capabilities (inline editing)
- [ ] Master-detail view (expandable row details)

## License

Apache-2.0

## Support

For issues and questions:
- Check the troubleshooting section
- Review AG Grid documentation: https://www.ag-grid.com/
- Mendix documentation: https://docs.mendix.com/

## Credits

Built with:
- [AG Grid Community](https://www.ag-grid.com/)
- [Mendix Pluggable Widgets Tools](https://github.com/mendix/widgets-resources)