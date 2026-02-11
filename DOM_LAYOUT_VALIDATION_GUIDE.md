# DOM Layout Validation - Studio Pro Error Guide

## Overview

When DOM Layout is set to "Auto Height" or "Print" with conflicting settings, **Mendix Studio Pro will show validation errors** that prevent the app from running until fixed.

## Three-Layer Validation

### 1. **Studio Pro Design-Time Errors** (Immediate)
Red error indicators appear in the widget properties panel as you configure settings.

### 2. **Preview Warnings** (Visual Feedback)
Orange warning banner appears in the widget preview showing what's wrong.

### 3. **Runtime Errors** (Prevents App Start)
If somehow errors are bypassed, the app throws an error and won't run.

---

## Studio Pro Validation Errors

When you configure conflicting settings, you'll see **red error markers** on multiple properties:

### Scenario 1: Auto Height + Pagination Enabled

**Properties with Errors:**

**DOM Layout** property:
```
❌ DOM Layout "autoHeight" conflicts with Pagination. 
Auto Height mode shows all rows at once, making pagination ineffective. 
Set DOM Layout to "Normal" or disable Pagination.
```

**Pagination** property:
```
❌ Pagination conflicts with DOM Layout "autoHeight". 
Disable Pagination or set DOM Layout to "Normal".
```

**Visual in Studio Pro:**
```
Widget Properties Panel:
┌─────────────────────────────────────┐
│ General                             │
│   DOM Layout: Auto Height      ❌   │  ← Red error icon
│   Pagination: ☑ Enabled        ❌   │  ← Red error icon
│                                     │
│ ⚠️ 2 validation errors              │
└─────────────────────────────────────┘

Errors Panel (bottom):
┌─────────────────────────────────────────────────────────────────┐
│ ❌ DOM Layout "autoHeight" conflicts with Pagination...        │
│ ❌ Pagination conflicts with DOM Layout "autoHeight"...        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Scenario 2: Auto Height + Virtualization Enabled (Default)

**Properties with Errors:**

**DOM Layout** property:
```
❌ DOM Layout "autoHeight" requires Row Virtualization to be disabled. 
Auto Height mode renders ALL rows in the DOM at once. 
Enable "Disable Virtualisation" setting or set DOM Layout to "Normal".
```

**Disable Virtualisation** property:
```
❌ Row Virtualization must be disabled when DOM Layout is "autoHeight". 
Enable "Disable Virtualisation" or set DOM Layout to "Normal".
```

**Visual in Studio Pro:**
```
Widget Properties Panel:
┌─────────────────────────────────────┐
│ Display                             │
│   DOM Layout: Auto Height      ❌   │
│   Disable Virtualisation: ☐    ❌   │  ← Must be checked
│                                     │
│ ⚠️ 2 validation errors              │
└─────────────────────────────────────┘
```

---

### Scenario 3: Auto Height + Server-Side Row Model

**Properties with Errors:**

**DOM Layout** property:
```
❌ DOM Layout "autoHeight" is incompatible with Server-Side row model. 
Server-Side is designed for large datasets with lazy loading, but autoHeight 
loads all rows at once. Set DOM Layout to "Normal" or use Client-Side row model.
```

**Row Model** property:
```
❌ Server-Side row model conflicts with DOM Layout "autoHeight". 
Use Client-Side row model or set DOM Layout to "Normal".
```

**Visual in Studio Pro:**
```
Widget Properties Panel:
┌─────────────────────────────────────┐
│ Data Source                         │
│   Row Model: Server-Side       ❌   │
│                                     │
│ Display                             │
│   DOM Layout: Auto Height      ❌   │
│                                     │
│ ⚠️ 2 validation errors              │
└─────────────────────────────────────┘
```

---

### Scenario 4: All Three Conflicts (Worst Case)

If Auto Height is enabled with **all three** conflicting settings:

**Total Errors: 6** (2 per conflict)

```
Widget Properties Panel:
┌─────────────────────────────────────┐
│ Data Source                         │
│   Row Model: Server-Side       ❌   │
│                                     │
│ Display                             │
│   DOM Layout: Auto Height      ❌   │
│   Pagination: ☑ Enabled        ❌   │
│   Disable Virtualisation: ☐    ❌   │
│                                     │
│ ⚠️ 6 validation errors              │
└─────────────────────────────────────┘

Errors Panel:
┌──────────────────────────────────────────────────────────────────────┐
│ ❌ DOM Layout "autoHeight" conflicts with Pagination...             │
│ ❌ Pagination conflicts with DOM Layout "autoHeight"...             │
│ ❌ DOM Layout "autoHeight" requires Row Virtualization disabled...  │
│ ❌ Row Virtualization must be disabled when DOM Layout...           │
│ ❌ DOM Layout "autoHeight" is incompatible with Server-Side...      │
│ ❌ Server-Side row model conflicts with DOM Layout...               │
└──────────────────────────────────────────────────────────────────────┘
```

**Studio Pro Behavior:**
- ⛔ **Cannot run the app** (Run/Publish buttons disabled)
- ⛔ **Cannot deploy** until errors are fixed
- ✅ Can still save the project
- ✅ Can still edit other widgets

---

## Preview Warning Banner

In addition to property errors, the widget preview shows an **orange warning banner**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Widget Preview Area                            │
├─────────────────────────────────────────────────────────────────────┤
│ ⚠️ DOM Layout Configuration Warnings:                               │
│                                                                     │
│ • DOM Layout 'Auto Height' conflicts with Pagination. Pagination   │
│   will be disabled because the grid expands to show all rows.      │
│                                                                     │
│ • DOM Layout 'Auto Height' disables row virtualization. ALL rows   │
│   will be rendered in the DOM, which can cause performance issues  │
│   with large datasets (>100 rows).                                 │
│                                                                     │
│ • DOM Layout 'Auto Height' is NOT recommended with Server-Side     │
│   row model. Server-Side is designed for large datasets, but Auto  │
│   Height loads all rows at once.                                   │
│                                                                     │
│ 💡 Tip: For large datasets with pagination, keep DOM Layout set    │
│    to "Normal"                                                      │
├─────────────────────────────────────────────────────────────────────┤
│              [Grid Preview with Sample Data]                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Runtime Error (Fallback)

If validation is somehow bypassed, the app will throw this error on startup:

```javascript
Error: ❌ AG Grid Configuration Error:

1. DOM Layout "autoHeight" conflicts with Pagination. Auto Height and Print 
   modes show all rows at once, making pagination ineffective. Set DOM Layout 
   to "Normal" or disable Pagination.

2. DOM Layout "autoHeight" requires disabling Row Virtualization. Auto Height 
   and Print modes render ALL rows in the DOM at once. Enable "Disable 
   Virtualisation" or set DOM Layout to "Normal".

3. DOM Layout "autoHeight" is incompatible with Server-Side row model. 
   Server-Side is designed for large datasets with lazy loading, but autoHeight 
   loads all rows at once. Set DOM Layout to "Normal" or use Client-Side row model.

Fix these issues in the widget properties to continue.
```

**User sees:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Application Error                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  The application encountered an error and cannot start.     │
│                                                             │
│  ❌ AG Grid Configuration Error:                            │
│                                                             │
│  1. DOM Layout "autoHeight" conflicts with Pagination...    │
│  2. DOM Layout "autoHeight" requires disabling Row          │
│     Virtualization...                                       │
│  3. DOM Layout "autoHeight" is incompatible with            │
│     Server-Side row model...                                │
│                                                             │
│  Fix these issues in the widget properties to continue.     │
│                                                             │
│                      [ Close ]                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Resolution Steps

### Option 1: Keep Auto Height, Fix Conflicts
1. ✅ Set **Pagination** to `Disabled`
2. ✅ Set **Disable Virtualisation** to `Enabled` (checked)
3. ✅ Set **Row Model** to `Client-Side`

### Option 2: Keep Current Settings, Change Layout
1. ✅ Set **DOM Layout** to `Normal`

### Recommended Approach

For most use cases:
```
✅ DOM Layout: Normal
✅ Pagination: Enabled  
✅ Row Virtualization: Enabled (Disable Virtualisation unchecked)
✅ Row Model: Client-Side (or Server-Side for large data)
```

Only use Auto Height for:
- Small datasets (<100 rows)
- Embedded widgets in cards/panels
- Print views
- When you specifically don't want scrolling

---

## Implementation Files

**Studio Pro Validation** (`src/AGGrid.editorConfig.ts`):
- Validates properties in Studio Pro
- Shows red error indicators on properties
- Populates Errors panel

**Preview Warnings** (`src/AGGrid.editorPreview.tsx`):
- Shows orange warning banner in preview
- Lists all conflicts
- Provides helpful tips

**Runtime Validation** (`src/AGGrid.tsx`):
- Throws error if app tries to run with conflicts
- Prevents broken configuration from running
- Last line of defense

---

## Testing the Validation

1. **Open your Mendix project** in Studio Pro
2. **Add AG Grid widget** to a page
3. **Configure these settings**:
   - DOM Layout: `Auto Height`
   - Pagination: `Enabled` ✅
4. **Observe**:
   - ❌ Red error on DOM Layout property
   - ❌ Red error on Pagination property
   - ⚠️ Orange warning in widget preview
   - ⛔ Cannot run the app
5. **Fix by either**:
   - Disabling Pagination
   - OR changing DOM Layout to Normal
6. **Errors disappear** and app can run

---

## Benefits of This Approach

✅ **Prevents Invalid Configurations** - Developer can't create broken setups
✅ **Clear Error Messages** - Explains exactly what's wrong and how to fix
✅ **Multiple Feedback Layers** - Design-time + preview + runtime
✅ **Guided Resolution** - Errors point to specific properties that need changes
✅ **Professional UX** - Similar to Mendix's built-in validation patterns
