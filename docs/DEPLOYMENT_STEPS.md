# Deploying Widget Updates with New Properties

When you add new properties to a Mendix widget, Studio Pro doesn't always pick them up automatically. Here's the correct procedure:

## Why "Update All Widgets" Doesn't Always Work

Mendix caches widget definitions, and sometimes the cache doesn't refresh properly when properties are added. This is especially common when:
- Adding new enumeration properties
- Adding new property groups
- Changing property types

## Correct Deployment Steps

### Step 1: Build the Widget
```bash
cd /home/anthonyd/Git/ag-grid-mendix-widget
npm run release
```

### Step 2: Copy to Your Project
Copy the built widget from:
```
dist/1.0.0/mendix.AGGrid.mpk
```

To your Mendix project's widgets folder:
```
YourProject/widgets/mendix.AGGrid.mpk
```

### Step 3: Force Refresh in Studio Pro

**Option A: Complete Removal (Recommended)**
1. Open your Mendix project in Studio Pro
2. Find a page that uses the AG Grid widget
3. **Delete the widget instance** from the page
4. Press **F4** (or go to Project → Synchronize Project Directory)
5. Wait for Studio Pro to finish synchronizing
6. Add the widget back to the page
7. Configure it with your settings

**Option B: Clean Widgets Folder**
1. Close Studio Pro completely
2. Delete the `deployment/widgets` folder in your project
3. Reopen Studio Pro
4. Press F4 to synchronize
5. The widget will be redeployed with fresh metadata

**Option C: Clean Deployment**
1. In Studio Pro, go to **Project → Clean Deployment Directory**
2. Press **F4** to synchronize
3. Run your project

### Step 4: Verify the New Properties

After re-adding the widget, edit it and check the **Columns** configuration. You should now see:

Under each column:
- ✅ **Width Type** dropdown (Fixed/Flexible/Auto)
- ✅ **Fixed Width (px)** - only used when type is "Fixed"
- ✅ **Flex Value** - only used when type is "Flexible"  
- ✅ **Minimum Width (px)** - for flexible/auto columns
- ✅ **Maximum Width (px)** - optional limit for flexible/auto columns

## Troubleshooting

### Issue: Properties Still Not Showing

**Solution 1: Clear Studio Pro Cache**
1. Close Studio Pro
2. Delete `%LOCALAPPDATA%\Mendix\` cache folders (Windows)
3. Or `~/.mendix/` folders (Mac/Linux)
4. Reopen Studio Pro

**Solution 2: Version Bump**
If you're repeatedly updating the widget during development:
1. Change the version in `package.json` (e.g., 1.0.0 → 1.0.1)
2. Run `npm run release`
3. The MPK filename will change to `mendix.AGGrid.1.0.1.mpk`
4. Studio Pro will treat it as a completely new widget

**Solution 3: Check Widget Files**
Verify the widget was built correctly:
```bash
# Check the timestamp (should be recent)
ls -lh dist/1.0.0/mendix.AGGrid.mpk

# MPK is a ZIP file - you can extract it to verify contents
# Look for AGGrid.xml inside the package
```

### Issue: Widget Works But Columns Look Wrong

This happens when existing widget instances have old property values. 

**Solution:**
The `widthType` defaults to "fixed" for backward compatibility, so existing columns should work. But to use the new features:
1. Edit each column in the widget configuration
2. Change **Width Type** from "Fixed" to "Flexible" or "Auto"
3. Set the appropriate values (flex ratio, min/max widths)

### Issue: Error After Deploying Widget

Check the browser console for errors. Common issues:
- TypeScript types not regenerated → Run `npm run release` again
- Code still references old property names → Check GridView.tsx

## Best Practices for Widget Development

1. **Always bump version for major changes** - Makes it easier to track what's deployed
2. **Test in a clean project first** - Create a new Mendix project to test widget updates
3. **Keep old properties** - Don't remove properties; add new ones and deprecate old ones
4. **Use defaultValue** - Always set sensible defaults for new properties
5. **Document breaking changes** - Note if users need to reconfigure existing widgets

## Quick Reference

| Action | Command |
|--------|---------|
| Build widget | `npm run release` |
| Widget location | `dist/1.0.0/mendix.AGGrid.mpk` |
| Refresh Studio Pro | Press **F4** |
| Clean deployment | Project → Clean Deployment Directory |
| Check widget in project | `YourProject/widgets/` folder |

## Current Widget Configuration

The AG Grid widget should now show these width properties for each column:

```
Column Configuration
├── Header ─────────────────── [text]
├── Attribute ──────────────── [dropdown]
├── Width Type ─────────────── [dropdown: Fixed/Flexible/Auto]
├── Fixed Width (px) ───────── [integer: 150]
├── Flex Value ─────────────── [integer: 1]
├── Minimum Width (px) ─────── [integer: 50]
├── Maximum Width (px) ─────── [integer: optional]
├── Sortable ───────────────── [checkbox]
├── Filter ─────────────────── [checkbox]
└── ... (other properties)
```

If you don't see the **Width Type** dropdown after following these steps, there may be an issue with how Studio Pro cached the widget definition. In that case, the "Complete Removal" method (Option A) is the most reliable solution.
