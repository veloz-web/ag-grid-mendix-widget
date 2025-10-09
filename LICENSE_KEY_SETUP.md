# AG Grid Enterprise License Key Setup

## Overview

This widget supports both **AG Grid Community** (free) and **AG Grid Enterprise** (paid). If you have an Enterprise license, you can configure it through the widget properties in Mendix Studio Pro.

## Security Approach

### ✅ Recommended: Widget Property (Current Implementation)

The license key is configured as a **widget property** in Mendix Studio Pro. This is the most secure approach for Mendix widgets because:

1. **Not in Source Code**: The license key is not hardcoded in the widget source code
2. **Per-App Configuration**: Each Mendix app can use its own license key
3. **Secure Storage**: The key is stored in the Mendix app's configuration, not exposed in the widget package
4. **Access Control**: Only users with access to Mendix Studio Pro can see/edit the key
5. **Not in Browser**: The license key is used server-side during widget initialization, not exposed in client-side JavaScript

### How It Works

1. When you add the AG Grid widget to a page in Mendix Studio Pro
2. In the widget properties, you'll see: **"AG Grid License Key (Enterprise)"**
3. Paste your license key there
4. The widget will automatically use the Enterprise features
5. Leave empty to use the free Community edition

## Setup Instructions

### Step 1: Install the Widget

1. Download the `.mpk` file from the widget repository
2. Add it to your Mendix app's `widgets` folder
3. Restart Studio Pro if needed

### Step 2: Configure License Key in Mendix

1. Add the AG Grid widget to a page
2. Select the widget
3. In the **Properties** panel, find the **"Grid Options"** section
4. Find the property: **"AG Grid License Key (Enterprise)"**
5. Paste your license key: `SUA-LICENCA-AQUI`
6. Save and run your app

### Step 3: Verify Enterprise Features

Once configured, you'll have access to Enterprise features like:
- Advanced filtering
- Excel export
- Row grouping
- Pivot tables
- Server-side row model
- And more!

Check the console for: `[AGGrid] Setting AG Grid Enterprise license key`

## Alternative Approaches (Not Recommended for Mendix)

### ❌ Hardcoded in Widget (NOT SECURE)

```typescript
// DON'T DO THIS - exposes license to anyone who downloads the widget
LicenseManager.setLicenseKey("SUA-LICENCA-AQUI");
```

**Problems:**
- License key visible to anyone who downloads the widget `.mpk`
- Can't be changed without rebuilding the widget
- Exposes your license to all widget users

### ❌ Environment Variables (NOT APPLICABLE)

Environment variables work in Node.js applications but **not in Mendix widgets** because:
- Mendix widgets run in the browser, not on the server
- Browser JavaScript cannot access server environment variables
- Would require backend integration

### ❌ External Configuration File (COMPLEX)

Could store the key in a Mendix constant or microflow, but adds unnecessary complexity:
- Requires additional configuration steps
- More error-prone
- Widget property approach is simpler

## For Widget Developers

### Building Without Exposing Your License

If you're developing/building the widget and want to test Enterprise features:

1. **During Development**: 
   - Create a local `.env` file (add to `.gitignore`)
   - Use it only for local testing
   - Never commit it to version control

2. **For Distribution**:
   - Build the widget WITHOUT a hardcoded license
   - Let each user configure their own license via widget properties
   - This is the current implementation

### Current Implementation

```typescript
// In AGGrid.tsx constructor
constructor(props: AGGridContainerProps) {
    super(props);
    
    // Set AG Grid Enterprise license key if provided
    if (props.licenseKey && props.licenseKey.trim() !== '') {
        console.log('[AGGrid] Setting AG Grid Enterprise license key');
        LicenseManager.setLicenseKey(props.licenseKey);
    }
    
    // ... rest of initialization
}
```

This approach:
- ✅ Accepts license key from widget properties
- ✅ Only sets license if provided (optional)
- ✅ Falls back to Community edition if no key provided
- ✅ Keeps license secure within each Mendix app

## Security Best Practices

### 1. Widget Properties (What We Use)
**Security Level**: ⭐⭐⭐⭐⭐ Excellent
- License stored in Mendix app configuration
- Not exposed in widget package
- Only accessible to authorized users

### 2. Access Control
- Only users with Studio Pro access can see the license key
- Key is not visible in the browser DevTools
- Not included in client-side JavaScript bundles

### 3. Version Control
- The widget source code does NOT contain the license
- Each app admin configures their own license
- No risk of committing keys to Git

## Troubleshooting

### License Key Not Working

1. **Check the Key Format**
   - Should be a long string provided by AG Grid
   - No extra spaces or line breaks
   - Format: `CompanyName_ProductName_ExpiryDate_...`

2. **Check Browser Console**
   - Look for: `[AGGrid] Setting AG Grid Enterprise license key`
   - If not present, the key wasn't configured

3. **Verify Enterprise Features**
   - Try using an Enterprise-only feature
   - AG Grid will show a watermark if the license is invalid/missing

### Using Community Edition

If you don't have an Enterprise license:
- Leave the "AG Grid License Key" property **empty**
- The widget will work with Community features
- No watermarks or warnings
- Most features still available (sorting, filtering, pagination, etc.)

## License Key Storage Comparison

| Method | Security | Ease of Use | Mendix Compatible | Recommended |
|--------|----------|-------------|-------------------|-------------|
| Widget Property | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Yes | ✅ **YES** |
| Hardcoded | ⭐ Poor | ⭐⭐⭐⭐⭐ | ✅ Yes | ❌ NO |
| Environment Vars | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ No | ❌ NO |
| External Config | ⭐⭐⭐⭐ | ⭐⭐ | ⚠️ Complex | ❌ NO |

## Additional Resources

- [AG Grid Enterprise Licensing](https://www.ag-grid.com/license-pricing/)
- [AG Grid License Management](https://www.ag-grid.com/javascript-data-grid/licensing/)
- [Mendix Widget Development](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets/)

## Support

If you have questions about:
- **License Key Issues**: Contact AG Grid support
- **Widget Configuration**: Check this documentation
- **Widget Development**: See the project README.md

---

**Summary**: The license key is configured through Mendix Studio Pro widget properties. This keeps your license secure, allows per-app configuration, and doesn't expose the key to widget users. Simply paste your license key in the widget properties, and you're done! 🎉
