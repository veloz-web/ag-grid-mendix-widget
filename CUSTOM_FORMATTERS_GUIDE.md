# Custom Formatters Guide

## Overview

Custom Formatters allow you to define reusable formatting logic that can be applied to fields in templates and grid columns. This decouples application-specific formatting (like status badges, avatars, etc.) from the widget itself, making it truly reusable across projects.

## Why Custom Formatters?

**Before:** App-specific formatters like `renderStatusBadge` were hardcoded in the widget
- ❌ Not reusable across different projects
- ❌ Configuration tied to column properties
- ❌ Required widget modifications for new formats

**After:** Custom formatters defined in widget configuration
- ✅ Fully reusable widget
- ✅ Project-specific formatting in configuration
- ✅ No widget modifications needed
- ✅ Use in templates with `{{formatterName("Field")}}`

## Configuration

### 1. Add Custom Formatter in Widget Settings

In Mendix Studio Pro, configure your AG Grid widget:

**Custom Formatters Section:**
- Click "+ New" to add a formatter
- Configure:
  - **Formatter Name**: Unique identifier (e.g., `statusBadge`, `userAvatar`)
  - **Formatter Type**: `JavaScript Function` (Microflow support planned)
  - **Formatter Code**: JavaScript function body
  - **Formatter Configuration**: Optional JSON config

### 2. Formatter Code Structure

Your formatter code has access to these variables:

```javascript
// Available variables:
// - value: The field value
// - item: The entire row object
// - column: Column configuration
// - config: Parsed JSON from Formatter Configuration

// Return a string or HTML
return `<span class="badge">${value}</span>`;
```

## Examples

### Example 1: Status Badge Formatter

**Configuration:**

```
Formatter Name: statusBadge
Formatter Type: JavaScript Function
```

**Formatter Code:**
```javascript
// config contains the status mappings
if (!config || !Array.isArray(config)) {
    return `<span class="status-badge badge-secondary">${value}</span>`;
}

// Find matching status mapping
const mapping = config.find(m => 
    m.value === value || 
    String(m.value) === String(value)
);

if (!mapping) {
    return `<span class="status-badge badge-secondary">${value}</span>`;
}

const className = `status-badge ${mapping.className || 'badge-secondary'}`;
const style = mapping.style ? ` style="${mapping.style}"` : '';
const label = mapping.label || value;

return `<span class="${className}"${style}>${label}</span>`;
```

**Formatter Configuration (JSON):**
```json
[
    {"value": 1, "label": "Open", "className": "badge-primary"},
    {"value": 2, "label": "In Progress", "className": "badge-warning"},
    {"value": 3, "label": "Closed", "className": "badge-success"},
    {"value": 4, "label": "Cancelled", "className": "badge-danger"}
]
```

**Usage in Template:**
```html
<div class="card" data-status="{{Status}}">
    <h3>{{Title}}</h3>
    <div class="status">{{statusBadge("Status")}}</div>
</div>
```

### Example 2: User Avatar Formatter

**Configuration:**

```
Formatter Name: userAvatar
Formatter Type: JavaScript Function
```

**Formatter Code:**
```javascript
// config.avatarField specifies which field contains avatar URL
const avatarUrl = config?.avatarField && item[config.avatarField] 
    ? item[config.avatarField] 
    : config?.defaultAvatar || '/default-avatar.png';

const initials = value ? value.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

return `
    <div class="user-avatar">
        <img src="${avatarUrl}" alt="${value}" onerror="this.style.display='none';this.nextSibling.style.display='block';" />
        <span class="avatar-initials" style="display:none;">${initials}</span>
    </div>
`;
```

**Formatter Configuration (JSON):**
```json
{
    "avatarField": "ProfilePictureURL",
    "defaultAvatar": "/images/default-user.png"
}
```

**Usage in Template:**
```html
<div class="user-card">
    {{userAvatar("FullName")}}
    <span>{{FullName}}</span>
</div>
```

### Example 3: Priority Indicator

**Configuration:**

```
Formatter Name: priority
Formatter Type: JavaScript Function
```

**Formatter Code:**
```javascript
const priorities = {
    'high': { icon: '🔴', text: 'High Priority', color: '#dc3545' },
    'medium': { icon: '🟡', text: 'Medium Priority', color: '#ffc107' },
    'low': { icon: '🟢', text: 'Low Priority', color: '#28a745' }
};

const normalized = String(value).toLowerCase();
const priority = priorities[normalized] || priorities['medium'];

return `
    <span class="priority-badge" style="color: ${priority.color};">
        ${priority.icon} ${priority.text}
    </span>
`;
```

**Usage in Template:**
```html
<div class="task">
    <h4>{{TaskName}}</h4>
    {{priority("PriorityLevel")}}
</div>
```

### Example 4: Currency with Symbol

**Configuration:**

```
Formatter Name: localCurrency
Formatter Type: JavaScript Function
```

**Formatter Code:**
```javascript
// config specifies currency symbol and locale
const symbol = config?.symbol || '$';
const locale = config?.locale || 'en-US';

const amount = Number(value);
if (isNaN(amount)) return value;

return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: config?.currency || 'USD'
}).format(amount);
```

**Formatter Configuration (JSON):**
```json
{
    "symbol": "$",
    "locale": "en-US",
    "currency": "USD"
}
```

### Example 5: Link with Custom Icon

**Configuration:**

```
Formatter Name: documentLink
Formatter Type: JavaScript Function
```

**Formatter Code:**
```javascript
// config contains icon and URL pattern
const icon = config?.icon || 'fa-file';
const urlPattern = config?.urlPattern || '/documents/${value}';
const url = urlPattern.replace('${value}', encodeURIComponent(value));

return `
    <a href="${url}" class="document-link" target="_blank">
        <i class="fas ${icon}"></i> View Document
    </a>
`;
```

**Formatter Configuration (JSON):**
```json
{
    "icon": "fa-file-pdf",
    "urlPattern": "/api/documents/${value}/download"
}
```

## Template Syntax

### Simple Field Reference (Raw Value)
```html
{{FieldName}}
```
Returns the raw, unformatted value.

### Built-in Formatter
```html
{{dateMDY("SubmittedDate")}}
{{currency("Amount")}}
{{uppercase("Name")}}
```

### Custom Formatter
```html
{{formatterName("FieldName")}}
```
Where `formatterName` matches the **Formatter Name** you configured.

### Mixed Usage Example
```html
<div class="sr-card" data-status="{{Status}}">
    <div class="header">
        <h3>{{Title}}</h3>
        {{statusBadge("Status")}}
    </div>
    <div class="body">
        <div class="user">
            {{userAvatar("AssignedTo")}}
            <span>{{AssignedTo}}</span>
        </div>
        <div class="meta">
            <span>Due: {{dateMDY("DueDate")}}</span>
            <span>Budget: {{localCurrency("Budget")}}</span>
            {{priority("Priority")}}
        </div>
    </div>
</div>
```

## Best Practices

### 1. Keep Formatters Pure
✅ **Do:** Return deterministic output based on inputs
```javascript
// Good - pure function
const status = config.find(s => s.value === value);
return `<span class="${status.className}">${status.label}</span>`;
```

❌ **Don't:** Make API calls or modify external state
```javascript
// Bad - side effects
fetch('/api/status'); // Don't do this!
window.myData = value; // Don't do this!
```

### 2. Handle Edge Cases
```javascript
// Always validate inputs
if (value === null || value === undefined || value === '') {
    return '<span class="no-data">N/A</span>';
}

// Validate config
if (!config || !Array.isArray(config)) {
    return String(value); // Safe fallback
}
```

### 3. Sanitize HTML
```javascript
// Escape user input to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

return `<span>${escapeHtml(value)}</span>`;
```

### 4. Use Meaningful Names
```
✅ Good: statusBadge, userAvatar, priorityIndicator
❌ Bad: formatter1, myFunc, temp
```

### 5. Document Complex Logic
```javascript
/**
 * Renders a traffic light status indicator
 * Green: value > 80
 * Yellow: value 50-80
 * Red: value < 50
 */
const score = Number(value);
if (score >= 80) return '🟢 Excellent';
if (score >= 50) return '🟡 Needs Improvement';
return '🔴 Critical';
```

## Error Handling

The widget automatically catches errors in custom formatters:

- **Compilation errors**: Logged to console, formatter not registered
- **Runtime errors**: Logged to console, returns raw value as fallback
- **Missing formatter**: Warning logged, returns raw value

Check browser console (F12) for error messages during development.

## Performance Tips

### 1. Minimize Complexity
Keep formatter code simple and fast, especially for large datasets.

### 2. Cache Complex Calculations
```javascript
// Cache parsed config outside the formatter if possible
// Or keep config simple and pre-computed
```

### 3. Avoid Heavy DOM Operations
Formatters return strings, not React components. Keep HTML lightweight.

## Migration from Built-in Formatters

### Old Way (Built-in statusBadge)
```typescript
// Column configuration
formatter: "statusBadge"
statusMapping: '[{"value":1,"label":"Open",...}]'
```

### New Way (Custom Formatter)
**Widget Configuration:**
- Add Custom Formatter: `statusBadge`
- Add formatter code (see Example 1)
- Add configuration JSON

**Template:**
```html
{{statusBadge("Status")}}
```

**Benefits:**
- ✅ Reusable across widgets
- ✅ Same formatter for multiple columns
- ✅ No column-specific configuration needed
- ✅ Centralized formatting logic

## Troubleshooting

### Formatter not working?

1. **Check formatter name**: Must match exactly (case-sensitive)
   ```html
   {{statusBadge("Status")}}  ✅
   {{statusbadge("Status")}}  ❌
   ```

2. **Validate JSON configuration**: Use a JSON validator
   ```json
   [{"value": 1}]  ✅
   [{value: 1}]    ❌ (missing quotes)
   ```

3. **Check console**: Open browser devtools (F12) for error messages

4. **Test with simple formatter first**:
   ```javascript
   return `Value: ${value}`;
   ```

### Formatter returns raw value?

- Check that formatter is registered (no errors in console)
- Verify template syntax: `{{formatterName("Field")}}`
- Ensure Field name matches column header exactly

## Advanced: Accessing Row Data

You can access other fields from the same row:

```javascript
// Access any field from the row object
const customerName = item.CustomerName; // Direct property access
const orderId = item.OrderID;

return `
    <div class="order-summary">
        <span class="order-id">${orderId}</span>
        <span class="customer">${customerName}</span>
        <span class="status">${value}</span>
    </div>
`;
```

**Note:** Field names come from the data source, not column headers.

## Future Enhancements

### Planned Features:
- **Microflow Formatters**: Call Mendix microflows for server-side formatting
- **Formatter Library**: Share formatters across widgets in the same project
- **TypeScript Support**: Write formatters in TypeScript with full type safety
- **Visual Formatter Builder**: GUI for creating simple formatters

## Support

For issues or questions:
1. Check browser console for error messages
2. Review this guide and examples
3. Test with simplified formatter code
4. Open an issue on GitHub with:
   - Widget version
   - Formatter code
   - Console error messages
   - Expected vs actual output

---

**Version:** 1.0.0  
**Last Updated:** October 2025
