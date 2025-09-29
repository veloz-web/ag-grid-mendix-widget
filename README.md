# AG Grid Widget for Mendix

A powerful Mendix pluggable widget that integrates AG Grid into your Mendix applications, providing advanced data grid capabilities with sorting, filtering, pagination, and more.

## Prerequisites

- Mendix 10.18.7 or higher
- Node.js 18 LTS (recommended)
- npm or yarn

## Installation

### Building the Widget

1. Clone or download this widget source code
2. Navigate to the widget directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the widget:
   ```bash
   npm run build
   ```
5. The compiled widget will be in `dist/mendix.aggrid.AGGrid.mpk`
6. Import the `.mpk` file into your Mendix project

### Development Mode

To run in development mode with hot reloading:
```bash
npm start
```

## How the Data Source Works

### Understanding Mendix Data Sources

The AG Grid widget uses Mendix's **data source** property, which can pull data from:

1. **Database** - Direct entity retrieval
2. **Microflow** - Custom logic to prepare data
3. **Nanoflow** - Client-side data preparation
4. **Association** - Related entities

### It Does NOT Require a View

Unlike some Mendix widgets, this AG Grid widget **does not require a ListView or DataGrid2**. It works directly with:

- **Single Entity**: Yes ✅
- **List of Entities**: Yes ✅ (most common)
- **Association**: Yes ✅
- **View/DataView context**: Optional (can use context entity for associations)

### Data Source Configuration Examples

#### Example 1: Direct Database Query (Most Common)

```
Page Structure:
└── AG Grid Widget
    └── Data Source: Database
        └── Entity: MyModule.Customer
        └── XPath: [Active = true]
```

**Configuration in Studio Pro:**
1. Add the AG Grid widget to your page
2. In the widget properties:
   - **Data Source** → Select "Database"
   - **Entity** → Select your entity (e.g., `Customer`)
   - **XPath Constraint** (optional) → `[Active = true]`

#### Example 2: Using a Microflow

This is useful when you need custom logic, calculations, or data from multiple sources.

```
Page Structure:
└── AG Grid Widget
    └── Data Source: Microflow
        └── Microflow: ACT_GetCustomerList
```

**Microflow Example (ACT_GetCustomerList):**
```
Input: (none) or (context object)
Output: List of Customer

Steps:
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
| **Theme** | Visual theme (Alpine/Balham/Material) | Alpine |

### 4. Events

| Event | Description |
|-------|-------------|
| **On Row Click** | Action executed when user clicks a row |

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

## Feature Roadmap

Future enhancements planned:
- [ ] Cell editing capabilities
- [ ] Export to Excel/CSV
- [ ] Column pinning
- [ ] Row grouping
- [ ] Master-detail view
- [ ] Custom cell renderers
- [ ] Server-side row model for very large datasets

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