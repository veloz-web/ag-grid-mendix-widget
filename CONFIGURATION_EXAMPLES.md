# AG Grid Widget - Configuration Examples

## Example 1: Basic Setup with View Selector

Perfect for a simple data table that users can view in different formats.

```xml
<AGGrid 
    dataSource="YourEntityList"
    enableViewSelector="true"
    defaultView="grid"
    mobileDefaultView="cards"
    enableFilterDrawer="false"
    theme="material"
    height="600"
    pagination="true"
    pageSize="20">
    
    <columns>
        <column 
            header="Name"
            attribute="FullName"
            width="200"
            sortable="true"
            filter="true"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="false" />
        
        <column 
            header="Email"
            attribute="EmailAddress"
            width="250"
            sortable="true"
            filter="true"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="false" />
        
        <column 
            header="Status"
            attribute="StatusCode"
            width="120"
            formatter="none"
            includeInCardView="true"
            includeInSort="true"
            statusMapping='[
                {"value":1,"label":"Active","className":"badge-success"},
                {"value":2,"label":"Inactive","className":"badge-secondary"},
                {"value":3,"label":"Pending","className":"badge-warning"}
            ]' />
    </columns>
</AGGrid>
```

**Use Case:** Contact list, user directory, simple CRM

---

## Example 2: Full-Featured with Filters

Ideal for complex data with many search criteria.

```xml
<AGGrid 
    dataSource="VisitRequestsList"
    enableViewSelector="true"
    defaultView="grid"
    mobileDefaultView="cards"
    enableFilterDrawer="true"
    theme="quartz"
    height="700"
    pagination="true"
    pageSize="25">
    
    <columns>
        <!-- Primary identifier - always visible, always filterable -->
        <column 
            header="Request Number"
            attribute="RequestNumber"
            width="150"
            sortable="true"
            filter="true"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true"
            formatter="customPrefix"
            customPrefix="REQ-" />
        
        <!-- Person info - filterable -->
        <column 
            header="Point of Contact"
            attribute="ContactName"
            width="200"
            sortable="true"
            filter="true"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <!-- Status with badges - filterable -->
        <column 
            header="Status"
            attribute="Status"
            width="120"
            formatter="none"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true"
            statusMapping='[
                {"value":"CLOSED","label":"Closed","className":"badge-secondary"},
                {"value":"PENDING","label":"Pending","className":"badge-warning"},
                {"value":"APPROVED","label":"Approved","className":"badge-success"},
                {"value":"DENIED","label":"Denied","className":"badge-danger"}
            ]' />
        
        <!-- Date field - sortable, filterable -->
        <column 
            header="Date Submitted"
            attribute="SubmittedDate"
            width="150"
            sortable="true"
            filter="true"
            formatter="dateShort"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <!-- Organization - filterable -->
        <column 
            header="Organization"
            attribute="OrganizationName"
            width="200"
            sortable="true"
            filter="true"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <!-- Guest count - visible but not filterable -->
        <column 
            header="Guests"
            attribute="NumberOfGuests"
            width="100"
            sortable="true"
            filter="false"
            formatter="number"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="false" />
        
        <!-- Purpose - visible in cards, not in grid filter -->
        <column 
            header="Purpose"
            attribute="VisitPurpose"
            width="250"
            sortable="false"
            filter="false"
            includeInCardView="true"
            includeInSort="false"
            includeInFilters="false" />
        
        <!-- Internal ID - hidden from cards and filters -->
        <column 
            header="ID"
            attribute="InternalID"
            width="80"
            sortable="true"
            filter="true"
            includeInCardView="false"
            includeInSort="false"
            includeInFilters="false" />
    </columns>
    
    <onRowClick action="ShowDetailPage" />
</AGGrid>
```

**Use Case:** Visit requests (as shown in reference image), work orders, service tickets

**Filter Drawer Will Show:**
- Request Number
- Point of Contact
- Status
- Date Submitted
- Organization

**Card View Will Show:**
- Request Number (with "REQ-" prefix)
- Point of Contact
- Status (with colored badge)
- Date Submitted (formatted)
- Organization
- Guests (formatted with commas)
- Purpose

**Grid View Shows:** All columns including Internal ID

---

## Example 3: Mobile-First Design

Optimized for mobile devices with minimal desktop grid usage.

```xml
<AGGrid 
    dataSource="ProductList"
    enableViewSelector="true"
    defaultView="cards"
    mobileDefaultView="cards"
    enableFilterDrawer="true"
    theme="material"
    height="800"
    pagination="false">
    
    <columns>
        <column 
            header="Product Name"
            attribute="Name"
            width="250"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <column 
            header="Price"
            attribute="Price"
            width="120"
            formatter="currency"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="false" />
        
        <column 
            header="Category"
            attribute="Category"
            width="150"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <column 
            header="In Stock"
            attribute="InStock"
            width="100"
            formatter="yesNo"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="false" />
        
        <column 
            header="SKU"
            attribute="SKU"
            width="150"
            formatter="customPrefix"
            customPrefix="SKU-"
            includeInCardView="false"
            includeInSort="false"
            includeInFilters="true" />
    </columns>
</AGGrid>
```

**Use Case:** E-commerce product catalog, inventory browser

---

## Example 4: List-First for Simple Data

Best for simple master-detail patterns.

```xml
<AGGrid 
    dataSource="NotificationsList"
    enableViewSelector="true"
    defaultView="list"
    mobileDefaultView="list"
    enableFilterDrawer="false"
    theme="alpine"
    height="500"
    pagination="true"
    pageSize="50">
    
    <columns>
        <!-- Primary field (shows as main text) -->
        <column 
            header="Title"
            attribute="NotificationTitle"
            width="300"
            includeInCardView="true"
            includeInSort="true" />
        
        <!-- Secondary field (shows as subtitle) -->
        <column 
            header="Time"
            attribute="CreatedDate"
            width="150"
            formatter="dateTime"
            includeInCardView="true"
            includeInSort="true" />
        
        <!-- Additional fields for grid view only -->
        <column 
            header="Type"
            attribute="NotificationType"
            width="120"
            includeInCardView="false"
            includeInSort="true" />
        
        <column 
            header="Read"
            attribute="IsRead"
            width="80"
            formatter="yesNo"
            includeInCardView="false"
            includeInSort="true" />
    </columns>
    
    <onRowClick action="MarkAsRead" />
</AGGrid>
```

**Use Case:** Notifications, activity feed, inbox

---

## Example 5: Dashboard Widget (Compact)

Small widget for dashboard use with essential info only.

```xml
<AGGrid 
    dataSource="RecentActivities"
    enableViewSelector="false"
    defaultView="list"
    mobileDefaultView="list"
    enableFilterDrawer="false"
    theme="quartz"
    height="300"
    pagination="false">
    
    <columns>
        <column 
            header="Activity"
            attribute="ActivityDescription"
            includeInCardView="true" />
        
        <column 
            header="Time"
            attribute="ActivityTime"
            formatter="time"
            includeInCardView="true" />
    </columns>
</AGGrid>
```

**Use Case:** Dashboard widget, recent activity panel, quick view

---

## Example 6: Financial Data with Custom Formatting

Perfect for accounting, finance, or sales data.

```xml
<AGGrid 
    dataSource="TransactionsList"
    enableViewSelector="true"
    defaultView="grid"
    mobileDefaultView="cards"
    enableFilterDrawer="true"
    theme="balham"
    height="600"
    pagination="true"
    pageSize="30">
    
    <columns>
        <column 
            header="Transaction ID"
            attribute="TransactionID"
            width="150"
            formatter="customPrefix"
            customPrefix="TXN-"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <column 
            header="Date"
            attribute="TransactionDate"
            width="120"
            formatter="dateShort"
            sortable="true"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <column 
            header="Amount"
            attribute="Amount"
            width="150"
            formatter="currency"
            sortable="true"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="false" />
        
        <column 
            header="Account"
            attribute="AccountNumber"
            width="180"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <column 
            header="Type"
            attribute="TransactionType"
            width="120"
            formatter="none"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true"
            statusMapping='[
                {"value":"DEBIT","label":"Debit","className":"badge-danger"},
                {"value":"CREDIT","label":"Credit","className":"badge-success"},
                {"value":"TRANSFER","label":"Transfer","className":"badge-info"},
                {"value":"FEE","label":"Fee","className":"badge-warning"}
            ]' />
        
        <column 
            header="Balance"
            attribute="BalanceAfter"
            width="150"
            formatter="currency"
            sortable="true"
            includeInCardView="true"
            includeInSort="false"
            includeInFilters="false" />
        
        <column 
            header="Description"
            attribute="Description"
            width="250"
            includeInCardView="true"
            includeInSort="false"
            includeInFilters="false" />
    </columns>
</AGGrid>
```

**Use Case:** Banking transactions, payment history, ledger entries

---

## Configuration Decision Guide

### When to Enable View Selector?

**Enable if:**
- Users have different preferences (some like tables, others like cards)
- Mobile users are a significant portion of your audience
- Data can be meaningfully displayed in multiple formats
- You want to provide flexibility

**Disable if:**
- Data is highly tabular and only makes sense in grid format
- It's a dashboard widget with limited space
- You want to enforce a specific view mode

### When to Enable Filter Drawer?

**Enable if:**
- You have 3+ filterable fields
- Users need to search/filter frequently
- You want to keep the main UI clean
- Complex filtering is needed beyond AG Grid's built-in filters

**Disable if:**
- Very simple data with 1-2 columns
- AG Grid's built-in column filters are sufficient
- Space is limited (dashboard widgets)

### Column Property Recommendations

| Property | Set to `true` when... | Set to `false` when... |
|----------|----------------------|------------------------|
| `includeInCardView` | Field is user-facing and meaningful | Internal ID, technical fields, rarely needed info |
| `includeInSort` | Users might want to sort by this field | Descriptive text, calculated fields |
| `includeInFilters` | Users search/filter by this field frequently | Numeric values, boolean flags, dates (use range filters instead) |

### Formatter Choices

| Use Case | Formatter | Example |
|----------|-----------|---------|
| Money | `currency`, `currencyEUR`, `currencyGBP` | $1,234.56 |
| Percentages | `percentage` | 45.67% |
| Dates | `dateShort`, `dateLong`, `dateTime`, `time` | 10/7/2025 |
| Status/Categories | `none` | Active |
| Yes/No fields | `yesNo`, `trueFalse` | Yes / True |
| Text | `uppercase`, `lowercase`, `capitalize` | JOHN / john / John |
| IDs/Codes | `customPrefix` | REQ-12345 |
| Units | `customSuffix` | 100 kg |

### Responsive Strategy

| Scenario | Desktop Default | Mobile Default | Reasoning |
|----------|----------------|----------------|-----------|
| Data-heavy | `grid` | `cards` or `list` | Grid for analysis, cards for touch |
| Simple lists | `list` | `list` | Consistent, efficient |
| Product catalogs | `grid` or `cards` | `cards` | Visual appeal on all devices |
| Notifications/Feed | `list` | `list` | Chronological, scannable |
| Forms/Workflows | `cards` | `cards` | Form-like, easy to read |

---

## Testing Checklist

When configuring your widget, test:

- [ ] Desktop: Default view loads correctly
- [ ] Mobile: Default view switches appropriately
- [ ] View selector: All three views render properly
- [ ] Filter drawer: Opens/closes smoothly
- [ ] Filters: Each filterable column appears in drawer
- [ ] Filtering: Results update correctly
- [ ] Clear filters: Resets all active filters
- [ ] Card view: Only includes columns marked `includeInCardView=true`
- [ ] List view: Shows primary and secondary columns
- [ ] Status badges: Render correctly in all views
- [ ] Formatters: Apply properly across views
- [ ] Row click: Actions execute in all views
- [ ] Responsive: Behavior changes at 768px breakpoint
- [ ] Performance: Large datasets render efficiently

---

## Common Patterns

### Pattern 1: Admin Tables
- Enable view selector: Yes
- Enable filter drawer: Yes
- Default view: Grid (all devices)
- Include all technical fields
- Many filterable columns

### Pattern 2: Public-Facing Lists
- Enable view selector: Yes
- Enable filter drawer: Limited
- Default view: Grid (desktop), Cards (mobile)
- Hide technical fields from cards
- Minimal filters

### Pattern 3: Dashboard Widgets
- Enable view selector: No
- Enable filter drawer: No
- Default view: List
- Minimal columns
- No pagination

### Pattern 4: Mobile Apps
- Enable view selector: Optional
- Enable filter drawer: Yes
- Default view: Cards (all devices)
- Focus on mobile UX
- Touch-friendly sizing

### Pattern 5: Reports/Analytics
- Enable view selector: No
- Enable filter drawer: Yes
- Default view: Grid (all devices)
- Many columns
- Advanced filtering
