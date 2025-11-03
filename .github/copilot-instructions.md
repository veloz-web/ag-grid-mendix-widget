# AG Grid Mendix Widget - AI Coding Agent Instructions

This is a Mendix pluggable widget that integrates AG Grid into Mendix applications with multiple view modes (grid/cards/list), custom formatters, and responsive design.

## Architecture Overview

### Core Components Structure
- **`src/AGGrid.tsx`**: Main widget class with state management, persistence, and AG Grid Enterprise license handling
- **`src/components/viewRenderer.tsx`**: View mode dispatcher (grid/cards/list/custom templates)
- **`src/components/GridView.tsx`**: AG Grid integration with column management and formatters
- **`src/components/CardView.tsx`**: Mobile-optimized card layout with responsive design
- **`src/components/FilterDrawer.tsx`**: Slide-out filter panel with "Apply Changes" pattern for staged updates
- **`src/utils/customFormatters.ts`**: Runtime JavaScript formatter compilation system

### State Management Pattern
State is managed through a combination of React state and localStorage persistence:
```typescript
// Key state shape in src/types.ts
interface AGGridState {
    currentView: ViewMode;           // Current display mode
    activeFilters: Record<string, any>;  // Applied filter values
    sortModel: Array<{colId: string; sort: "asc" | "desc"}>;  // Column sorting
    columnVisibility: Record<string, boolean>;  // Show/hide columns
    columnOrder: string[];           // Column arrangement
}
```

### Multi-View Architecture
- **Grid View**: Full AG Grid with enterprise features (sorting, filtering, column management)
- **Card View**: Mobile-first responsive cards using `includeInCardView` column flag
- **Custom Templates**: User-defined Mendix templates via `customCardTemplate`/`customListTemplate` props
- **Responsive Switching**: Automatic view changes based on `isMobile` detection

## Development Workflows

### Building & Testing
```bash
npm install                    # Install dependencies
npm run build                 # Development build
npm run release               # Production build → dist/1.0.0/mendix.aggrid.AGGrid.mpk
npm start                     # Hot reload development server
npm test                      # Unit tests
```

### Widget Deployment to Mendix
1. Build: `npm run release`
2. Copy `.mpk` from `dist/1.0.0/` to Mendix project's `widgets/` folder
3. In Studio Pro: F4 to sync, delete/re-add widget to force refresh
4. Reconfigure widget properties (configs don't persist across updates)

### AG Grid Enterprise License Setup
License is configured via widget properties and applied in constructor:
```typescript
// In AGGrid.tsx constructor
if (props.licenseKey) {
    LicenseManager.setLicenseKey(props.licenseKey);
}
```

## Critical Patterns & Conventions

### Column Configuration Schema
Columns are defined via XML properties (`src/AGGrid.xml`) with these key flags:
- `includeInCardView`: Show in mobile card layout
- `includeInFilters`: Add to filter drawer
- `includeInSortOptions`: Add to sort dropdown
- `defaultSort` + `sortIndex`: Initial sort configuration
- `formatter`: Built-in formatter type or custom formatter name

### Custom Formatter System
Formatters are compiled at runtime from JavaScript code strings:
```typescript
// Users define formatters in widget config as:
formatterType: "javascript"
formatterCode: "return value === 1 ? 'Active' : 'Inactive';"
```
Registry compiles these into functions with context `{value, item, column, config}`.

### Filter Drawer "Apply Changes" Pattern
Filters use staged updates to prevent excessive API calls:
1. User makes filter selections in drawer
2. Selections stored in temporary state 
3. "Apply" button commits to `activeFilters` state
4. Grid refilters only on apply, not on each selection

### Responsive Behavior
Mobile detection triggers view and behavior changes:
```typescript
// Automatic view switching
const initialView = isMobile ? props.mobileDefaultView : props.defaultView;
// Touch-optimized interactions in mobile mode
```

### State Persistence
Widget state persists to localStorage with key pattern `aggrid:${widgetName}`:
```typescript
// Persisted state includes view mode, filters, sort, column config
// Loaded in constructor, saved on state changes
// Controlled by `useLocalStorage` prop
```

## Integration Points

### Mendix Data Integration
- **Data Source**: Mendix `datasource` prop provides entity list
- **Attributes**: Column `attribute` prop maps to entity attributes
- **Actions**: `onRowClicked` triggers Mendix microflows/nanoflows
- **Context**: Widget receives Mendix context for entity operations

### AG Grid Module Registration
Selective module registration in `src/agGridModules.ts` for optimal bundle size:
```typescript
// Only register needed AG Grid modules
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SetFilterModule,
    // ... other required modules
]);
```

### File Extensions & Build System
- Uses Mendix pluggable widgets tools (`@mendix/pluggable-widgets-tools`)
- TypeScript files use `.tsx/.ts` extensions (React components)
- Utility files can use `.js/.ts` extensions (see existing utils)
- XML widget definition in `src/AGGrid.xml` drives Studio Pro property UI

### Theme Integration
Theme switching via CSS class application:
```typescript
// src/utils/theme.ts maps theme names to AG Grid CSS classes
const themeClassName = getThemeClassName(props.theme); // "ag-theme-alpine", etc.
```

## Common Development Tasks

### Adding New View Modes
1. Add to `ViewMode` type in `src/types.ts`
2. Extend `ViewRenderer` in `src/components/viewRenderer.tsx`
3. Create new view component following `GridView.tsx` patterns
4. Update mobile responsiveness logic

### Adding Built-in Formatters
1. Extend formatter switch in `src/utils/formatters.ts`
2. Add new enum value to XML column `formatter` property
3. Test with various data types and edge cases

### Debugging Filter Issues
Check these in sequence:
1. Column has `includeInFilters="true"` in XML config
2. `getFilterableColumns()` includes the column
3. Filter drawer renders the column filter
4. Apply button commits to `activeFilters` state
5. Grid filtering logic processes the filter correctly

### Performance Optimization
- Minimize AG Grid module imports in `agGridModules.ts`
- Use `shouldComponentUpdate` patterns for expensive renders
- Implement row virtualization for large datasets
- Cache formatter functions in `CustomFormatterRegistry`