# Polling Quick Reference

## ✅ Fixed Issues

1. **XML in wrong location** → Moved properties to `/src/AGGrid.xml`
2. **Missing TypeScript types** → Auto-generated from XML after rebuild
3. **Invalid datasource access** → Use `getRowData(this.props.dataSource)` instead
4. **Missing cleanup** → Added event listener removal in `componentWillUnmount`
5. **Deprecated API** → Use `setGridOption('rowData', data)` not `setRowData()`
6. **Unnecessary complexity** → Removed `fetchDataSilently()` method

## Configuration Properties

```xml
<!-- In src/AGGrid.xml under Grid Options -->
<property key="enablePolling" type="boolean" defaultValue="false" />
<property key="pollingInterval" type="integer" defaultValue="60" />
```

## Key Methods

```typescript
// Start polling (called in componentDidMount)
startPolling() → setInterval(checkForNewData, pollingInterval)

// Check for changes
checkForNewData() → Compare datasource length → Update state if different

// Apply new data
handleRefresh() → Update grid with pendingData → Reset state

// Cleanup (called in componentWillUnmount)
stopPolling() → clearInterval + remove event listeners
```

## State Properties

```typescript
hasNewData: boolean          // New data available
newRecordCount: number       // Number of changed records
pendingData: any[]          // New data to apply
lastRefresh: number         // Last refresh timestamp
```

## Usage in Mendix Studio Pro

1. Add AGGrid widget to page
2. Configure datasource
3. Under "Grid Options":
   - Enable Data Polling: ✓
   - Polling Interval: 30 (seconds)
4. Deploy and test

## How to Test

```bash
# Terminal 1: Start development server
npm start

# Terminal 2: Add data to datasource from another session
# Watch for hasNewData to become true in React DevTools
```

## What Gets Checked

- **Datasource length**: Primary detection mechanism
- **Triggers**: Interval timer, tab visibility change, grid focus

## Current Limitations

⚠️ Only detects **count changes**, not record updates  
⚠️ No visual notification UI (needs to be added)  
⚠️ Manual refresh required (unless you add auto-apply)

## Future Enhancements

- Add notification banner/toast
- Track record GUIDs instead of count
- Add auto-refresh option
- Add network status awareness
- Add polling status indicator
