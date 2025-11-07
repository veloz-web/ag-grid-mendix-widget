# AG Grid Polling - Debugging Guide

## 🔍 Debug Logging Added

I've added comprehensive console logging to help you debug the polling feature. All logs are prefixed with `[AGGrid Polling]` or `[AGGrid]`.

## 📋 Debugging Checklist

### Step 1: Check Widget Configuration
Open Mendix Studio Pro and verify:

```
Widget Properties → Grid Options:
✓ Enable Data Polling: TRUE (checked)
✓ Polling Interval: 30 (or any value, minimum 10)
```

### Step 2: Open Browser Console
1. Open your Mendix app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Filter for "AGGrid" to see only relevant logs

### Step 3: Check Initial Logs

You should see these logs on page load:

```javascript
[AGGrid] Component mounted {enablePolling: true, pollingInterval: 30}
[AGGrid Polling] ✓ Starting polling {intervalSeconds: 30, intervalMs: 30000, ...}
[AGGrid Polling] Check triggered {enablePolling: true, hasGridApi: false, ...}
[AGGrid Polling] Initialized baseline count: 5  // Your current record count
```

**🚨 CRITICAL:** If you see `enablePolling: false`, polling is disabled in widget config!

### Step 4: Wait for Polling Intervals

Every N seconds (your configured interval), you should see:

```javascript
[AGGrid Polling] Check triggered {...}
[AGGrid Polling] Data check {currentCount: 5, lastKnownCount: 5, ...}
[AGGrid Polling] No change detected
```

### Step 5: Add a Record (from another session/user)

After adding a record, within your polling interval you should see:

```javascript
[AGGrid Polling] Check triggered {...}
[AGGrid Polling] Data check {currentCount: 6, lastKnownCount: 5, ...}
[AGGrid Polling] 🔔 CHANGE DETECTED! {oldCount: 5, newCount: 6, difference: 1}
```

**If you see this, the banner SHOULD appear!**

### Step 6: Verify Banner Appears

Look at the top of the grid for the purple gradient banner.

## 🐛 Common Issues & Solutions

### Issue 1: "enablePolling: false" in logs

**Problem:** Polling not enabled in widget configuration  
**Solution:** 
1. In Studio Pro, select the AGGrid widget
2. Find "Grid Options" section
3. Check "Enable Data Polling"
4. Save and redeploy

### Issue 2: "Polling disabled in props" log appears

**Problem:** Same as above - widget config not saved properly  
**Solution:**
1. Delete the widget from the page
2. Re-add it from toolbox
3. Reconfigure all settings (configs don't persist on widget update)
4. Make sure to check "Enable Data Polling"

### Issue 3: Logs show polling but "No change detected"

**Problem:** Mendix datasource not refreshing automatically  
**Solution:** Mendix datasources don't auto-refresh by default!

You need to configure the datasource to refresh:

#### Option A: Use Database Source (Recommended)
```
Widget Properties → Data Source:
- Type: Database
- Entity: YourEntity
- This will auto-refresh when Mendix commits new objects
```

#### Option B: Use Microflow with Refresh
```
Widget Properties → Data Source:
- Type: Microflow
- Microflow: YourMicroflow (must be configured to retrieve latest data)
- ⚠️ Microflow data sources may cache results
```

#### Option C: Add Manual Refresh
Add a Refresh button on the page:
```
1. Add a Microflow button
2. Microflow: Refresh the entity list
3. Button triggers datasource refresh
```

### Issue 4: "hasNewData: true" in logs but no banner

**Problem:** CSS not loading or banner hidden by other elements  
**Solution:**
1. Check browser DevTools → Elements
2. Search for `aggrid-refresh-banner`
3. If found: Check CSS styles (might be `display: none`)
4. If not found: React state not updating properly

**Quick Fix:**
```javascript
// In browser console, force show banner:
document.querySelector('.aggrid-refresh-banner').style.display = 'block';
```

### Issue 5: Banner appears immediately on page load

**Problem:** `lastKnownDataCount` starts at 0, first data load triggers notification  
**Solution:** This is actually expected behavior on first load. The banner will only show if:
- Initial count was 5
- You reload the page (resets to 0)
- Datasource loads 5 records → triggers notification

**Fix:** Clear localStorage to reset:
```javascript
// In browser console:
localStorage.clear();
// Refresh page
```

### Issue 6: Polling stops after showing notification

**Problem:** This is BY DESIGN! Polling pauses when notification is shown  
**Expected Behavior:**
1. Notification appears → Polling pauses
2. User clicks "Refresh" or "Dismiss" → Polling resumes

**Verify in logs:**
```javascript
[AGGrid Polling] Skipping - notification already shown
// This is CORRECT - polling is paused
```

### Issue 7: Datasource updated but no check triggered

**Problem:** Mendix updated datasource but componentDidUpdate not detecting it  
**Check Logs:**
```javascript
[AGGrid] Datasource updated by Mendix {oldStatus: ..., newStatus: ..., ...}
```

If you DON'T see this log when adding records, Mendix isn't refreshing the datasource.

**Solution:** Check your page's datasource refresh settings:
```
Page Properties → Data Source:
- Auto-refresh: Yes
- Refresh interval: 10 seconds (optional)
```

## 🔬 Advanced Debugging

### Check State in React DevTools
1. Install React Developer Tools (browser extension)
2. Open DevTools → React tab
3. Find `AGGrid` component
4. Check state:
   - `hasNewData` - should be `true` when notification shown
   - `newRecordCount` - number of changed records
   - `pendingData` - array of new data

### Manually Trigger Check
In browser console:
```javascript
// Find the component instance (hacky but works for debugging)
const widget = document.querySelector('.aggrid-container').__reactFiber$...
// Then manually call checkForNewData
```

### Force Show Banner
```javascript
// In browser console:
const banner = `
<div class="aggrid-refresh-banner" style="display: block;">
    <div class="aggrid-refresh-banner-content">
        <i class="glyphicon glyphicon-info-sign"></i>
        <span>TEST: 5 new records available</span>
        <button class="btn btn-primary btn-sm">Refresh Now</button>
        <button class="btn btn-default btn-sm">Dismiss</button>
    </div>
</div>`;
document.querySelector('.aggrid-container').insertAdjacentHTML('afterbegin', banner);
```

## 📊 Expected Log Flow

### Normal Operation:
```
1. [AGGrid] Component mounted
2. [AGGrid Polling] ✓ Starting polling
3. [AGGrid Polling] Check triggered
4. [AGGrid Polling] Initialized baseline count: X
5. ... wait 30 seconds ...
6. [AGGrid Polling] Check triggered
7. [AGGrid Polling] No change detected
8. ... repeat every 30 seconds ...
```

### When New Data Added:
```
9. [AGGrid Polling] Check triggered
10. [AGGrid Polling] 🔔 CHANGE DETECTED!
11. [AGGrid Polling] Skipping - notification already shown (on subsequent checks)
12. ... user clicks "Refresh" ...
13. [AGGrid Polling] Refresh clicked
14. [AGGrid Polling] ✓ Data refreshed, polling will resume
15. [AGGrid Polling] Check triggered (polling resumed)
```

## 🎯 Quick Diagnosis

Run this in browser console after page loads:

```javascript
// Check if polling is active
console.log('Polling enabled:', 
  document.querySelector('.aggrid-container')?.__reactFiber$?.memoizedProps?.enablePolling
);

// Check current data count
console.log('Current records:', 
  document.querySelectorAll('.ag-row').length
);

// Check if banner exists
console.log('Banner exists:', 
  !!document.querySelector('.aggrid-refresh-banner')
);

// Check localStorage
console.log('Stored state:', 
  JSON.parse(localStorage.getItem('aggrid:default') || '{}')
);
```

## 🚀 Quick Test

1. **Deploy widget** with latest build
2. **Open browser console** (F12)
3. **Filter logs** for "AGGrid"
4. **Wait 30 seconds** - you should see polling logs
5. **Add a record** from another session/browser
6. **Wait 30 seconds** - you should see "CHANGE DETECTED"
7. **Check for banner** at top of grid

## 💡 Pro Tips

1. **Use shorter intervals for testing**: Set polling to 10 seconds during debugging
2. **Use database datasource**: Ensures Mendix auto-updates the data
3. **Clear localStorage**: If you see weird behavior, clear it and refresh
4. **Check network tab**: See if Mendix is making API calls to fetch new data
5. **Test in incognito**: Eliminates cache/localStorage issues

## 📞 Still Not Working?

Share these logs from console:
1. First 10 lines after page load
2. Logs from a full polling cycle (30 seconds)
3. Logs after adding a new record
4. Screenshot of widget configuration in Studio Pro
5. Your datasource type (Database/Microflow/Nanoflow/XPath)

---

**Next Steps:**
1. Deploy the new build with debug logging
2. Open browser console
3. Look for the logs mentioned above
4. Report back what you see!
