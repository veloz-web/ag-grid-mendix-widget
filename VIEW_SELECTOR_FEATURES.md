# AG Grid Widget - View Selector & Filter Drawer Features

## Overview
The AG Grid widget now includes flexible view modes and an advanced filter drawer to enhance data visualization across different devices and user preferences.

## New Features

### 1. View Selector
Users can switch between three different view modes:

#### **Grid View** (Default on Desktop)
- Traditional AG Grid table layout
- Best for data-heavy applications
- Full sorting, filtering, and column management
- Ideal for desktop/laptop screens

#### **Cards View** (Default on Mobile)
- Card-based layout with responsive grid
- Shows fields configured with "Show in Card View"
- Better for mobile devices and touch interactions
- Responsive design adjusts to screen size

#### **List View**
- Compact list format
- Shows primary and secondary information
- Ideal for master-detail patterns
- Efficient for scrolling through many records

### 2. Responsive Defaults
- **Desktop (≥768px)**: Grid view by default
- **Mobile (<768px)**: Cards view by default
- Automatically switches when window is resized
- Users can manually override the view at any time

### 3. Filter Drawer
- Slide-out drawer from the right side
- Contains filterable columns (configured per column)
- Real-time filtering as you type
- Shows active filter count badge
- "Clear All Filters" button to reset
- Works across all view modes (grid, cards, list)

## Configuration

### Widget Properties

#### View Options (New Property Group)
- **Enable View Selector**: Show/hide the view selector buttons
- **Default View (Desktop)**: Choose grid, cards, or list for desktop
- **Default View (Mobile)**: Choose grid, cards, or list for mobile
- **Enable Filter Drawer**: Show/hide the filter drawer button

#### Column Configuration (Enhanced)
Each column now has additional properties:

- **Show in Card View** (default: true)
  - Include this column when displaying in card view
  - Allows you to show only relevant fields in cards

- **Include in Sort Options** (default: true)
  - Make this column available in sorting
  - Future enhancement for sort dropdown

- **Include in Filters** (default: false)
  - Make this column available in the filter drawer
  - Only filterable columns appear in the drawer
  - Provides text-based contains filtering

### Usage Example

```xml
<!-- In your Mendix project -->
<AGGrid 
    dataSource="YourDataSource"
    enableViewSelector="true"
    defaultView="grid"
    mobileDefaultView="cards"
    enableFilterDrawer="true">
    
    <columns>
        <column 
            header="Name"
            attribute="Name"
            includeInCardView="true"
            includeInSort="true"
            includeInFilters="true" />
        
        <column 
            header="Status"
            attribute="Status"
            formatter="statusBadge"
            includeInCardView="true"
            includeInFilters="true"
            statusMapping='[
                {"value":1,"label":"Active","className":"badge-success"},
                {"value":2,"label":"Inactive","className":"badge-secondary"}
            ]' />
        
        <column 
            header="Internal ID"
            attribute="InternalID"
            includeInCardView="false"
            includeInFilters="false" />
    </columns>
</AGGrid>
```

## User Interface

### Toolbar
A new toolbar appears above the data display containing:
- **View Selector**: Three icon buttons (Grid, List, Cards)
- **Filter Button**: Opens the filter drawer with active count badge

### Filter Drawer
- Slides in from the right side
- Semi-transparent overlay (click to close)
- Lists all columns with `includeInFilters=true`
- Text inputs for each filterable field
- Case-insensitive "contains" filtering
- Clear all button to reset filters

## Styling

### View Selector
- Clean icon-based buttons
- Active state highlighted in blue (#1976d2)
- Hover states for better UX
- Grouped in a pill-style container

### Filter Drawer
- 320px wide (max 90% viewport on mobile)
- Smooth slide-in animation
- Dark overlay backdrop
- White content area with sections:
  - Header with title and close button
  - Scrollable body with filter inputs
  - Footer with clear filters button

### Cards View
- Responsive grid (auto-fill, min 300px)
- Hover effects (lift and shadow)
- Field labels and values side-by-side
- Clean borders and spacing

### List View
- Full-width items
- Primary text (larger, bold)
- Secondary text (smaller, gray)
- Hover background change

## Technical Implementation

### State Management
```typescript
interface AGGridState {
    currentView: ViewMode;              // Current active view
    isFilterDrawerOpen: boolean;        // Drawer visibility
    isMobile: boolean;                  // Responsive flag
    activeFilters: Record<string, any>; // Active filter values
}
```

### Filtering Logic
- Filters are applied across all view modes
- Case-insensitive substring matching
- Multiple filters use AND logic
- Empty filters are ignored
- Filters persist when switching views

### Responsive Behavior
- Window resize listener updates mobile state
- View automatically resets to default on breakpoint change
- User selection persists within same breakpoint
- 768px breakpoint (standard tablet size)

## Benefits

1. **Mobile-First**: Better experience on phones and tablets
2. **User Choice**: Let users view data their preferred way
3. **Filtered Views**: Advanced filtering without cluttering the UI
4. **Consistent Experience**: Same data across all view modes
5. **Performance**: Efficient filtering in memory
6. **Accessibility**: Clear visual indicators and labels

## Future Enhancements

Potential additions based on the `includeInSort` property:
- Sort dropdown in toolbar
- Multi-column sorting
- Save user preferences
- Export functionality per view
- Custom card templates
- Advanced filter types (date range, numeric comparison)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for all screen sizes
- Touch-friendly on mobile devices
- Smooth animations using CSS transitions

## Performance Notes

- Filtering happens client-side for instant feedback
- Large datasets still benefit from AG Grid's virtual scrolling in grid view
- Cards/List views render all visible items (consider pagination for very large sets)
- View switching is instant with no data reload
