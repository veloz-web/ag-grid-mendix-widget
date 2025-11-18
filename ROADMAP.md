# AG Grid Widget Roadmap

This document outlines planned features and enhancements for the AG Grid Mendix Widget.

## 📦 Current Enterprise Features

**Good news!** The widget already includes AG Grid Enterprise modules. You just need to configure your license key to unlock:
- Advanced filtering (set filters, multi-filters, text/number/date filters)
- Server-side row model for large datasets
- Columns tool panel
- Enhanced menus

See [LICENSE_SETUP.md](./docs/LICENSE_SETUP.md) for configuration.

## 🎯 Planned Features

### Data Export
**Priority: High**

- [x] **CSV Export** ✅ **Implemented!**
  - Export current grid data to CSV file
  - Respects current filters and sorting
  - Include/exclude columns via configuration
  - Custom filename support
  - Enable via widget properties: `enableCsvExport`

- [x] **Excel Export** ✅ **Implemented!** (Enterprise Only)
  - Export to .xlsx format with AG Grid Enterprise
  - Respects current filters and sorting
  - Include/exclude columns via configuration
  - Custom filename support
  - Enable via widget properties: `enableExcelExport`
  - Requires valid AG Grid Enterprise license

- [x] **PDF Export** ✅ **Implemented!**
  - Export grid data to PDF using pdfMake
  - Respects current filters and sorting
  - Custom filename support
  - Configurable page orientation (portrait/landscape)
  - Optional document title
  - Styled table with alternating row colors
  - Automatic page numbers and timestamp
  - Enable via widget properties: `enablePdfExport`

### Row Grouping
**Priority: High**

- [ ] **Single Column Grouping**
  - Group rows by any column
  - Expand/collapse groups
  - Aggregate functions (sum, count, avg)
  - Custom group cell rendering

- [ ] **Multi-Column Grouping** (Enterprise Only)
  - Group by multiple columns
  - Hierarchical grouping
  - Drag columns to group
  - Group by date ranges (day, month, year)

- [ ] **Pivot Mode** (Enterprise Only)
  - Pivot table functionality
  - Dynamic column generation
  - Aggregation support

### Advanced Filtering
**Priority: Medium**

**Note**: Set filters, multi-filters, and text/number/date filters are already available via Enterprise modules!

- [ ] **Enhanced Filter Drawer**
  - Expose AG Grid's native filter UI in drawer
  - Date range presets (Today, This Week, etc.)
  - Numeric range sliders
  - Search within filter options

- [ ] **Filter Presets**
  - Save filter combinations
  - Quick filter buttons
  - User-defined filter templates

### Column Management
**Priority: Medium**

**Note**: Column visibility is already implemented via ColumnVisibilityPopover!

- [ ] **Column Resizing**
  - Enable drag to resize columns
  - Double-click to auto-size
  - Save column widths to localStorage

- [ ] **Column Reordering**
  - Drag and drop column order
  - Persist custom order
  - Reset to default order

- [ ] **Column Pinning** (Enterprise)
  - Pin columns to left or right
  - Configurable via widget properties
  - Persist pinned state

- [ ] **Column Groups**
  - Group related columns under headers
  - Expand/collapse column groups
  - Multi-level grouping

- [ ] **Auto-Size Columns**
  - Fit columns to content
  - Fit to grid width
  - Smart column sizing

### Selection & Actions
**Priority: Medium**

- [ ] **Row Selection**
  - Single row selection (checkbox)
  - Multi-row selection (checkboxes)
  - Select all functionality
  - Pass selected rows to microflow

- [ ] **Range Selection** (Enterprise Only)
  - Excel-like cell selection
  - Copy/paste support
  - Keyboard navigation

- [ ] **Bulk Actions**
  - Actions on multiple selected rows
  - Delete selected
  - Export selected
  - Custom bulk actions via microflow

### Inline Editing
**Priority: Low**

- [ ] **Cell Editing**
  - Click to edit cells
  - Different editors per column type
  - Validation support
  - Save changes to Mendix

- [ ] **Row Editing**
  - Edit entire row at once
  - Save/cancel buttons
  - Validation before save

### Performance & Data
**Priority: Medium**

- [ ] **Virtual Scrolling Improvements**
  - Better performance for 10,000+ rows
  - Dynamic row height
  - Smooth scrolling

- [ ] **Server-Side Row Model** (Enterprise Only)
  - Lazy loading from Mendix datasource
  - Server-side filtering and sorting
  - Pagination on server
  - Handle millions of rows

- [ ] **Infinite Scroll**
  - Load more rows as user scrolls
  - Better than pagination for mobile
  - Configurable batch size

### UI/UX Enhancements
**Priority: Low**

- [ ] **Custom Cell Renderers**
  - Image cells
  - Progress bars
  - Sparklines
  - Custom HTML templates

- [ ] **Master/Detail** (Enterprise Only)
  - Expandable rows showing detail grid
  - Nested data relationships
  - Custom detail templates

- [ ] **Status Bar** (Enterprise Only)
  - Show aggregations at bottom
  - Custom status components
  - Selected row count

- [ ] **Context Menu**
  - Right-click actions on rows/cells
  - Copy/paste
  - Export selected
  - Custom menu items

### Mobile Enhancements
**Priority: Medium**

- [ ] **Touch Gestures**
  - Swipe to delete
  - Pull to refresh
  - Long-press for actions

- [ ] **Offline Support**
  - Cache data locally
  - Sync when connection restored
  - Offline indicators

### Accessibility
**Priority: High**

- [x] Keyboard navigation (✅ Implemented)
- [ ] Screen reader improvements
- [ ] ARIA labels and roles
- [ ] High contrast mode support
- [ ] Focus indicators enhancement

### Developer Experience
**Priority: Medium**

- [ ] **TypeScript Definitions**
  - Better type safety
  - IntelliSense support
  - Generated from widget XML

- [ ] **Storybook Integration**
  - Component documentation
  - Interactive examples
  - Visual testing

- [ ] **Unit Test Coverage**
  - Increase to 80%+
  - Integration tests
  - E2E tests with Playwright

## 🔄 Under Consideration

These features are being evaluated but not yet committed:

- **Charting Integration**: Add charts based on grid data
- **Themes**: More theme options (dark mode, custom branding)
- **Localization**: Multi-language support for UI elements
- **Collaboration**: Real-time updates from other users
- **Comments/Notes**: Add notes to specific rows/cells
- **Audit Trail**: Track changes to data
- **Print Layout**: Optimized printing of grid data

## ✅ Currently Available

### AG Grid Enterprise Features (License Required)
The widget already includes these Enterprise modules:
- ✅ **Set Filters**: Advanced filtering with checkboxes for unique values
- ✅ **Multi-Filters**: Combine multiple filter conditions
- ✅ **Text/Number/Date Filters**: Specialized filters per data type
- ✅ **Server-Side Row Model**: For handling large datasets server-side
- ✅ **Columns Tool Panel**: Show/hide columns via panel
- ✅ **Menu Module**: Context menus on columns

### Widget Features
- ✅ **Data Polling**: Auto-detect new data with notification banner
- ✅ **Multiple View Modes**: Grid, Cards, List views
- ✅ **Custom Formatters**: JavaScript-based formatters in config
- ✅ **Filter Drawer**: Slide-out filter panel with staged updates
- ✅ **Custom Templates**: User-defined card/list templates
- ✅ **Status Badges**: JSON-configured status mapping
- ✅ **Console Log Stripping**: Automatic removal in production builds
- ✅ **Enterprise License Support**: Configure license via widget properties
- ✅ **Responsive Design**: Mobile-optimized views
- ✅ **Keyboard Accessibility**: Full keyboard navigation
- ✅ **Column Visibility**: Show/hide columns dynamically
- ✅ **Pagination**: Client-side pagination support

## 📝 How to Request Features

1. **Check this roadmap** to see if feature is already planned
2. **Open a GitHub issue** with:
   - Feature description
   - Use case / why it's needed
   - Example of how it would work
   - Any AG Grid documentation links
3. **Vote on existing issues** to show demand
4. **Contribute!** Pull requests welcome

## 🎁 Enterprise Features

Features marked "(Enterprise Only)" require an AG Grid Enterprise license. See [LICENSE_SETUP.md](./docs/LICENSE_SETUP.md) for configuration.

## 🚀 Release Timeline

We follow semantic versioning (MAJOR.MINOR.PATCH):

- **Minor releases** (new features): Every 2-3 months
- **Patch releases** (bug fixes): As needed
- **Major releases** (breaking changes): Annually

Current version: **1.0.0**

## 💬 Feedback

Have ideas or suggestions? We'd love to hear them!

- Open an issue on GitHub
- Discuss in the Mendix Community
- Contribute code via pull requests

---

*Last updated: November 2025*
