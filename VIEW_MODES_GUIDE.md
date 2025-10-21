# View Modes Complete Guide

This guide explains how the AG Grid widget's view modes work and how they interact with custom templates.

## Quick Reference

| View Mode | Always Available? | Requires Template? | Use Case |
|-----------|------------------|-------------------|----------|
| **Grid** | ✅ Yes | ❌ No | Data-heavy tables, sorting, filtering |
| **Cards** | 🔄 Conditional | Optional | Mobile-friendly, visual layouts |
| **List** | 🔄 Conditional | Optional | Compact display, master-detail |

## View Mode Behavior

### 1. Grid View (Always Available)

- **Technology**: AG Grid React component
- **Configuration**: Column definitions only
- **Features**: Full AG Grid power (sorting, filtering, pagination, etc.)
- **Best For**: Desktop applications, data analysis, large datasets

**No template needed** - Grid view always works with just column configuration.

### 2. Cards View (Conditional)

Cards view availability depends on configuration:

#### Scenario A: Custom Card Template Provided
```xml
<property key="customCardTemplate">
    <div class="my-card">
        <h3>{{Name}}</h3>
        <p>{{Status}}</p>
    </div>
</property>
```
- ✅ Cards option appears in view selector
- Uses `CustomTemplateView` with your HTML
- Full control over layout and styling

#### Scenario B: No Template (Fallback)
- ✅ Cards option still appears (if `enableViewSelector=true`)
- Uses `DynamicView` component automatically
- Shows fields marked with `includeInCardView="true"`
- Responsive card layout with labels and values

**View Selector**: Shows Cards option if template exists OR enableViewSelector is true

### 3. List View (Conditional)

List view availability depends on configuration:

#### Scenario A: Custom List Template Provided
```xml
<property key="customListTemplate">
    <span>{{Name}} - {{Status}} | {{Date}}</span>
</property>
```
- ✅ List option appears in view selector
- Uses `CustomTemplateView` with your HTML
- Full control over layout and styling

#### Scenario B: No Template (Fallback)
- ❌ List option does NOT appear in view selector
- Falls back to `ListView` component if somehow accessed
- Compact vertical list layout

**View Selector**: Shows List option ONLY if template exists

## Smart View Selector Logic

The view selector adapts based on what you configure:

### Configuration Examples

#### Example 1: No Templates
```xml
<property key="enableViewSelector">true</property>
<!-- No customCardTemplate -->
<!-- No customListTemplate -->
```
**Result**: 
- View selector hidden
- Only Grid view available
- Simplest configuration

#### Example 2: Card Template Only
```xml
<property key="enableViewSelector">true</property>
<property key="customCardTemplate">{{Name}}</property>
<!-- No customListTemplate -->
```
**Result**:
- View selector shows: Grid ✓ | Cards ✓
- Two-option toggle
- List view not available

#### Example 3: List Template Only
```xml
<property key="enableViewSelector">true</property>
<!-- No customCardTemplate -->
<property key="customListTemplate">{{Name}}</property>
```
**Result**:
- View selector shows: Grid ✓ | List ✓
- Two-option toggle
- Cards view not available

#### Example 4: Both Templates
```xml
<property key="enableViewSelector">true</property>
<property key="customCardTemplate">{{Name}}</property>
<property key="customListTemplate">{{Name}}</property>
```
**Result**:
- View selector shows: Grid ✓ | Cards ✓ | List ✓
- Full three-option selector
- Maximum flexibility

## Template Placeholder System

All templates use the same `{{FieldName}}` syntax:

```html
<!-- Card Template -->
<div class="card">
    <h3>{{Name}}</h3>
    <p>{{Description}}</p>
    <span>${{Price}}</span>
</div>

<!-- List Template -->
<div class="list-item">
    <strong>{{Name}}</strong> - {{Status}} | {{Date}}
</div>
```

**Rules**:
- FieldName must match column header exactly
- Formatting from column configuration is applied
- Custom prefix/suffix from column config is applied
- Hidden columns can be used in templates

## localStorage & Mobile Behavior

### Persistence
The widget remembers the selected view in browser localStorage:
```javascript
localStorage.getItem('aggrid:YourWidgetName');
```

### Safety Reset
If localStorage contains a view that's no longer available:
```javascript
// localStorage says: "cards"
// But: customCardTemplate removed

// Widget automatically resets to: "grid"
```

**No errors, no broken states** - it just works!

### Mobile Defaults
```xml
<property key="defaultView">grid</property>
<property key="mobileDefaultView">cards</property>
```

If mobile default is cards/list but no template:
- Widget falls back to Grid view
- User can manually switch if templates are added later

## Component Architecture

### Internal Components

```
AGGrid.tsx (Main)
├── Grid View
│   └── GridView.tsx (AG Grid React)
│
├── Cards View
│   ├── CustomTemplateView.tsx (if template exists)
│   │   └── Uses {{FieldName}} placeholders
│   └── DynamicView.tsx (fallback)
│       └── Uses includeInCardView columns
│
└── List View
    ├── CustomTemplateView.tsx (if template exists)
    │   └── Uses {{FieldName}} placeholders
    └── ListView.tsx (fallback)
        └── Compact list layout
```

### CSS Classes

```css
/* Grid View */
.ag-grid-container { }

/* Cards View with Custom Template */
.aggrid-card-view { }
.aggrid-custom-item { }

/* Cards View with DynamicView Fallback */
.aggrid-cards-view { }
.aggrid-card { }
.card-field { }

/* List View with Custom Template */
.aggrid-list-view { }
.aggrid-custom-item { }

/* List View with ListView Fallback */
.aggrid-list-view { }
.list-item { }
```

## Best Practices

### 1. Start Simple
```xml
<!-- Start with grid only -->
<property key="enableViewSelector">false</property>
```

### 2. Add Mobile Support
```xml
<!-- Add card template for mobile -->
<property key="enableViewSelector">true</property>
<property key="customCardTemplate">
    <div class="mobile-card">
        <h4>{{Title}}</h4>
        <p>{{Summary}}</p>
    </div>
</property>
```

### 3. Full Responsive
```xml
<!-- Support all views for maximum flexibility -->
<property key="enableViewSelector">true</property>
<property key="customCardTemplate">...</property>
<property key="customListTemplate">...</property>
<property key="mobileDefaultView">cards</property>
```

### 4. Design-Time Preview
The widget preview in Studio Pro shows:
- Which views are available
- Template configuration status
- Color-coded indicators (green = configured, orange = not configured)

## Troubleshooting

### "View selector not showing"
✅ Check: Did you add a custom template?
✅ Check: Is `enableViewSelector="true"`?

### "Cards view shows wrong data"
✅ Check: Do `{{FieldName}}` placeholders match column headers exactly?
✅ Check: Are columns hidden that you're trying to use?

### "localStorage remembers wrong view"
✅ Solution: Widget auto-resets to Grid if saved view unavailable
✅ Manual: Clear localStorage in browser DevTools

### "Template not updating"
✅ Check: Did you rebuild/redeploy the widget?
✅ Try: Clear browser cache and reload

## Related Documentation

- [README.md](./README.md) - Main widget documentation
- [CUSTOM_TEMPLATES_README.md](./CUSTOM_TEMPLATES_README.md) - Template syntax and examples
- [UI_REFERENCE.md](./UI_REFERENCE.md) - Visual examples and screenshots
- [CONFIGURATION_EXAMPLES.md](./CONFIGURATION_EXAMPLES.md) - Full configuration examples

---

**Pro Tip**: Use the design-time preview in Studio Pro to verify your template configuration before deploying! 🎯
