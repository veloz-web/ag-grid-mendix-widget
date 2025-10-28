# Status Badge Custom Formatter - Quick Setup

## Step-by-Step Migration

This guide shows exactly how to move the `statusBadge` formatter from hardcoded widget code to a reusable custom formatter.

## Step 1: Add Custom Formatter in Studio Pro

1. Open your AG Grid widget properties
2. Go to **Custom Formatters** section
3. Click **+ New**
4. Configure the formatter:

### Formatter Name
```
statusBadge
```

### Formatter Type
```
JavaScript Function
```

### Formatter Code
```javascript
// config contains the status mappings
if (!config || !Array.isArray(config)) {
    return `<span class="status-badge badge-secondary">${value || ''}</span>`;
}

// Normalize the value for comparison
const normalizedValue = value !== null && value !== undefined ? value : '';

// Find matching mapping - support both numeric and string values
const mapping = config.find(m => {
    if (m.value === undefined || m.value === null) return false;
    
    // Try exact match first
    if (m.value === normalizedValue) return true;
    
    // Try string comparison
    if (String(m.value) === String(normalizedValue)) return true;
    
    // Try numeric comparison if both can be numbers
    const numValue = Number(normalizedValue);
    const numMapping = Number(m.value);
    if (!isNaN(numValue) && !isNaN(numMapping) && numValue === numMapping) return true;
    
    return false;
});

if (!mapping) {
    // No mapping found, return default badge with the raw value
    return `<span class="status-badge badge-secondary">${value || ''}</span>`;
}

// Return HTML string with badge
const className = `status-badge ${mapping.className || 'badge-secondary'}`.trim();
const style = mapping.style ? ` style="${mapping.style}"` : '';
const labelText = mapping.label !== undefined && mapping.label !== null 
    ? String(mapping.label) 
    : String(value || '');

return `<span class="${className}"${style} data-status="${labelText}">${labelText}</span>`;
```

### Formatter Configuration (JSON)
```json
[
    {
        "value": 1,
        "label": "Open",
        "className": "badge-primary",
        "style": "background-color: #007bff; color: white;"
    },
    {
        "value": 2,
        "label": "In Progress",
        "className": "badge-warning",
        "style": "background-color: #ffc107; color: black;"
    },
    {
        "value": 3,
        "label": "Completed",
        "className": "badge-success",
        "style": "background-color: #28a745; color: white;"
    },
    {
        "value": 4,
        "label": "Cancelled",
        "className": "badge-danger",
        "style": "background-color: #dc3545; color: white;"
    }
]
```

## Step 2: Update Your Templates

### Custom Card Template

**Before:**
```html
<div class="card">
    <div class="status">Status: {{Status}}</div>
</div>
```

**After:**
```html
<div class="card" data-status="{{Status}}">
    <div class="status">{{statusBadge("Status")}}</div>
</div>
```

### Custom List Template

**Before:**
```html
<div class="list-item">
    <span class="status-col">{{Status}}</span>
</div>
```

**After:**
```html
<div class="list-item">
    <span class="status-col">{{statusBadge("Status")}}</span>
</div>
```

## Step 3: Remove Old Column Configuration (Optional)

You can now remove these column properties:
- `statusMapping` (no longer needed per column)
- `formatter: "statusBadge"` in grid view (if you only use templates)

## CSS Styling

Add this CSS to your theme or custom SCSS:

```css
.status-badge {
    display: inline-block;
    padding: 0.25em 0.6em;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
}

.badge-primary {
    background-color: #007bff;
    color: #fff;
}

.badge-secondary {
    background-color: #6c757d;
    color: #fff;
}

.badge-success {
    background-color: #28a745;
    color: #fff;
}

.badge-danger {
    background-color: #dc3545;
    color: #fff;
}

.badge-warning {
    background-color: #ffc107;
    color: #212529;
}

.badge-info {
    background-color: #17a2b8;
    color: #fff;
}
```

## Example: Your Actual Use Case

Based on your template:

```html
<div class="sr-list-item form-horizontal">
    <div class="sr-card soarui">
        <div class="sr-callout callouttype-null data-status={{Status}}">
            <div class="sr-callout-full">
                <span class="sr-callout-title">Status</span>
                <span class="sr-callout-value">{{statusBadge("Status")}}</span>
                <span class="sr-callout-title">Date Submitted</span>
                <span class="sr-callout-value">{{dateMDY("Submitted")}}</span>
            </div>
        </div>
        <div class="sr-card-container sr-li-selectable">
            <div class="sr-card-main">
                <div class="sr-card-header">
                    <span class="sr-card-header-primary">{{Form #}}</span>
                    <span class="sr-card-header-secondary">{{dateMDY("Submitted")}}</span>
                </div>
                <div class="sr-card-focus">
                    <div class="sr-card-focus-cell-full sr-py-1">
                        <span class="sr-card-label">Category</span>
                        <span class="sr-card-value">{{Category}}</span>
                    </div>
                    <div class="sr-card-focus-cell-full sr-py-1">
                        <span class="sr-card-label">Reason for Visit</span>
                        <span class="sr-card-value">{{Purpose}}</span>
                    </div>
                </div>
                <div class="sr-card-body">
                    <div class="sr-card-body-cell-full">
                        <span class="sr-card-label">Point of Contact</span>
                        <div class="value-container">
                            <span class="value-icon fas fa-user"></span>
                            <span class="sr-card-value">{{Point of Contact}}</span>
                        </div>
                        <div class="value-container">
                            <span class="value-icon fas fa-envelope"></span>
                            <span class="sr-card-value">{{Email}}</span>
                        </div>
                        <div class="value-container">
                            <span class="value-icon fas fa-phone-office"></span>
                            <span class="sr-card-value">{{OfficePhone}}</span>
                        </div>
                        <div class="value-container">
                            <span class="value-icon fas fa-mobile-screen"></span>
                            <span class="sr-card-value">{{MobilePhone}}</span>
                        </div>
                    </div>
                    <div class="sr-card-body-cell-full">
                        <span class="sr-card-label">Organization</span>
                        <span class="sr-card-value">{{Organization}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

**Key Points:**
- `data-status={{Status}}` - Gets raw value for CSS selectors
- `{{statusBadge("Status")}}` - Gets formatted badge HTML
- `{{dateMDY("Submitted")}}` - Built-in date formatter
- `{{Point of Contact}}` - Raw values for display

## Testing

1. Save widget configuration
2. Run your app
3. Check that status badges render correctly
4. Open browser console (F12) to check for any errors
5. Verify that `data-status` attribute has raw value (e.g., "1", "Open")
6. Verify that badge shows formatted value (e.g., styled "Open" badge)

## Troubleshooting

### Badge not showing?
- Check browser console for errors
- Verify formatter name is exactly `statusBadge` (case-sensitive)
- Ensure JSON configuration is valid (use https://jsonlint.com)

### Wrong colors?
- Check CSS classes are defined in your theme
- Verify `className` values in JSON match CSS class names
- Use inline `style` property as fallback

### Shows raw value instead of badge?
- Verify you're using `{{statusBadge("Status")}}` not just `{{Status}}`
- Check that Status field exists in your column configuration
- Ensure field name matches column header exactly

## Benefits Over Old Approach

✅ **Reusable**: Same formatter for multiple widgets/columns  
✅ **Centralized**: One place to update all status mappings  
✅ **Flexible**: Different templates can use same formatter  
✅ **Maintainable**: No widget code changes needed  
✅ **Documented**: Configuration is self-documenting

---

**Need Help?** Check the full [Custom Formatters Guide](./CUSTOM_FORMATTERS_GUIDE.md)
