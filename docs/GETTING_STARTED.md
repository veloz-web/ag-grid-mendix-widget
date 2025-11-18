# Getting Started with AG Grid Widget

A visual walkthrough for setting up the AG Grid widget in your Mendix application.

## 📦 Installation

### Step 1: Download the Widget

Download the latest `.mpk` file from the [releases page](https://github.com/veloz-web/ag-grid-mendix-widget/releases) or build from source.

### Step 2: Add to Your Project

<figure>
  <img src="./docs/images/add-widget.png" alt="Adding widget to Mendix project" />
  <figcaption><strong>Copy the .mpk file to your Mendix project's widgets folder</strong></figcaption>
</figure>

1. Copy `mendix.aggrid.AGGrid.mpk` to your project's `widgets/` folder
2. In Mendix Studio Pro, press **F4** to synchronize

---

## 🎨 Basic Setup

### Step 3: Add Widget to Your Page

<figure>
  <img src="./docs/images/drag-widget.png" alt="Drag widget from toolbox" />
  <figcaption><strong>Drag the AG Grid widget from the Data Widgets section onto your page</strong></figcaption>
</figure>

1. Open your page in Studio Pro
2. Find **AG Grid** in the Toolbox (Data Widgets section)
3. Drag it onto your page

### Step 4: Configure Data Source

<figure>
  <img src="./docs/images/configure-datasource.png" alt="Configure data source" />
  <figcaption><strong>Select your entity in the Data Source tab</strong></figcaption>
</figure>

1. Select the widget
2. In **Properties** → **Data Source** tab
3. Choose your entity (Database, Microflow, or Nanoflow)

### Step 5: Add Columns

<figure>
  <img src="./docs/images/add-columns.png" alt="Add columns configuration" />
  <figcaption><strong>Configure columns to display your data</strong></figcaption>
</figure>

1. In **Properties** → **Columns** tab
2. Click **New** to add each column
3. Set **Header** (display name) and **Attribute** (field name)

---

## ⚙️ Essential Configuration

### View Modes

<figure>
  <img src="./docs/images/view-modes.png" alt="View mode selector" />
  <figcaption><strong>Users can switch between Grid, Cards, and List views</strong></figcaption>
</figure>

**Configure in Properties → View Options:**
- ✅ Enable View Selector
- Desktop Default View: **Grid**
- Mobile Default View: **Cards**

### Filtering

<figure>
  <img src="./docs/images/filter-drawer.png" alt="Filter drawer panel" />
  <figcaption><strong>Filter drawer lets users search and filter data</strong></figcaption>
</figure>

**For each column:**
1. Check **Include in Filters** to add to filter drawer
2. Check **Include in Sort Options** to allow sorting

### Styling

<figure>
  <img src="./docs/images/themes.png" alt="Available themes" />
  <figcaption><strong>Choose from 4 modern themes: Alpine, Balham, Material, or Quartz</strong></figcaption>
</figure>

**In Properties → Grid Options:**
- Theme: Choose **Material** (recommended) or other themes
- Height: Set in pixels (e.g., `600`)

---

## 🎯 Advanced Features

### Status Badges

<figure>
  <img src="./docs/images/status-badges.png" alt="Status badges in grid" />
  <figcaption><strong>Color-coded badges make status values visually clear</strong></figcaption>
</figure>

**Configure for a column:**
```json
[
  {"value": "Active", "label": "Active", "className": "badge-success"},
  {"value": "Pending", "label": "Pending", "className": "badge-warning"},
  {"value": "Inactive", "label": "Inactive", "className": "badge-secondary"}
]
```

Paste this in the column's **Status Mapping** property.

### Data Polling

<figure>
  <img src="./docs/images/polling-notification.png" alt="Polling notification banner" />
  <figcaption><strong>Automatic notification when new data is available</strong></figcaption>
</figure>

**In Properties → Grid Options:**
- ✅ Enable Data Polling
- Polling Interval: `30` seconds

Users will see a notification when data changes, with options to refresh or dismiss.

### Custom Formatters

<figure>
  <img src="./docs/images/custom-formatter.png" alt="Custom formatter configuration" />
  <figcaption><strong>Define reusable formatters with JavaScript</strong></figcaption>
</figure>

Create formatters to transform data display (currency, dates, custom logic).

See **[CUSTOM_FORMATTERS_GUIDE.md](./docs/CUSTOM_FORMATTERS_GUIDE.md)** for details.

---

## 🔐 Enterprise Features

### AG Grid Enterprise License

<figure>
  <img src="./docs/images/license-key-config.png" alt="License key configuration" />
  <figcaption><strong>Add your Enterprise license key in Grid Options</strong></figcaption>
</figure>

**To enable Enterprise features:**
1. In **Properties** → **Grid Options**
2. Paste your license key in **AG Grid License Key (Enterprise)**
3. Save and run

**Enterprise features included:**
- Advanced filtering (set filters, multi-filters)
- Server-side row model for large datasets
- Enhanced menus and column tools

See **[LICENSE_SETUP.md](./docs/LICENSE_SETUP.md)** for more details.

---

## ✅ You're Ready!

Your AG Grid widget is configured! Run your app and you'll see:

<figure>
  <img src="./docs/images/final-result.png" alt="Completed AG Grid widget" />
  <figcaption><strong>A powerful, responsive data grid with filtering, sorting, and multiple views</strong></figcaption>
</figure>

### Next Steps

- **[CONFIGURATION_EXAMPLES.md](./docs/CONFIGURATION_EXAMPLES.md)** - See real-world examples
- **[VIEW_MODES_GUIDE.md](./docs/VIEW_MODES_GUIDE.md)** - Customize card and list views
- **[POLLING_GUIDE.md](./docs/POLLING_GUIDE.md)** - Set up automatic data refresh
- **[ROADMAP.md](./ROADMAP.md)** - See planned features

### Need Help?

- **[ACTIONS_TROUBLESHOOTING.md](./docs/ACTIONS_TROUBLESHOOTING.md)** - Fix common issues
- **[SORT_FILTER_TROUBLESHOOTING.md](./docs/SORT_FILTER_TROUBLESHOOTING.md)** - Debugging guide

---

## 🎓 Pro Tips

1. **Start Simple**: Configure just data source and columns first, add features later
2. **Mobile First**: Test on mobile devices - the responsive views adapt automatically
3. **Use Themes**: Material theme works great with Mendix Atlas UI
4. **Filter Smart**: Only enable filtering on columns users actually need to filter
5. **Performance**: For large datasets (1000+ rows), enable pagination

---

*For detailed documentation on all features, see the [main README.md](../README.md)*
