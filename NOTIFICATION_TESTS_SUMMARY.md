# Notification/Polling Tests Summary

## Tests Created

I've added comprehensive tests for the notification/polling feature in `src/__tests__/AGGrid.spec.tsx`. The test suite includes **16 test cases** covering all aspects of the polling and notification system.

### Test Categories

#### 1. **Polling Configuration Tests**
- ✅ Does not start polling when `enablePolling` is false
- ✅ Starts polling when `enablePolling` is true  
- ✅ Enforces minimum polling interval of 10 seconds
- ✅ Initializes baseline count on mount

#### 2. **Notification Display Tests**
- ⚠️ Shows toast notification when new records detected (failing - see known issues)
- ⚠️ Shows cumulative count when multiple changes occur (failing)
- ⚠️ Resets cumulative count when notification dismissed (failing)
- ⚠️ Positions toast notifications correctly (failing)

#### 3. **Auto-Dismiss Tests**
- ⚠️ Auto-dismisses toast after specified duration (failing)
- ⚠️ Does not auto-dismiss when `autoHideDuration` is 0 (failing)

#### 4. **Message Content Tests**
- ⚠️ Shows correct message for records removed (failing)

#### 5. **Integration Tests**
- ⚠️ Calls `datasource.reload()` during polling check (timeout - async issue)
- ✅ Handles visibility change event to trigger check
- ✅ Cleans up polling interval on unmount
- ✅ Does not show notification when `enableNotifications` is false
- ⚠️ Updates existing toast instead of creating new ones (failing)

## Known Issues

### Primary Issue: componentDidUpdate Interference

The main test failures are caused by how React Testing Library's `rerender()` works with the component's `componentDidUpdate` lifecycle:

**Problem Flow:**
1. Test calls `rerender()` with updated datasource (new items)
2. This triggers `componentDidUpdate()`
3. `componentDidUpdate()` sees `isPollingReload === false`
4. Updates `lastKnownDataCount` to new value (thinking it's an external change)
5. When polling check runs, counts match - no notification shown

**Code Location:**
```typescript
// AGGrid.tsx lines 374-390
componentDidUpdate(prevProps: AGGridContainerProps) {
    if (this.props.dataSource !== prevProps.dataSource) {
        const newData = getRowData(this.props.dataSource);
        
        // This is the issue - in tests, rerender triggers this
        if (!this.isPollingReload) {
            console.log("[AGGrid] External datasource change - updating baseline");
            this.lastKnownDataCount = newData.length; // ← Resets baseline
        }
    }
}
```

### Test-Specific Challenges

1. **Async Timing**: Jest fake timers + async datasource.reload() create race conditions
2. **React Lifecycle**: `rerender()` simulates prop changes differently than real polling
3. **DOM Queries**: Some tests need the DOM to update after state changes

## Suggested Fixes

### Option 1: Mock componentDidUpdate (Quick Fix)
```typescript
it("shows toast notification when new records are detected", () => {
    const spy = jest.spyOn(AGGrid.prototype, 'componentDidUpdate')
        .mockImplementation(() => {}); // Prevent baseline reset
    
    // ... rest of test
    
    spy.mockRestore();
});
```

### Option 2: Refactor for Testability (Better Approach)
Separate the polling check logic into a testable pure function:
```typescript
// utils/polling.ts
export function shouldShowNotification(
    currentCount: number,
    baselineCount: number,
    enableNotifications: boolean
): { show: boolean; delta: number } {
    if (!enableNotifications || baselineCount === 0) {
        return { show: false, delta: 0 };
    }
    
    const delta = currentCount - baselineCount;
    return { show: delta !== 0, delta };
}
```

Then unit test this function independently from the React component.

### Option 3: Integration Test with Actual Server
Create E2E tests that run against a real Mendix datasource where:
- Polling naturally triggers via setInterval
- Datasource changes come from real database updates
- No synthetic rerender() calls

## Running the Tests

```bash
# Run all notification tests
npm test -- --testNamePattern="Polling and Notifications"

# Run specific test
npm test -- --testNamePattern="starts polling when enablePolling is true"

# Run with coverage
npm test -- --testNamePattern="Polling" --coverage
```

## Test Configuration

The tests use:
- **Jest fake timers** for controlling setInterval
- **React Testing Library** for component rendering
- **userEvent** for simulating user interactions
- **Mock datasources** with `as any` cast to bypass Mendix type strictness

## Next Steps

1. **Fix componentDidUpdate interference** - Choose one of the suggested approaches
2. **Resolve async timing issues** - Better handling of jest.runAllTimersAsync()
3. **Add E2E tests** - Test with real Mendix runtime
4. **Increase coverage** - Test error cases, edge cases, mobile scenarios

## Files Modified

- `src/__tests__/AGGrid.spec.tsx` - Added 16 new test cases
- `src/AGGrid.tsx` - No changes (tests revealed design issues)
- `typings/AGGridProps.d.ts` - Added notification props to mockProps

## Test Stats

- **Total Tests**: 16
- **Passing**: 7 (43.75%)
- **Failing**: 9 (56.25%)
- **Primary Cause**: componentDidUpdate baseline reset
- **Test Time**: ~12 seconds
