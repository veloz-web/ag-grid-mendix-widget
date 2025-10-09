# 🔐 How to Configure Your License Key (Visual Guide)

## Step-by-Step with Screenshots

### Step 1: Add Widget to Your Page

```
In Mendix Studio Pro:
1. Open your page
2. Drag "AG Grid" widget from Toolbox
3. Place it on your page
```

### Step 2: Open Widget Properties

```
1. Click on the AG Grid widget
2. Properties panel opens on the right →
```

### Step 3: Find the License Key Property

```
Properties Panel:
├── Data Source
│   └── [Configure your data...]
│
├── Columns
│   └── [Configure columns...]
│
├── View Options
│   └── [Views configuration...]
│
└── Grid Options  ← LOOK HERE!
    ├── AG Grid License Key (Enterprise)  ← THIS ONE!
    │   [____________________________]  ← PASTE YOUR KEY HERE
    │
    ├── Enable Pagination
    ├── Page Size: 20
    ├── Height: 500
    └── Theme: Material
```

### Step 4: Paste Your License Key

```
AG Grid License Key (Enterprise)
┌──────────────────────────────────────────────────┐
│ SUA-LICENCA-AQUI                                 │
└──────────────────────────────────────────────────┘

Description:
Your AG Grid Enterprise license key. Leave empty for
Community edition. This is kept secure within your
Mendix app.
```

### Step 5: Save and Run

```
1. Save your page (Ctrl+S)
2. Run your app (F5)
3. Check browser console for:
   [AGGrid] Setting AG Grid Enterprise license key ✓
```

---

## 🎯 Visual Property Location

```
┌─ Mendix Studio Pro ─────────────────────────────────────────┐
│                                                              │
│ [File] [Edit] [View] [Project] [Run]                        │
│                                                              │
│ ┌─ Toolbox ──┐  ┌─ Your Page ────────┐  ┌─ Properties ──┐ │
│ │            │  │                     │  │                │ │
│ │ Widgets    │  │  ┌───────────────┐ │  │ Grid Options   │ │
│ │ ├─ Data    │  │  │               │ │  │                │ │
│ │ │  └─ AG Grid  │ │  │   AG Grid     │ │  │ ┌────────────┐ │ │
│ │ │           │  │  │               │ │  │ │License Key │ │ │
│ │ ├─ Input   │  │  │   [Data...]   │ │  │ │[YOUR KEY] │ │ │
│ │ └─ Display │  │  │               │ │  │ └────────────┘ │ │
│ │            │  │  └───────────────┘ │  │                │ │
│ └────────────┘  └─────────────────────┘  │ ☑ Pagination   │ │
│                                           │ Page Size: 20  │ │
│                                           └────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Indicators

After configuring your license, you should see:

### In Browser Console (F12)
```
✓ [AGGrid] Setting AG Grid Enterprise license key
✓ AG Grid initialized
✗ NO watermarks or license warnings
```

### In the Grid
```
✓ Full Enterprise features available
✓ No "AG Grid Enterprise" watermark
✓ All advanced features enabled
```

---

## ❌ Common Mistakes to Avoid

### ❌ Don't Leave Spaces
```
Wrong: "  SUA-LICENCA-AQUI  "
Right: "SUA-LICENCA-AQUI"
```

### ❌ Don't Split Across Lines
```
Wrong:
SUA-LICENCA
-AQUI

Right:
SUA-LICENCA-AQUI
```

### ❌ Don't Add Quotes
```
Wrong: "SUA-LICENCA-AQUI"
Right: SUA-LICENCA-AQUI
```

---

## 🔍 Where Your License is Stored

```
Your Mendix Application
├── modules/
├── widgets/
│   └── AGGrid.mpk  ← Widget (no license inside!)
├── userlib/
└── [Your Project].mpr  ← License stored HERE (secure!)
    └── Page Configurations
        └── AG Grid Widget Properties
            └── licenseKey: "SUA-LICENCA-AQUI"  ← Secure storage
```

**Why This is Secure:**
- ✅ License is in `.mpr` file (not shared)
- ✅ Only accessible to authorized users
- ✅ Not in the widget package
- ✅ Not visible to other developers
- ✅ Protected by Mendix Studio Pro access control

---

## 🆓 Using Without License (Community Edition)

If you don't have an Enterprise license:

```
AG Grid License Key (Enterprise)
┌──────────────────────────────────────────────────┐
│ [Leave this empty]                               │
└──────────────────────────────────────────────────┘

✓ Widget works perfectly with Community features
✓ No watermarks or warnings
✓ All basic features available
```

---

## 📋 Quick Reference Card

| What | Where | Value |
|------|-------|-------|
| **Widget** | Toolbox → Data Widgets | AG Grid |
| **Property** | Properties → Grid Options | AG Grid License Key |
| **Your Key** | Text field | `SUA-LICENCA-AQUI` |
| **Verification** | Browser Console (F12) | Look for license message |
| **Storage** | Mendix .mpr file | Secure, not shared |

---

## 🚀 Quick Start Commands

```bash
# 1. Build the widget (if not already done)
npm run build

# 2. Widget location
dist/1.0.0/mendix.aggrid.AGGrid.mpk

# 3. Copy to your Mendix project
cp dist/1.0.0/mendix.aggrid.AGGrid.mpk /path/to/your/mendix/project/widgets/
```

Then in Mendix Studio Pro:
1. Restart Studio Pro
2. Add widget to page
3. Configure license in properties
4. Run and verify ✓

---

## 🎉 That's It!

Your license key configuration is:
- ✅ **Secure** - Not exposed to anyone
- ✅ **Simple** - Just paste in properties
- ✅ **Flexible** - Per-app configuration
- ✅ **Professional** - Industry best practice

Need help? Check [LICENSE_KEY_SETUP.md](./LICENSE_KEY_SETUP.md) for detailed information.
