# Quick Start: Adding Your License Key

## ⚡ Fast Setup (2 Minutes)

### Option 1: Through Mendix Studio Pro (Recommended ✅)

1. **Add the widget to your page**
   - Drag & drop the AG Grid widget onto a page

2. **Configure the license**
   - Select the widget
   - Go to Properties panel
   - Find: **"Grid Options"** section
   - Look for: **"AG Grid License Key (Enterprise)"**
   - Paste your key: `SUA-LICENCA-AQUI`

3. **Done!** 🎉
   - Save and run your app
   - Check console for: `[AGGrid] Setting AG Grid Enterprise license key`

### Why This is Secure

✅ **Your license key is NOT:**
- Hardcoded in the widget
- Visible to other widget users
- Exposed in the browser
- Included in the widget package

✅ **Your license key IS:**
- Stored securely in your Mendix app configuration
- Only accessible to authorized users
- Configurable per Mendix app
- Protected from accidental exposure

---

## 🔍 Detailed Documentation

See [LICENSE_KEY_SETUP.md](./LICENSE_KEY_SETUP.md) for:
- Complete security analysis
- Alternative approaches (and why we don't use them)
- Troubleshooting guide
- Enterprise features overview

---

## 🆓 Using Community Edition

Don't have an Enterprise license? No problem!

- Leave the **"AG Grid License Key"** field **empty**
- The widget works perfectly with Community features:
  - ✅ Sorting
  - ✅ Filtering
  - ✅ Pagination
  - ✅ Cell rendering
  - ✅ Multiple views (Grid/Card/List)
  - ✅ Responsive design

Enterprise features like Excel export, row grouping, and pivot tables require a license.

---

## 📦 What Changed

1. **New Property**: "AG Grid License Key (Enterprise)"
   - Optional string property
   - Located in Grid Options section
   - Leave empty for Community edition

2. **New Package**: `ag-grid-enterprise`
   - Automatically installed
   - Only activated when license key is provided
   - No impact if using Community features

3. **Automatic Detection**:
   - Widget checks if license key is provided
   - Automatically enables Enterprise features
   - Falls back to Community if no key

---

## 🎯 Summary

**For you (license holder):**
- Configure your license key in widget properties in Mendix Studio Pro
- Your key stays secure within your Mendix app
- Takes 30 seconds to configure

**For widget users (without license):**
- Use the widget as-is with Community features
- No configuration needed
- No watermarks or warnings

Simple, secure, and flexible! 🚀
