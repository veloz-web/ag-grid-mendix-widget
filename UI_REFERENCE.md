# AG Grid Widget - UI Reference

## Overview
This document maps the new view selector and filter drawer features to the UI patterns shown in the example images.

## Visual Components Reference

### 1. View Selector (Top Bar)
Similar to the "Views" control shown in the reference image with three view options:

```
┌─────────────────────────────────┐
│ Views: [⊞ Grid] [≡ List] [▢ Cards] │  [⚙ Filters]
└─────────────────────────────────┘
```

**Implementation:**
- Three icon-based toggle buttons
- Active view highlighted in blue
- Clean, modern design matching Mendix UI patterns
- Located in toolbar above data display

### 2. Filter Drawer (Slide-out Panel)
Inspired by the "Settings" drawer pattern with filters sidebar:

```
                                    ┌──────────────────────┐
                                    │  Filters         [×] │
                                    ├──────────────────────┤
                                    │                      │
                                    │  ▼ Sort              │
                                    │  Date Submitted ▼    │
                                    │                      │
                                    │  🔍 Search           │
                                    │  [Contains...      ] │
                                    │                      │
                                    │  ⚡ Filters          │
                                    │  Status:     All  ▼  │
                                    │  Organization: All ▼ │
                                    │                      │
                                    │  [Field Name]        │
                                    │  [Filter Value...  ] │
                                    │                      │
                                    ├──────────────────────┤
                                    │ [Clear All Filters]  │
                                    └──────────────────────┘
```

**Implementation:**
- 320px wide slide-out drawer from right
- Dark overlay backdrop (click to close)
- Header with "Filters" title and close button
- Scrollable body with filter inputs
- Footer with "Clear All Filters" button
- Shows only columns marked `includeInFilters=true`

### 3. Grid View (Default Desktop)
Standard AG Grid table layout:

```
┌────────────────────────────────────────────────────────┐
│  Views: [⊞] [≡] [▢]                           [⚙ Filters] │
├────────────┬──────────┬──────────┬────────────────────┤
│ Name       │ Status   │ Date     │ Actions            │
├────────────┼──────────┼──────────┼────────────────────┤
│ John Doe   │ ✓ Active │ 10/1/23  │ [View]             │
│ Jane Smith │ ✓ Active │ 10/2/23  │ [View]             │
│ Bob Jones  │ × Closed │ 10/3/23  │ [View]             │
└────────────┴──────────┴──────────┴────────────────────┘
```

### 4. Card View (Default Mobile)
Responsive card grid layout:

```
┌──────────────────────┐  ┌──────────────────────┐
│  Name: John Doe      │  │  Name: Jane Smith    │
│  Status: ✓ Active    │  │  Status: ✓ Active    │
│  Date: 10/1/23       │  │  Date: 10/2/23       │
│  Amount: $1,250      │  │  Amount: $2,400      │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  Name: Bob Jones     │  │  Name: Alice Brown   │
│  Status: × Closed    │  │  Status: ⚠ Pending   │
│  Date: 10/3/23       │  │  Date: 10/4/23       │
│  Amount: $850        │  │  Amount: $3,100      │
└──────────────────────┘  └──────────────────────┘
```

### 5. List View (Compact)
Similar to the detail list in the reference image:

```
┌──────────────────────────────────────────────────┐
│  John Doe                                        │
│  Status: Active • Date: 10/1/23                  │
├──────────────────────────────────────────────────┤
│  Jane Smith                                      │
│  Status: Active • Date: 10/2/23                  │
├──────────────────────────────────────────────────┤
│  Bob Jones                                       │
│  Status: Closed • Date: 10/3/23                  │
└──────────────────────────────────────────────────┘
```

## Configuration Mapping

### From Reference Image "Settings" to Our Filter Drawer

**Reference Image Shows:**
- Views toggle (Grid/List/Cards)
- Sort dropdown
- Search box
- Status filter dropdown
- Organization filter dropdown

**Our Implementation:**
```xml
<columns>
    <!-- This column appears in filter drawer -->
    <column 
        header="Status"
        attribute="Status"
        includeInFilters="true"  ← Makes it filterable
        includeInCardView="true" ← Shows in cards
        includeInSort="true"     ← Available for sorting
    />
    
    <!-- This column is hidden from filters -->
    <column 
        header="Internal ID"
        attribute="InternalID"
        includeInFilters="false"  ← Not in drawer
        includeInCardView="false" ← Not in cards
    />
</columns>
```

## Responsive Behavior

### Desktop (≥768px)
```
┌─────────────────────────────────────────────┐
│  [⊞ Grid] [≡ List] [▢ Cards]      [⚙ Filters] │ ← Toolbar
├─────────────────────────────────────────────┤
│                                             │
│          AG Grid Table View                 │
│          (Default on Desktop)               │
│                                             │
└─────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│ [⊞] [≡] [▢]    [⚙]  │ ← Compact toolbar
├──────────────────────┤
│  ┌────────────────┐  │
│  │  Card 1        │  │
│  │  Name: John    │  │
│  │  Status: ✓     │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │  Card 2        │  │
│  │  Name: Jane    │  │
│  │  Status: ✓     │  │
│  └────────────────┘  │
│                      │
│  (Cards Default)     │
└──────────────────────┘
```

## Status Badge Integration

Status badges work across all views:

### In Grid:
```
│ Status    │
├───────────┤
│ ✓ Active  │  ← badge-success (green)
│ × Denied  │  ← badge-danger (red)
│ ⚠ Pending │  ← badge-warning (yellow)
```

### In Cards:
```
┌──────────────────────┐
│  Status: ✓ Active    │  ← Badge renders inline
└──────────────────────┘
```

### In List:
```
│  John Doe                │
│  ✓ Active • 10/1/23      │  ← Badge in secondary line
```

## Interactive Features

### Filter Badge Counter
```
[⚙ Filters]  →  [⚙ Filters ②]
    ↑                ↑
  No filters    2 active filters
```

Shows red badge with count of active filters.

### View Selection State
```
[⊞] [≡] [▢]  →  [⊞] [≡] [▢]
 ↑                     ↑
Active              Active
(blue bg)          (blue bg)
```

Currently selected view has blue background.

## CSS Class Reference

### View Selector Classes
- `.aggrid-toolbar` - Main toolbar container
- `.aggrid-view-selector` - View button group
- `.view-btn` - Individual view button
- `.view-btn.active` - Active view (blue)

### Filter Drawer Classes
- `.aggrid-filter-drawer` - Full overlay container
- `.filter-drawer-overlay` - Dark backdrop
- `.filter-drawer-content` - White slide-out panel
- `.filter-drawer-header` - Top section with title
- `.filter-drawer-body` - Scrollable filter list
- `.filter-drawer-footer` - Bottom action buttons
- `.filter-badge` - Red counter badge

### View Classes
- `.aggrid-cards-view` - Card grid container
- `.aggrid-card` - Individual card
- `.card-field` - Row in card (label + value)
- `.aggrid-list-view` - List container
- `.aggrid-list-item` - Individual list row
- `.list-item-primary` - Main text in list
- `.list-item-secondary` - Subtitle text in list

## Accessibility

- All buttons have `title` attributes for tooltips
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader friendly labels
- Clear visual focus indicators
- ARIA labels where appropriate

## Animation Details

### Drawer Slide-In
```css
@keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}
```
Duration: 0.3s ease

### Overlay Fade-In
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```
Duration: 0.3s ease

### Card Hover Effect
```css
.aggrid-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}
```
Transition: 0.2s ease

This creates a polished, professional user experience similar to modern SaaS applications.
