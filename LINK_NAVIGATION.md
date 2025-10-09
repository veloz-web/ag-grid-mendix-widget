# Link Navigation in AG Grid Widget

## Overview

The AG Grid widget supports two methods for creating clickable links in your grid:

1. **Mendix Action (Recommended)** - Uses Mendix's native navigation system
2. **URL Pattern (Legacy)** - Direct HTML links for external URLs

## Method 1: Mendix Action (Recommended)

### Why Use Actions?

Using Mendix actions provides:
- ✅ Proper client-side routing (no page refresh)
- ✅ Support for Show Page, Microflow, Nanoflow
- ✅ Access to the full row context object
- ✅ Consistent with Mendix best practices
- ✅ Works with Mendix's security model

### Setup Instructions

1. **Configure the Column:**
   - Set the column formatter to `link`
   - Configure the **Link Action** property
   - The action receives the row's data object as context

2. **Action Options:**
   - **Show Page**: Navigate to a page and pass the object
   - **Call Microflow**: Execute server-side logic with the object
   - **Call Nanoflow**: Execute client-side logic
   - **Open Link**: Open external URL (if needed)

3. **Visual Display:**
   - By default, shows an eye icon (👁️) in the cell
   - Icon changes color on hover
   - Clicking executes the configured action

### Example Use Cases

#### Navigate to Detail Page
```
Action: Show Page
Page: MyEntity_Detail
Pass Object: {CurrentObject} from the row
```

#### Execute Microflow
```
Action: Call Microflow
Microflow: ACT_ProcessRecord
Pass Object: {CurrentObject} from the row
```

#### Open in New Tab
```
Action: Open Link
URL: https://example.com/details/{Attribute}
Open in New Tab: Yes
```

## Method 2: URL Pattern (Legacy)

### When to Use

Only use URL patterns for:
- External links to other websites
- Legacy implementations
- Simple static URLs

⚠️ **Warning**: URL patterns cause full page navigation and don't use Mendix routing.

### Setup Instructions

1. **Configure the Column:**
   - Set the column formatter to `link`
   - Set **Link URL Pattern** (e.g., `link/visit-requests/view/${value}`)
   - Optionally set **Link Text** for custom display

2. **Placeholder Support:**
   - Use `${value}` in the URL pattern
   - It will be replaced with the cell's value
   - Example: `/details/${value}` → `/details/123`

### Example
```
Link URL Pattern: link/visit-requests/view/${value}
Link Text: View Details (optional)
```

## Migration Guide

### From URL Pattern to Action

**Before (URL Pattern):**
```
Formatter: link
Link URL Pattern: link/visit-requests/view/${value}
```

**After (Mendix Action):**
```
Formatter: link
Link Action: Show Page → VisitRequest_Detail
  - Pass object: {CurrentObject}
```

**Benefits:**
- No page reload
- Proper browser history
- Better user experience
- Works with Mendix security

## Styling

### Icon Styling
The eye icon is styled using Font Awesome and can be customized in CSS:

```css
.aggrid-link-action {
    color: #1976d2;
    font-size: 16px;
}

.aggrid-link-action:hover {
    color: #1565c0;
    transform: scale(1.1);
}
```

### Custom Icon
To change the icon, modify the class in the component:
- Current: `fas fa-eye` (eye icon)
- Alternative: `fas fa-external-link-alt`, `fas fa-arrow-right`, etc.

## Troubleshooting

### Action Not Working
1. Verify the action is configured in the column properties
2. Check that `canExecute` returns true for the action
3. Ensure the data source provides the necessary context object

### Link Not Appearing
1. Verify formatter is set to "link"
2. Check that either Link Action OR Link URL Pattern is configured
3. Ensure the column has valid data

### Wrong Context Object
- The action receives the entire row's data object
- Use this object to pass to pages or microflows
- The object type matches your data source entity

## Best Practices

1. **Always prefer Mendix Actions** over URL patterns
2. **Use meaningful action names** (e.g., "View Details", "Edit Record")
3. **Test actions** with different user roles/permissions
4. **Consider mobile** - actions work better than links on touch devices
5. **Use security** - Mendix actions respect entity and page access rules

## Examples in Context

### Grid View
```
Column 1: Name (text)
Column 2: Status (status badge)
Column 3: Actions (link with action)
  - Formatter: link
  - Link Action: Show Page → Detail_Page
  - Icon displays in cell
```

### Card View
```
Card displays:
- Name: John Doe
- Status: [Active Badge]
- Actions: [👁️] (clickable eye icon)
```

### List View
```
List items show all data in compact format
Links work the same way as in other views
```

## API Reference

### Column Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `formatter` | enum | Yes | Set to `"link"` |
| `linkAction` | ActionValue | No* | Mendix action to execute (recommended) |
| `linkUrlPattern` | string | No* | URL with `${value}` placeholder (legacy) |
| `linkText` | string | No | Custom text for legacy links |

\* Either `linkAction` or `linkUrlPattern` must be configured

### TypeScript Interface

```typescript
interface ColumnsType {
    // ... other properties
    formatter: "link";
    linkAction?: ActionValue;        // Mendix action
    linkUrlPattern: string;          // Legacy URL pattern
    linkText: string;                // Legacy link text
}
```

## Support

For issues or questions:
1. Check that your Mendix version supports pluggable widgets
2. Verify action permissions in your security settings
3. Test with a simple Show Page action first
4. Check browser console for error messages
