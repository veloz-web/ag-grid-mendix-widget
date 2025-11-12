# Data Polling Guide

## Overview

The AG Grid widget supports automatic polling to detect when new data is available. When changes are detected, a notification banner appears allowing users to refresh the grid without reloading the page.

## Configuration

### Enable Polling in Studio Pro

1. Select the AGGrid widget on your page
2. Under **Grid Options**:
   - **Enable Data Polling:** ✓ (checked)
   - **Polling Interval:** 30 (seconds, minimum 10)
3. Save and deploy

```xml
<!-- Widget properties -->
<property key="enablePolling" type="boolean" defaultValue="false" />
<property key="pollingInterval" type="integer" defaultValue="60" />
```

## How It Works

### Detection
- Polls the datasource every N seconds
- Compares current record count with last known count
- Detects when records are added or removed
- **Note:** Currently only detects count changes, not record updates

### Notification
When changes are detected, a banner appears at the top of the grid:

```
┌──────────────────────────────────────────────┐
│ ℹ  5 new records available                  │
│    [🔄 Refresh Now]  [Dismiss]               │
└──────────────────────────────────────────────┘
```

### Smart Polling
- Polling automatically pauses when notification is shown
- Resumes when user clicks "Refresh" or "Dismiss"
- Saves resources by not checking while notification is pending

## User Actions

### Refresh Now
- Applies the new data to the grid
- Dismisses the notification banner
- Resumes polling

### Dismiss
- Hides the notification banner
- Resumes polling
- New data can still be shown later if more changes occur

## Troubleshooting

### Polling Not Working

1. **Check Widget Configuration**
   - Verify "Enable Data Polling" is checked
   - Ensure polling interval is ≥ 10 seconds

2. **Check Browser Console**
   - Open DevTools (F12) → Console tab
   - Filter for "AGGrid Polling"
   - Look for: `[AGGrid Polling] ✓ Starting polling`

3. **Verify Datasource Type**
   - **Database datasource** (recommended): Auto-refreshes
   - **Microflow/Nanoflow**: May cache results
   - Ensure datasource is configured to retrieve latest data

### No Notification Appears

1. **Check Console Logs**
   - Look for: `[AGGrid Polling] 🔔 CHANGE DETECTED!`
   - If you see this but no banner, check CSS is loading

2. **Verify Data Changed**
   - Polling detects count changes only
   - Adding/removing records triggers notification
   - Updating existing records does NOT trigger notification

3. **Check for Cached Data**
   - Clear browser cache
   - Clear localStorage: `localStorage.clear()` in console
   - Refresh the page

### Polling Logs

**Normal operation:**
```javascript
[AGGrid Polling] ✓ Starting polling {intervalSeconds: 30}
[AGGrid Polling] Initialized baseline count: 5
[AGGrid Polling] No change detected
[AGGrid Polling] No change detected
```

**When changes detected:**
```javascript
[AGGrid Polling] 🔔 CHANGE DETECTED! {oldCount: 5, newCount: 7}
[AGGrid Polling] Skipping - notification already shown (paused)
// User clicks "Refresh Now"
[AGGrid Polling] ✓ Data refreshed, polling will resume
```

## Datasource Recommendations

### Option 1: Database Source (Recommended)
```
Data Source:
- Type: Database
- Entity: YourEntity
- Auto-updates when Mendix commits new objects
```

### Option 2: Microflow with Refresh
```
Data Source:
- Type: Microflow
- Microflow: Retrieve latest data (no caching)
- Ensure microflow always fetches fresh data
```

## Testing

1. Set polling interval to 10 seconds for testing
2. Open browser console to see polling logs
3. Add a new record from another session/browser tab
4. Wait 10 seconds for polling check
5. Verify notification banner appears
6. Click "Refresh Now" to see new data

## Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enablePolling` | boolean | false | Enable/disable data polling |
| `pollingInterval` | integer | 60 | Seconds between checks (min: 10) |

## State Management

The widget maintains these state properties:

```typescript
hasNewData: boolean          // Notification visible
newRecordCount: number       // Number of changed records
pendingData: any[]          // New data to apply
lastKnownDataCount: number   // Baseline for comparison
```

## Limitations

- **Count-based detection only**: Doesn't detect updates to existing records
- **No automatic refresh**: User must click "Refresh Now" button
- **Client-side only**: No server-side push notifications

## Best Practices

1. **Set appropriate intervals**: 30-60 seconds for most use cases
2. **Use database datasources**: Ensures fresh data on each check
3. **Test with console open**: Monitor polling logs during development
4. **Consider user workflow**: Don't interrupt with too-frequent notifications
5. **Clear intervals matter**: Shorter intervals = more resource usage

## Future Enhancements

Potential improvements (not yet implemented):
- Track record GUIDs instead of just count
- Auto-refresh option (no user click required)
- Detect record updates (not just additions/deletions)
- Network status awareness (pause when offline)
- Polling status indicator in UI
- Sound notifications (optional)
- Customizable notification position
