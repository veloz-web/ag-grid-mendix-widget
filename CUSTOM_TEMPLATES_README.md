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

### Formatting Issues

- Review column formatting configuration
- Check custom prefix/suffix settings
- Ensure data types match expectations

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

Use CSS to hide/show elements based on data:

```html
<div class="product-card">
    <h4>{{Name}}</h4>
    <p class="description {{Description ? '' : 'hidden'}}">{{Description}}</p>
    <span class="status {{Status === 'Active' ? 'active' : 'inactive'}}">{{Status}}</span>
</div>
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