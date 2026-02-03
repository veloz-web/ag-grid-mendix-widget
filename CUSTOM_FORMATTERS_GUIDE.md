# Custom Formatters Guide

## Table of Contents
- [Overview](#overview)
- [How Custom Formatters Work](#how-custom-formatters-work)
- [Configuration](#configuration)
- [Context Variables](#context-variables)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Custom formatters allow you to write JavaScript code that controls how cell values are displayed in your grid. They're perfect for:

- **Status badges** with custom colors
- **Conditional formatting** based on values
- **Complex HTML rendering** (icons, multi-line content)
- **Data transformation** (formatting dates, numbers, etc.)

## How Custom Formatters Work

The custom formatter system has two parts that work together:

```
┌─────────────────────────────────────────────────────────────┐
│  1. FORMATTER CODE (Function)                               │
│     The JavaScript that runs for each cell                  │
│     Uses the config parameter to customize behavior         │
└─────────────────────────────────────────────────────────────┘
                            ↓ uses
┌─────────────────────────────────────────────────────────────┐
│  2. FORMATTER CONFIGURATION (JSON)                          │
│     Data/settings passed to your function as "config"       │
│     Makes your formatter reusable and configurable          │
└─────────────────────────────────────────────────────────────┘
```

**Both are applied together** - the configuration provides the data, the function uses it to render cells.

---

## Configuration

### 1. Column Properties

Set these properties on your column in Mendix Studio Pro:

| Property | Value | Description |
|----------|-------|-------------|
| **Formatter Type** | `javascript` | Enables custom formatter |
| **Custom Formatter Name** | `statusBadge` | Unique name (for debugging) |
| **Formatter Code** | `(function code)` | JavaScript function |
| **Formatter Configuration** | `(JSON object)` | Configuration data |

### 2. Formatter Code Structure

Your formatter code is a function that receives these parameters and returns HTML:

```javascript
// Available parameters:
// - value: The cell's value
// - item: The entire row object
// - column: Column configuration
// - config: Your JSON configuration (parsed)

try {
    // Your formatting logic here
    
    // Access configuration
    const mappings = config || [];
    
    // Process the value
    const result = /* your logic */;
    
    // Return HTML string
    return `<span class="custom-class">${result}</span>`;
    
} catch (e) {
    // Always handle errors gracefully
    console.error("Error in custom formatter:", e);
    return String(value || "");
}
```

### 3. Formatter Configuration (JSON)

This JSON object is automatically parsed and passed to your function as `config`:

```json
{
    "mappings": [
        {"value": "Active", "label": "Active", "className": "badge-success"},
        {"value": "Inactive", "label": "Inactive", "className": "badge-danger"}
    ],
    "defaultClass": "badge-secondary",
    "showIcon": true
}
```

**Important**: The configuration must be valid JSON (use double quotes, no trailing commas).

---

## Context Variables

Your formatter function has access to these variables:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `value` | any | Current cell value | `"Approved"`, `123`, `true` |
| `item` | object | Full row data (Mendix object) | `{id: 1, name: "John", status: "Active"}` |
| `column` | object | Column configuration | `{attribute: {id: "status"}, ...}` |
| `config` | object/array | Your parsed JSON configuration | `[{value: "Active", className: "badge-success"}]` |

### Accessing Row Data

```javascript
// Access other columns in the same row
const name = item.name;
const department = item.department;

// Use in conditional logic
if (item.priority === "High" && value === "Pending") {
    return `<span class="badge badge-urgent">${value}</span>`;
}
```

---

## Examples

### Example 1: Status Badge (Your Current Implementation)

**Use Case**: Display status values as colored badges with custom labels.

**Formatter Code**:
```javascript
try {
    const mappings = config || [
        {"value":"Approved (Completely)","label":"Approved","className":"badge-approved"},
        {"value":"Denied","label":"Denied","className":"badge-denied"},
        {"value":"Pending","label":"Pending","className":"badge-pending"},
        {"value":"Open","label":"Open","className":"badge-open"}
    ];

    if (!Array.isArray(mappings)) {
        console.warn("Status mapping is not an array:", mappings);
        return `<span class="status-badge badge-secondary">${String(value || "")}</span>`;
    }

    // Normalize the value for comparison
    const normalizedValue = value !== null && value !== undefined ? value : "";

    // Find matching mapping - support both numeric and string values
    const mapping = mappings.find((m) => {
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
        // No mapping found, return default badge
        return `<span class="status-badge badge-secondary">${String(value || "")}</span>`;
    }

    // Return HTML string with badge
    const className = `status-badge ${mapping.className || "badge-secondary"}`.trim();
    const style = mapping.style ? ` style="${mapping.style}"` : "";
    const labelText = mapping.label !== undefined && mapping.label !== null
        ? String(mapping.label)
        : String(value || "");

    return `<span class="${className}"${style} data-status="${labelText}">${labelText}</span>`;
    
} catch (e) {
    console.error("Error in custom formatter:", e);
    console.error("Value was:", value);
    return `<span class="status-badge badge-secondary">${String(value || "")}</span>`;
}
```

**Formatter Configuration**:
```json
[
    {"value":"Approved (Completely)","label":"Approved","className":"badge-approved"},
    {"value":"Denied","label":"Denied","className":"badge-denied"},
    {"value":"Pending","label":"Pending","className":"badge-pending"},
    {"value":"Open","label":"Open","className":"badge-open"}
]
```

**CSS** (add to your theme):
```css
.status-badge {
    display: inline-block;
    padding: 0.25em 0.6em;
    font-size: 0.875em;
    font-weight: 600;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    border-radius: 0.25rem;
}

.badge-approved {
    background-color: #28a745;
    color: white;
}

.badge-denied {
    background-color: #dc3545;
    color: white;
}

.badge-pending {
    background-color: #ffc107;
    color: #212529;
}

.badge-open {
    background-color: #17a2b8;
    color: white;
}

.badge-secondary {
    background-color: #6c757d;
    color: white;
}
```

---

### Example 2: Priority with Icons

**Use Case**: Show priority levels with colored icons.

**Formatter Code**:
```javascript
try {
    const priorities = config || {
        "High": { icon: "⬆️", className: "priority-high", color: "#dc3545" },
        "Medium": { icon: "➡️", className: "priority-medium", color: "#ffc107" },
        "Low": { icon: "⬇️", className: "priority-low", color: "#28a745" }
    };

    const priority = priorities[value] || priorities["Medium"];
    
    return `<span class="priority-badge ${priority.className}" style="color: ${priority.color}">
                ${priority.icon} ${value}
            </span>`;
} catch (e) {
    console.error("Error in priority formatter:", e);
    return String(value || "");
}
```

**Formatter Configuration**:
```json
{
    "High": { "icon": "⬆️", "className": "priority-high", "color": "#dc3545" },
    "Medium": { "icon": "➡️", "className": "priority-medium", "color": "#ffc107" },
    "Low": { "icon": "⬇️", "className": "priority-low", "color": "#28a745" }
}
```

---

### Example 3: Conditional Formatting Based on Multiple Columns

**Use Case**: Highlight overdue tasks in red.

**Formatter Code**:
```javascript
try {
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && item.status !== "Completed";
    
    const className = isOverdue ? "text-danger font-weight-bold" : "";
    
    return `<span class="${className}">${value}</span>`;
} catch (e) {
    console.error("Error in date formatter:", e);
    return String(value || "");
}
```

**Formatter Configuration**:
```json
{}
```
*(No configuration needed - uses row data directly)*

---

### Example 4: Progress Bar

**Use Case**: Show completion percentage as a visual progress bar.

**Formatter Code**:
```javascript
try {
    const percentage = Number(value) || 0;
    const capped = Math.min(100, Math.max(0, percentage));
    
    const color = config?.colorThresholds ? 
        (capped >= 75 ? config.colorThresholds.high :
         capped >= 50 ? config.colorThresholds.medium :
         config.colorThresholds.low) : "#007bff";
    
    return `
        <div class="progress" style="height: 20px;">
            <div class="progress-bar" 
                 role="progressbar" 
                 style="width: ${capped}%; background-color: ${color};"
                 aria-valuenow="${capped}" 
                 aria-valuemin="0" 
                 aria-valuemax="100">
                ${capped}%
            </div>
        </div>
    `;
} catch (e) {
    console.error("Error in progress formatter:", e);
    return `${value}%`;
}
```

**Formatter Configuration**:
```json
{
    "colorThresholds": {
        "high": "#28a745",
        "medium": "#ffc107",
        "low": "#dc3545"
    }
}
```

---

### Example 5: Currency with Symbol

**Use Case**: Format currency with locale-specific symbols.

**Formatter Code**:
```javascript
try {
    const amount = Number(value) || 0;
    const symbol = config?.currencySymbol || "$";
    const locale = config?.locale || "en-US";
    const decimals = config?.decimals !== undefined ? config.decimals : 2;
    
    const formatted = amount.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
    
    const isNegative = amount < 0;
    const className = isNegative ? "text-danger" : "";
    
    return `<span class="${className}">${symbol}${formatted}</span>`;
} catch (e) {
    console.error("Error in currency formatter:", e);
    return String(value || "");
}
```

**Formatter Configuration**:
```json
{
    "currencySymbol": "$",
    "locale": "en-US",
    "decimals": 2
}
```

---

### Example 6: Multi-line Content

**Use Case**: Display name with subtitle (department).

**Formatter Code**:
```javascript
try {
    const name = value || "";
    const department = item.department || "";
    const email = item.email || "";
    
    return `
        <div class="user-cell">
            <div class="user-name">${name}</div>
            <div class="user-details text-muted small">
                ${department}${email ? ` • ${email}` : ""}
            </div>
        </div>
    `;
} catch (e) {
    console.error("Error in user formatter:", e);
    return String(value || "");
}
```

**Formatter Configuration**:
```json
{}
```

**CSS**:
```css
.user-cell {
    padding: 4px 0;
}

.user-name {
    font-weight: 500;
}

.user-details {
    font-size: 0.85em;
    color: #6c757d;
}
```

---

## Best Practices

### 1. Always Use Try-Catch

```javascript
try {
    // Your formatter logic
} catch (e) {
    console.error("Error in custom formatter:", e);
    console.error("Value was:", value);
    return String(value || ""); // Fallback to simple string
}
```

**Why**: If your formatter crashes, the entire grid column will fail to render.

### 2. Handle Null/Undefined Values

```javascript
const normalizedValue = value !== null && value !== undefined ? value : "";
```

**Why**: Grid data might have missing values.

### 3. Validate Configuration

```javascript
if (!Array.isArray(mappings)) {
    console.warn("Expected array, got:", typeof mappings);
    return `<span>${String(value)}</span>`;
}
```

**Why**: Configuration errors are easy to make and hard to debug.

### 4. Use Semantic HTML

```javascript
// Good: Semantic and accessible
return `<span class="status-badge" role="status" aria-label="${status}">${status}</span>`;

// Avoid: Non-semantic divs everywhere
return `<div><div><div>${status}</div></div></div>`;
```

**Why**: Better for accessibility and CSS styling.

### 5. Escape User Input (If Applicable)

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

return `<span>${escapeHtml(value)}</span>`;
```

**Why**: Prevents XSS if user data could contain HTML.

### 6. Keep It Fast

```javascript
// Good: Simple and fast
return `<span class="${value === 'Active' ? 'active' : 'inactive'}">${value}</span>`;

// Avoid: Complex calculations in every cell
const result = expensiveCalculation();
return `<span>${result}</span>`;
```

**Why**: This runs for EVERY cell, EVERY render. Slow formatters = slow grid.

### 7. Test Edge Cases

Test your formatter with:
- `null` values
- `undefined` values
- Empty strings `""`
- Very long strings
- Numbers as strings `"123"`
- Special characters

---

## Troubleshooting

### Problem: "Nothing displays" or blank cells

**Cause**: Formatter is crashing or returning invalid HTML.

**Solution**:
1. Open browser DevTools console (F12)
2. Look for error messages
3. Add more try-catch blocks
4. Add `console.log(value, config)` to see what data you're getting

```javascript
try {
    console.log("Formatter received:", { value, config, item });
    // ... rest of code
} catch (e) {
    console.error("Formatter error:", e);
    return String(value || "ERROR");
}
```

---

### Problem: Configuration not working

**Symptoms**: `config` is undefined or wrong type.

**Solution**:
1. Verify JSON is valid (use JSONLint.com)
2. No trailing commas in JSON
3. Use double quotes, not single quotes
4. Check for syntax errors

```javascript
// Add defensive check
const mappings = config || [];
if (!Array.isArray(mappings)) {
    console.error("Config is not an array:", config);
    return `<span>${value}</span>`;
}
```

---

### Problem: Styles not applying

**Cause**: CSS classes not defined or wrong selector.

**Solution**:
1. Check if CSS is loaded in your theme
2. Inspect element in DevTools to see actual classes
3. Check CSS specificity (grid styles might override yours)

```css
/* More specific selector wins */
.ag-theme-alpine .status-badge.badge-approved {
    background-color: #28a745 !important;
}
```

---

### Problem: Formatter not running

**Cause**: Formatter type not set to `javascript` or code has syntax error.

**Solution**:
1. Verify column **Formatter Type** = `javascript`
2. Check for JavaScript syntax errors
3. Ensure code is a valid expression (not a statement)

---

### Problem: Can't access other column values

**Symptoms**: `item.otherColumn` is undefined.

**Solution**:
```javascript
// Make sure the attribute exists on the Mendix entity
console.log("Available attributes:", Object.keys(item));

// Use optional chaining
const dept = item?.department || "N/A";
```

---

## Advanced Tips

### Reusing Formatters

Create a configuration object for similar patterns:

```json
{
    "type": "status",
    "mappings": [...],
    "defaults": {
        "className": "badge-secondary",
        "showIcon": false
    }
}
```

### Dynamic Styling

```javascript
const color = value > 100 ? "#dc3545" : "#28a745";
return `<span style="color: ${color}; font-weight: bold">${value}</span>`;
```

### Combining with AG Grid Features

Your custom HTML works with AG Grid's built-in features:
- Sorting still works (based on raw value)
- Filtering still works (based on raw value)
- Export exports the raw value (not HTML)

---

## Migration from Built-in Formatters

If you're migrating from a built-in formatter to custom:

**Before** (Built-in):
- Formatter Type: `currency`

**After** (Custom):
- Formatter Type: `javascript`
- Formatter Code: *(currency formatting function)*
- Formatter Configuration: `{"symbol": "$", "decimals": 2}`

---

## Related Documentation

- [Main README](./README.md) - Widget overview
- [Column Configuration](./COLUMN_WIDTH_CONFIGURATION.md) - Column setup
- [Custom Templates](./CUSTOM_TEMPLATES_README.md) - Card/List view customization
- [Date Formatting Guide](./DATE_FORMATTING_GUIDE.md) - Date display options

---

## Need Help?

- Check browser console for error messages
- Verify JSON configuration is valid
- Test with simple formatters first, then add complexity
- Use `console.log()` liberally during development
- Review the examples above for patterns

**Remember**: Formatters run for every cell on every render - keep them fast and error-free!
