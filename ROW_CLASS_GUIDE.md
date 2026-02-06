# Row Class Styling Guide

## Overview

You can apply **dynamic CSS class names** to entire rows in the AG Grid view. This is useful for highlighting rows based on status, severity, or any other column value.

Two modes are supported:

- **Mapping (value → class)**: Map a column value to a CSS class name.
- **Expression (JavaScript)**: Compute class names using a JavaScript expression.

These settings apply to **Grid view only**. Card/List templates already support custom class names within templates.

---

## Configuration

### 1) Mapping Mode (recommended)

**Use when:** you want a simple mapping from a column value to a class name.

**Widget Settings → Row Styling**

| Property | Value |
|----------|-------|
| Row Class Mode | `Mapping (value → class)` |
| Row Class Attribute | `Status` (or any attribute) |
| Row Class Mapping | `{ "Active": "row-active", "Inactive": "row-inactive" }` |
| Default Row Class | `row-default` (optional) |

### 2) Expression Mode

**Use when:** you need custom logic or multiple classes.

**Widget Settings → Row Styling**

| Property | Value |
|----------|-------|
| Row Class Mode | `Expression (JavaScript)` |
| Row Class Expression | `columnValue === "High" ? "row-danger" : ""` |
| Row Class Attribute | `Severity` (optional but recommended) |
| Default Row Class | `row-default` (optional) |

Available variables:

- `data` — the Mendix object for the row
- `rowIndex` — row index (0-based)
- `columnValue` — value of the selected **Row Class Attribute**
- `getValue(attributeId)` — helper to get any column value by attribute id

Example:

```javascript
getValue("Status") === "Delayed" ? "row-warning" : ""
```

---

## CSS Example

Add styles to your Mendix theme (e.g., `theme/web/custom-variables.scss`):

```css
.row-active {
  background: #e8f5e9;
}

.row-inactive {
  background: #ffebee;
  color: #b71c1c;
}

.row-warning {
  background: #fff8e1;
}
```

---

## Tips & Troubleshooting

- **No class applied?** Ensure the attribute value matches your JSON mapping exactly (case sensitive).
- **Expression errors?** Invalid JavaScript will be logged in the browser console and ignored.
- **Multiple classes?** Expression mode can return an array: `return ["row-danger", "row-bold"];`
- **Server-side row model?** Works normally — row class is applied per row as it loads.

---

## Suggested Naming Convention

Use clear, reusable class names:

- `row-success`
- `row-warning`
- `row-danger`
- `row-muted`

This keeps row styling consistent across grids and easy to theme.
