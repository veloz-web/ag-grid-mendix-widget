# AG Grid Enterprise License Setup

## Quick Start

### Configure License in Studio Pro

1. Add AG Grid widget to your page
2. Select the widget → **Properties** panel
3. Under **Grid Options** section:
   - **AG Grid License Key (Enterprise)**: Paste your license key
4. Save and run

**That's it!** The widget automatically enables Enterprise features when a license key is provided.

## How It Works

The license key is configured as a **widget property** in Mendix Studio Pro. This approach:

✅ **Secure**: License stored in your Mendix app configuration (not in widget package)  
✅ **Simple**: Just paste your key in widget properties  
✅ **Flexible**: Each Mendix app can use its own license  
✅ **Optional**: Leave empty to use Community edition (free)

### Implementation

```typescript
// In AGGrid.tsx constructor
if (props.licenseKey && props.licenseKey.trim() !== '') {
    console.log('[AGGrid] Setting AG Grid Enterprise license key');
    LicenseManager.setLicenseKey(props.licenseKey);
}
```

The license is set during widget initialization and is **not exposed** in client-side code.

## Property Configuration

```
Properties Panel → Grid Options:

AG Grid License Key (Enterprise)
┌──────────────────────────────────────────────┐
│ Your-License-Key-Here                        │
└──────────────────────────────────────────────┘

Description: Your AG Grid Enterprise license key.
Leave empty for Community edition.
```

## Verification

After configuring your license, check the browser console (F12):

```
✓ [AGGrid] Setting AG Grid Enterprise license key
✓ No watermark or license warnings
```

## Using Community Edition

Don't have an Enterprise license? No problem!

- **Leave the license key field empty**
- The widget works with all Community features:
  - Sorting, filtering, pagination
  - Cell rendering and formatters
  - Multiple views (Grid/Cards/List)
  - Responsive design
  - All widget-specific features

Enterprise features (Excel export, row grouping, pivot tables, etc.) require a license from AG Grid.

## Security

### Where Your License is Stored

```
Your Mendix Application
└── [YourProject].mpr
    └── Widget Configurations
        └── AG Grid License Key ← Secure storage
```

**Security Benefits:**
- License is in your Mendix project file (not shared)
- Not included in the widget `.mpk` package
- Only accessible to users with Studio Pro access
- Not visible in browser DevTools
- Not exposed in client-side JavaScript

### Why Not Other Methods?

❌ **Hardcoded in widget**: Would expose license to anyone downloading the widget  
❌ **Environment variables**: Not applicable for browser-based Mendix widgets  
❌ **External config file**: Adds unnecessary complexity

## Troubleshooting

### License Key Not Working

1. **Check Format**: Remove any extra spaces or line breaks
2. **Check Console**: Look for `[AGGrid] Setting AG Grid Enterprise license key`
3. **Verify Key**: Ensure it's a valid AG Grid Enterprise license

### Enterprise Features Not Available

1. Verify license key is configured in widget properties
2. Check browser console for license-related errors
3. Confirm your license is active (not expired)
4. Contact AG Grid support if key is valid but not working

## For Widget Developers

### Building Without Exposing License

When building/distributing the widget:

1. **Never hardcode** the license key in source code
2. **Build the widget** without a license (current implementation)
3. **Let each user** configure their own license via widget properties
4. **Keep `.env` files** in `.gitignore` if used for local testing

### Current Implementation

```xml
<!-- In src/AGGrid.xml -->
<property key="licenseKey" type="string" required="false">
    <caption>AG Grid License Key (Enterprise)</caption>
    <description>Your AG Grid Enterprise license key. 
    Leave empty for Community edition.</description>
</property>
```

This allows each Mendix app to configure its own license securely.

## Enterprise Features

With a valid Enterprise license, you get access to:

- Advanced filtering (set filters, multi-filters)
- Excel export
- Row grouping and aggregation
- Pivot tables
- Server-side row model
- Master/detail grids
- Range selection
- Clipboard operations
- Status bar
- And more...

See [AG Grid Enterprise](https://www.ag-grid.com/license-pricing/) for complete feature list.

## Additional Resources

- [AG Grid Enterprise Pricing](https://www.ag-grid.com/license-pricing/)
- [AG Grid License Management](https://www.ag-grid.com/javascript-data-grid/licensing/)
- [Widget Documentation](./README.md)

## Summary

**License Configuration:**
- Configure via widget properties in Studio Pro
- Secure storage within your Mendix app
- Optional (Community edition works without license)

**For you (license holder):**
- 30-second setup via widget properties
- Your key stays secure within your app
- Full Enterprise features enabled

**For widget users (without license):**
- Use widget with Community features (no config needed)
- No watermarks or warnings
- Upgrade to Enterprise anytime by adding license key

---

For additional help, see the [AG Grid documentation](https://www.ag-grid.com/documentation/) or contact AG Grid support for license-related questions.
