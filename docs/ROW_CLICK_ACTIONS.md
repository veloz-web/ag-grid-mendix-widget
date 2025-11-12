# Row Click Actions - Microflow/Nanoflow Configuration

## Issue: Can't Access Microflows

If you can't see microflows when configuring the "On Row Click" action, it's usually due to one of these reasons:

### Common Issues & Solutions

#### 1. **ListActionValue vs ActionValue**
   
**Problem:** The widget uses `ListActionValue` type, which is different from a simple `ActionValue`.

**Solution:** ✅ **FIXED** - The widget now properly handles `ListActionValue` by:
- Getting the action for the specific row item
- Executing the action with the correct context

#### 2. **Data Source Binding**

**XML Configuration:**
```xml
<property key="onRowClick" type="action" dataSource="dataSource">
    <caption>On Row Click</caption>
    <description>Action to execute when a row is clicked</description>
</property>
```

**Important:** The `dataSource="dataSource"` attribute tells Mendix that this action should:
- Use the widget's data source entity
- Pass the selected object to the action
- Show microflows/nanoflows that accept this entity type

#### 3. **Entity Type Matching**

**The microflow/nanoflow must accept the same entity type as your data source.**

Example:
```
Data Source: MyModule.VisitRequest (list)
✅ Valid Microflow: ACT_VisitRequest_View (accepts VisitRequest)
❌ Invalid Microflow: ACT_Customer_View (accepts Customer)
```

#### 4. **Security/Permissions**

Check that the microflow/nanoflow has proper security configured:
- Module role has access to the microflow
- User's role includes the module role
- Microflow is not set to "Internal use only"

## How It Works Now

### Implementation Details

#### Grid View (AG Grid)
```typescript
private onRowClicked = (event: any) => {
    const { onRowClick } = this.props;
    
    if (!onRowClick || !event.data) {
        return;
    }
    
    // Get the action for the specific row item
    const action = onRowClick.get(event.data);
    
    // Execute if available and allowed
    if (action && action.canExecute) {
        action.execute();
    }
};
```

**Key Points:**
- `onRowClick.get(event.data)` - Gets action for the clicked row's data object
- `action.canExecute` - Checks if action can be executed (security, conditions)
- `action.execute()` - Executes the microflow/nanoflow with the row object

#### Card View & List View
```typescript
const handleCardClick = (item: any) => {
    if (!onRowClick) {
        return;
    }
    
    // Get action for the specific item
    const action = onRowClick.get(item);
    
    // Execute if available
    if (action && action.canExecute) {
        action.execute();
    }
};

// Usage
<div onClick={() => handleCardClick(item)}>
```

**Key Points:**
- Item passed to click handler
- Action retrieved for that specific item
- Same pattern as grid view

## Configuration in Studio Pro

### Step-by-Step Setup

1. **Add the Widget to a Page**
   ```
   Data Source: Database/Microflow/Nanoflow
   Entity: MyModule.MyEntity (list)
   ```

2. **Configure "On Row Click" Action**
   ```
   Events Tab:
   └─ On Row Click: [Configure...]
      ├─ Action Type: Call microflow / Call nanoflow / Show page
      └─ Select: [List of available actions]
   ```

3. **Available Action Types**

   **Call Microflow:**
   - Server-side logic
   - Can modify data, send emails, etc.
   - Receives the clicked row's object
   
   **Call Nanoflow:**
   - Client-side logic
   - Faster, no server round-trip
   - Can navigate, show popups, etc.
   
   **Show Page:**
   - Navigate to detail page
   - Pass the clicked row's object
   - Opens in same window or new tab

4. **Example: Show Detail Page**
   ```
   On Row Click:
   ├─ Action: Show page
   ├─ Page: VisitRequest_Detail
   ├─ Object to pass: {CurrentObject}
   └─ Location: Content (default) / Modal / New window
   ```

5. **Example: Call Microflow**
   ```
   On Row Click:
   ├─ Action: Call microflow
   ├─ Microflow: ACT_VisitRequest_Process
   └─ Parameter: {CurrentObject} (automatically passed)
   ```

## Troubleshooting

### Problem: No Actions Appear in Dropdown

**Check:**
1. Is the data source configured?
   - Widget must have a valid data source
   - Data source must return a list of objects

2. Are there microflows/nanoflows for this entity?
   - Create a microflow: Right-click module → Add → Microflow
   - Add parameter: Drag entity from Project Explorer
   - Parameter type must match data source entity

3. Is the entity correct?
   - Microflow parameter must match widget's data source entity
   - Check entity inheritance (can use parent entity)

### Problem: Action Doesn't Execute

**Check:**
1. **Console Errors**
   - Open browser console (F12)
   - Look for JavaScript errors
   - Check for "canExecute" or "execute" errors

2. **Security**
   ```
   Microflow Security:
   ├─ Allowed roles: [Select roles]
   └─ Apply entity access: Yes
   ```

3. **Conditions**
   - If using conditional visibility/editability
   - Check that conditions evaluate to true
   - Test with simple microflow first

### Problem: Wrong Object Passed

**Check:**
1. Data source returns correct entity type
2. Microflow parameter accepts correct entity type
3. No data mapping issues in list configuration

### Problem: Action Works in Grid But Not in Card/List View

**Cause:** Usually a bug in the old implementation where the item wasn't passed.

**Solution:** ✅ **FIXED** - All views now properly pass the clicked item to the action.

## Best Practices

### 1. Microflow Naming
```
✅ Good: ACT_EntityName_Action
   - ACT_VisitRequest_View
   - ACT_Customer_Edit
   - ACT_Order_Process

❌ Bad: Microflow1, MF_Action, ProcessData
```

### 2. Error Handling
```
Microflow Structure:
├─ Parameter: InputObject (Entity)
├─ Retrieve: Additional data if needed
├─ Decision: Validate conditions
├─ Action: Main logic
├─ Commit: Save changes
└─ Show Message/Close Page: Feedback
```

### 3. Performance
- Use nanoflows for simple navigation (faster)
- Use microflows for data modifications (safer)
- Consider batch operations for multiple rows
- Cache frequently accessed data

### 4. User Feedback
```
After Action:
├─ Show message: "Record processed successfully"
├─ Refresh list: Re-run data source
├─ Close popup: If modal dialog
└─ Navigate: Go to confirmation page
```

## Examples

### Example 1: View Details Page
```
Widget Configuration:
- Data Source: Database (VisitRequest)
- On Row Click: Show page
  - Page: VisitRequest_Detail
  - Object: {CurrentObject}
```

### Example 2: Call Processing Microflow
```
Widget Configuration:
- Data Source: Database (Order)
- On Row Click: Call microflow
  - Microflow: ACT_Order_Process

Microflow (ACT_Order_Process):
├─ Input: Order (Order entity)
├─ Change: Order.Status = 'Processing'
├─ Commit: Order
└─ Show message: 'Order processing started'
```

### Example 3: Open in Modal
```
Widget Configuration:
- Data Source: Database (Customer)
- On Row Click: Show page
  - Page: Customer_Edit
  - Location: Modal dialog
  - Object: {CurrentObject}
```

### Example 4: Conditional Execution
```
Nanoflow (NF_Customer_Action):
├─ Input: Customer (Customer entity)
├─ Decision: Customer.IsActive?
│   ├─ True: Show page Customer_Active_Detail
│   └─ False: Show message "Customer is inactive"
└─ End
```

## Security Configuration

### Module Security Settings
```
Module Security:
├─ Module Roles:
│   ├─ Administrator (full access)
│   └─ User (limited access)
│
├─ Microflow Security:
│   └─ ACT_VisitRequest_View
│       ├─ Administrator: ✓
│       ├─ User: ✓
│       └─ Apply entity access: Yes
│
└─ Entity Access:
    └─ VisitRequest
        ├─ Administrator: Read/Write
        └─ User: Read only
```

### Testing Security
1. Log in with different user roles
2. Verify actions appear/disappear based on role
3. Test that unauthorized actions are blocked
4. Check audit trail if enabled

## TypeScript Types

### ListActionValue Interface
```typescript
interface ListActionValue {
    // Get action for a specific item
    get(item: ObjectItem): ActionValue | undefined;
}

interface ActionValue {
    // Check if action can be executed
    canExecute: boolean;
    
    // Execute the action
    execute(): void;
}
```

### Usage Pattern
```typescript
// CORRECT (per-item action)
const action = listAction.get(rowItem);
if (action && action.canExecute) {
    action.execute();
}

// INCORRECT (trying to execute list directly)
❌ listAction.execute();  // Won't work!
```

## Related Documentation

- [Mendix Pluggable Widgets API](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets/)
- [ListActionValue Documentation](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-property-types/#action)
- [Widget Security](https://docs.mendix.com/howto/extensibility/create-a-pluggable-widget-one/)

## Summary

✅ **Fixed Issues:**
- ListActionValue now properly handled
- Row object correctly passed to action
- Works in all views (Grid, Card, List)
- Security checks properly implemented

✅ **Configuration:**
- Use `type="action"` with `dataSource="dataSource"`
- Microflow parameter must match entity type
- Check security settings if actions don't appear

✅ **Best Practices:**
- Name microflows clearly
- Add error handling
- Use nanoflows for navigation
- Use microflows for data changes
- Provide user feedback
