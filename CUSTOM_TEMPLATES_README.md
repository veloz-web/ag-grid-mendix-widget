# Custom Templates Guide

The AG Grid Mendix widget supports custom HTML templates for card and list views, allowing you to create fully customized layouts for your data display.

## Overview

Custom templates enable you to define your own HTML structure for displaying data in card and list views. Use `{{FieldName}}` placeholders to dynamically insert field values from your data source.

## How Templates Affect View Selector

The view selector intelligently shows only the views that are available based on your configuration:

### View Availability Matrix

| Configuration | Views Available | View Selector Shown? |
|--------------|-----------------|---------------------|
| No templates | Grid only | ❌ No - only grid available |
| Card template only | Grid, Cards | ✅ Yes - 2 options |
| List template only | Grid, List | ✅ Yes - 2 options |
| Both templates | Grid, Cards, List | ✅ Yes - 3 options |

**Key Points:**
- Grid view is always available (no template needed)
- Cards view appears when `customCardTemplate` is configured
- List view appears when `customListTemplate` is configured
- If no templates are configured, the view selector is hidden

## View Modes & Fallback Behavior

### Cards View
- **With Template**: Uses your custom HTML template with `{{FieldName}}` placeholders
- **Without Template**: Falls back to `DynamicView` showing fields marked with `includeInCardView="true"`
- **Template Property**: `customCardTemplate`

### List View
- **With Template**: Uses your custom HTML template with `{{FieldName}}` placeholders
- **Without Template**: Falls back to default `ListView` component
- **Template Property**: `customListTemplate`

### Grid View
- **Always Available**: Traditional AG Grid table view
- **No Template Needed**: Works with column configuration only

## localStorage Safety

If a user previously selected Cards or List view in the view selector, but you later remove the corresponding template:
- The widget automatically resets to Grid view on next page load
- No errors or broken states
- User experience remains smooth

## Template Syntax

### Basic Placeholders

Use `{{FieldName}}` to insert field values. The FieldName must match exactly with the column header value defined in your widget configuration.

```html
<div class="my-card">
    <h3>{{Name}}</h3>
    <p>{{Description}}</p>
    <span class="price">${{Price}}</span>
</div>
```

### Conditional Rendering

Templates support conditional logic to show/hide content based on field values or conditions. This is perfect for creating flexible layouts that adapt to different data types or optional fields.

#### Basic Conditional Blocks

```html
<!-- Show content only if field has a value -->
{{#if Status}}
  <div class="status-label">Status: {{Status}}</div>
{{/if}}

<!-- Show content only if field equals a specific value -->
{{#if Priority == "High"}}
  <div class="urgent">⚠️ High Priority</div>
{{/if}}

{{#if Type == "Bug"}}
  <div class="bug-card">{{Title}}</div>
{{/if}}
```

#### Conditional with Else

```html
{{#if IsActive}}
  <span class="active">✓ Active</span>
{{else}}
  <span class="inactive">✗ Inactive</span>
{{/if}}
```

#### Advanced Conditional Logic

**Nested Conditionals:**
```html
{{#if EntityType == "Task"}}
  <div class="task-card">
    {{#if Priority == "High"}}
      <div class="urgent">⚠️ High Priority Task</div>
    {{/if}}
    {{#if Assignee}}
      <p>Assigned to: {{Assignee}}</p>
    {{/if}}
  </div>
{{/if}}
```

**Logical Operators (&& and ||):**
```html
<!-- AND conditions: both must be true -->
{{#if Status == "Active" && Priority == "High"}}
  <div class="urgent-active">🔥 Active High Priority</div>
{{/if}}

<!-- OR conditions: either can be true -->
{{#if Status == "Pending" || Status == "InProgress"}}
  <div class="in-work">🔄 Work in Progress</div>
{{/if}}

<!-- Complex combinations -->
{{#if (Type == "Bug" && Severity == "Critical") || (Type == "Feature" && Priority == "High")}}
  <div class="high-attention">🚨 Requires Immediate Attention</div>
{{/if}}
```

**Field Existence with Logic:**
```html
<!-- Show section only if multiple fields exist -->
{{#if Title && Description}}
  <div class="content-section">
    <h4>{{Title}}</h4>
    <p>{{Description}}</p>
  </div>
{{/if}}

<!-- Show different content based on field combinations -->
{{#if Status && !DueDate}}
  <div class="no-deadline">{{Status}} - No deadline set</div>
{{/if}}
```

**Boolean Field Handling:**
```html
<!-- ✅ Correct: Shows content only when boolean is true -->
{{#if IsActive}}
  <span class="active">✓ Active</span>
{{/if}}

<!-- ✅ Also correct: Explicit boolean comparison -->
{{#if IsActive == "true"}}
  <span class="active">✓ Active</span>
{{/if}}

<!-- ❌ Wrong: This would never show because false is not truthy for booleans -->
{{#if IsInactive}}
  <span class="inactive">✗ Inactive</span>
{{/if}}

<!-- ✅ Correct: Explicit check for false -->
{{#if IsActive == "false"}}
  <span class="inactive">✗ Inactive</span>
{{/if}}
```

**Numeric Field Handling:**
```html
<!-- ✅ Correct: Shows guest count including 0 -->
{{#if NumberOfGuests}}
  <span>Guests: {{NumberOfGuests}}</span>
{{/if}}

<!-- ✅ Correct: Show different message for 0 vs many -->
{{#if NumberOfGuests == "0"}}
  <span>No guests</span>
{{else}}
  <span>{{NumberOfGuests}} guests</span>
{{/if}}

<!-- ✅ Correct: Check for specific ranges -->
{{#if NumberOfGuests && NumberOfGuests != "0"}}
  <div class="group-booking">
    Group booking: {{NumberOfGuests}} guests
  </div>
{{/if}}
```

#### Field Type Behavior

**Boolean Fields:**
- `{{#if IsActive}}` → Shows content only when `true`
- `{{#if IsActive == "false"}}` → Shows content only when `false`

**Numeric Fields:**
- `{{#if NumberOfGuests}}` → Shows content when number exists (including `0`)
- `{{#if NumberOfGuests == "0"}}` → Shows content only when exactly `0`

**String/Text Fields:**
- `{{#if Name}}` → Shows content when string is not empty
- `{{#if Name == ""}}` → Shows content only when string is empty

**Date Fields:**
- `{{#if CreatedDate}}` → Shows content when date exists
- `{{#if CreatedDate == "null"}}` → Shows content only when date is null

#### String Operations

Templates support string method calls for advanced conditional logic based on text patterns, substrings, and string properties.

**startsWith() - Check if string begins with specific text:**
```html
<!-- Show different content based on form number prefix -->
{{#if Form #.startsWith("ABC")}}
  <div class="form-abc">ABC Form: {{Form #}}</div>
{{/if}}

{{#if Form #.startsWith("XYZ")}}
  <div class="form-xyz">XYZ Form: {{Form #}}</div>
{{/if}}

<!-- Still works with explicit comparison -->
{{#if Form #.startsWith("ABC") == "true"}}
  <div class="form-abc">ABC Form: {{Form #}}</div>
{{/if}}
```

**endsWith() - Check if string ends with specific text:**
```html
{{#if FileName.endsWith(".pdf")}}
  <div class="pdf-file">📄 {{FileName}}</div>
{{/if}}

{{#if FileName.endsWith(".docx")}}
  <div class="word-file">📝 {{FileName}}</div>
{{/if}}
```

**substring() - Extract and compare substrings:**
```html
<!-- Check first 3 characters of form number -->
{{#if Form #.substring(0,3) == "ABC"}}
  <div class="abc-form">ABC Form Series</div>
{{/if}}

<!-- Check specific character positions -->
{{#if Code.substring(2,5) == "123"}}
  <div class="special-code">Special Code Pattern</div>
{{/if}}
```

**length - Check string length:**
```html
<!-- Show different styling based on name length -->
{{#if Name.length == "1"}}
  <div class="initial">{{Name}}.</div>
{{/if}}

{{#if Name.length != "0"}}
  <div class="full-name">{{Name}}</div>
{{/if}}
```

**includes() - Check if string contains specific text:**
```html
<!-- Check for keywords in description -->
{{#if Description.includes("urgent")}}
  <div class="urgent-item">🚨 {{Title}}</div>
{{/if}}

{{#if Tags.includes("featured")}}
  <div class="featured">⭐ Featured Item</div>
{{/if}}

<!-- Your specific use case -->
{{#if Form #.includes("VAF")}}
  <div class="sr-card-bottom-banner"><span>{{Guests}} Guests</span></div>
{{/if}}
```

**Supported String Methods:**
- `startsWith(text)` - Returns true if string starts with the specified text
- `endsWith(text)` - Returns true if string ends with the specified text  
- `substring(start, end?)` - Returns substring from start index to end index (optional)
- `length` - Returns the length of the string as a number
- `includes(text)` - Returns true if string contains the specified text

**Method Call Syntax:**
```
FieldName.method(args)                    // Boolean result (recommended)
FieldName.method(args) == "expected_value" // Explicit string comparison (still supported)
```

**Notes:**
- Boolean methods (`startsWith`, `endsWith`, `includes`) work directly as conditions
- Numeric methods (`length`, `substring`) require explicit comparison with `==` or `!=`
- Arguments should be quoted strings: `startsWith("ABC")`
- Numeric arguments for substring don't need quotes: `substring(0,3)`
- All methods are case-sensitive
- Invalid method calls or missing fields return false (condition not met)

### Formatting Support

Templates automatically apply any formatting configured for columns (currency, date, number formatting, etc.). Custom prefixes and suffixes are also applied.

## Configuration

### Widget Properties

1. **customCardTemplate**: HTML template for CARD view mode
2. **customListTemplate**: HTML template for LIST view mode

### Setting Up Templates

1. In Mendix Studio Pro, select the AG Grid widget
2. Go to the Properties panel
3. Find the "Custom Templates" section
4. Enter your HTML template in the appropriate field

## Examples

### Card Template Example

```html
<div class="product-card">
    <div class="card-header">
        <h4>{{ProductName}}</h4>
        <span class="category">{{Category}}</span>
    </div>
    <div class="card-body">
        <p class="description">{{Description}}</p>
        <div class="pricing">
            <span class="price">${{Price}}</span>
            <span class="stock">Stock: {{StockQuantity}}</span>
        </div>
    </div>
    <div class="card-footer">
        <button class="btn-primary">View Details</button>
    </div>
</div>
```

### List Template Example

```html
<div class="list-item">
    <div class="item-content">
        <strong>{{Title}}</strong> - {{Author}}
        <span class="date">{{PublicationDate}}</span>
    </div>
    <div class="item-actions">
        <button class="btn-secondary">Edit</button>
    </div>
</div>
```

## CSS Styling

### Default Classes

The widget applies these CSS classes by default:

- `.aggrid-custom-template-view`: Container for the template view
- `.aggrid-custom-item`: Individual item container

### Custom Styling

Add your own CSS classes to templates and style them in your theme:

```css
.product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    margin: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-card .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.product-card .price {
    font-size: 1.2em;
    font-weight: bold;
    color: #007bff;
}
```

## Field Mapping

### Available Fields

Only fields configured as columns in the widget are available for templating. The placeholder name must exactly match the column header value.

### Data Types

- **String**: Displayed as-is
- **Number**: Formatted according to column configuration
- **Date/DateTime**: Formatted according to column configuration
- **Boolean**: Displayed as "true"/"false" or custom formatted

## Best Practices

### Performance

- Keep templates simple and semantic
- Avoid deeply nested HTML structures
- Use CSS for styling rather than inline styles

### Accessibility

- Include proper semantic HTML elements
- Add ARIA labels where appropriate
- Ensure sufficient color contrast
- Make interactive elements keyboard accessible

### Responsive Design

- Use responsive CSS classes
- Consider mobile layouts
- Test across different screen sizes

## Troubleshooting

### Template Not Rendering

- Check that the view mode is set to "CARD" or "LIST"
- Verify placeholder names match column headers exactly
- Ensure the template property is not empty

### Field Values Not Showing

- Confirm the field is configured as a column
- Check that the data source provides the field
- Verify the placeholder syntax `{{FieldName}}`

### Conditional Logic Issues

- Ensure conditional syntax is correct: `{{#if condition}}content{{/if}}`
- Check that field names in conditions match column headers exactly
- Verify comparison operators (`==`, `!=`) and quote usage
- Remember conditionals are case-sensitive
- Nested conditionals are supported but test carefully

### Formatting Issues

- Review column formatting configuration
- Check custom prefix/suffix settings
- Ensure data types match expectations

### Common Conditional Mistakes

```html
<!-- ❌ Wrong: Missing quotes around string values -->
{{#if Status == Active}} <!-- Should be: Status == "Active" -->

<!-- ❌ Wrong: Incorrect closing syntax -->
{{#if Status}}Content{{/if}} <!-- Correct -->

<!-- ❌ Wrong: Nested quotes issue -->
{{#if Type == 'Bug'}} <!-- Use double quotes: Type == "Bug" -->

<!-- ❌ Wrong: Missing spaces around operators -->
{{#if Status=="Active"&&Priority=="High"}} <!-- Should be: Status == "Active" && Priority == "High" -->

<!-- ❌ Wrong: Incorrect operator precedence (&& binds tighter than ||) -->
{{#if A || B && C}} <!-- Same as: A || (B && C) - use parentheses if needed: (A || B) && C -->
```

### Compound Condition Examples

```html
<!-- ✅ Correct: AND operator -->
{{#if Status == "Active" && Priority == "High"}}
  <div>High priority active item</div>
{{/if}}

<!-- ✅ Correct: OR operator -->
{{#if Type == "Bug" || Type == "Issue"}}
  <div>Problem report</div>
{{/if}}

<!-- ✅ Correct: Complex logic with parentheses -->
{{#if (Status == "Active" && Priority == "High") || Type == "Critical"}}
  <div>Requires attention</div>
{{/if}}
```

## Security Considerations

- Templates are rendered using `dangerouslySetInnerHTML`
- Avoid including user-generated content in templates
- Sanitize any dynamic content if necessary
- Be cautious with inline event handlers

## Migration from Default Views

When switching from default views to custom templates:

1. Set the view mode to "CARD" or "LIST"
2. Copy your desired layout structure
3. Replace static content with `{{FieldName}}` placeholders
4. Add custom CSS styling
5. Test thoroughly before deployment

## Advanced Usage

### Conditional Rendering

Use conditional blocks to create adaptive templates that show different content based on data:

```html
<!-- Different layouts for different entity types -->
{{#if EntityType == "Task"}}
  <div class="task-card">
    <h4>📋 {{Title}}</h4>
    {{#if Assignee}}
      <p>Assigned to: {{Assignee}}</p>
    {{/if}}
    {{#if DueDate}}
      <p class="due-date">Due: {{DueDate}}</p>
    {{/if}}
  </div>
{{/if}}

{{#if EntityType == "Project"}}
  <div class="project-card">
    <h4>📁 {{ProjectName}}</h4>
    <div class="progress">Progress: {{Progress}}%</div>
    {{#if Status == "Complete"}}
      <span class="completed">✅ Complete</span>
    {{else}}
      <span class="in-progress">🔄 In Progress</span>
    {{/if}}
  </div>
{{/if}}
```

### Complex Layouts

Create multi-column or grid layouts:

```html
<div class="news-grid">
    <div class="news-item">
        <img src="{{ImageUrl}}" alt="{{Title}}" />
        <div class="news-content">
            <h3>{{Title}}</h3>
            <p>{{Summary}}</p>
            <time>{{PublishDate}}</time>
        </div>
    </div>
</div>
```

### Dynamic Styling

Use conditional classes for dynamic styling:

```html
<div class="card {{#if Priority == 'High'}}urgent{{else}}normal{{/if}}">
    <h4>{{Title}}</h4>
    <p class="status {{#if Status == 'Active'}}active{{else}}inactive{{/if}}">
        {{Status}}
    </p>
</div>
```