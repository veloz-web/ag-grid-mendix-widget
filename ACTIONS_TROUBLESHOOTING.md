# Troubleshooting: No Actions Showing for On Row Click

## Issue: Action Dropdown is Empty

When configuring the "On Row Click" property, you see the action selector but no microflows/nanoflows/pages appear in the dropdown.

## Quick Fixes

### Fix 1: Update the Widget (Most Common)

**Problem:** Using an old version of the widget with the wrong configuration.

**Solution:**
1. Download the latest `.mpk` file
2. In Studio Pro: `Project → Synchronize Project Directory`
3. Refresh the widget properties
4. Try configuring the action again

### Fix 2: Create a Compatible Microflow

**Problem:** No microflows exist that match the widget's entity type.

**Solution - Create a Test Microflow:**

1. **Right-click your module** → Add → Microflow
2. **Name it:** `ACT_YourEntity_Test`
3. **Add Parameter:**
   - Right-click canvas → Add → Parameter
   - Name: `InputObject`
   - Type: Select your entity (same as grid's data source)
4. **Add Simple Action:**
   - Add "Show message" activity
   - Message: `'Row clicked: ' + $InputObject/Name`
5. **Save microflow**
6. **Return to widget** → Configure On Row Click
7. **You should now see** `ACT_YourEntity_Test` in the list

### Fix 3: Check Data Source Configuration

**Problem:** Data source not properly configured on the widget.

**Solution:**

1. **Open Widget Properties**
2. **Data Source Tab:**
   ```
   ✓ Data source: Should be configured (Database/Microflow/Nanoflow)
   ✓ Entity: Should show an entity type
   ✗ Data source: "(none)" - MUST BE FIXED FIRST
   ```
3. **If data source is empty:**
   - Configure it before setting up actions
   - Actions need to know which entity type to use

### Fix 4: Verify Entity Type

**Problem:** Microflows exist but don't accept the correct entity type.

**Check:**
```
Widget Data Source Entity: MyModule.VisitRequest

Microflow Parameter Types:
✓ VisitRequest → Will appear
✓ VisitRequest (parent entity) → Will appear  
✗ Customer → Won't appear
✗ No parameter → Won't appear
✗ System.User only → Won't appear
```

**Solution:**
- Create/modify microflow to accept the correct entity
- Or change widget data source to match existing microflows

### Fix 5: Check Module Security

**Problem:** Security settings hide the microflow.

**Solution:**

1. **Open Microflow**
2. **Right-click microflow** → Properties
3. **Security tab:**
   ```
   ✓ Allowed roles: Check your user role
   ✗ No roles selected → Add roles
   ```
4. **Module Security:**
   - Double-click module
   - Module security → Module roles
   - Verify roles are properly set up

### Fix 6: Refresh Studio Pro

**Problem:** Studio Pro cache is stale.

**Solution:**
1. Save all changes
2. Close widget properties dialog
3. Press `F5` or **Project → Synchronize Project Directory**
4. Re-open widget properties
5. Try configuring action again

### Fix 7: Check Mendix Version Compatibility

**Problem:** Using Mendix version that doesn't support pluggable widget actions.

**Requirements:**
- Mendix 8.0 or higher
- Pluggable widgets API v2 or higher

**Check Your Version:**
1. Studio Pro → Help → About Mendix Studio Pro
2. Version should be 8.x or higher

## Step-by-Step Verification

### Checklist for Actions to Appear:

- [ ] **Widget has data source configured**
  - Open widget properties
  - Data Source tab should show entity

- [ ] **At least one microflow/nanoflow exists**
  - Parameter type matches data source entity
  - Microflow is not internal-only

- [ ] **Security allows access**
  - Microflow allowed roles include your user role
  - Entity access permits read for the entity

- [ ] **Widget is up to date**
  - Latest `.mpk` file deployed
  - Project synchronized

- [ ] **Studio Pro is refreshed**
  - Press F5 to sync
  - Re-open widget properties

## Detailed: Creating a Compatible Microflow

### Example Setup

**Scenario:** Grid shows list of VisitRequests, want to view details on click

**Step 1: Create Microflow**
```
1. Right-click module → Add → Microflow
2. Name: ACT_VisitRequest_ViewDetails
```

**Step 2: Add Input Parameter**
```
1. Right-click microflow canvas → Add → Parameter
2. Properties:
   - Name: VisitRequest
   - Entity: MyModule.VisitRequest (same as grid data source)
```

**Step 3: Add Action (Example - Navigate to Page)**
```
1. Drag "Show page" activity to canvas
2. Properties:
   - Page: VisitRequest_Detail
   - Object to pass: $VisitRequest
   - Location: Content (or Modal)
```

**Step 4: Set Security**
```
1. Right-click microflow → Properties
2. Security tab → Allowed roles
3. Select roles that should access this microflow
```

**Step 5: Test**
```
1. Go back to AG Grid widget
2. Events tab → On Row Click
3. Action: Call microflow
4. Should now see: ACT_VisitRequest_ViewDetails
```

## Alternative: Using Nanoflow

Nanoflows are client-side and faster for navigation:

**Step 1: Create Nanoflow**
```
1. Right-click module → Add → Nanoflow  
2. Name: NF_VisitRequest_Navigate
```

**Step 2: Add Parameter** (same as microflow)

**Step 3: Add Navigation**
```
1. Use "Show page" action
2. No server round-trip needed
3. Faster user experience
```

## Common Scenarios & Solutions

### Scenario 1: Want to Navigate to Detail Page

**Best Solution:** Use Nanoflow or "Show page" action directly

```
On Row Click:
├─ Action: Show page
├─ Page: Entity_Detail
└─ Object: {CurrentObject}
```

### Scenario 2: Want to Process/Modify Data

**Best Solution:** Use Microflow

```
Microflow: ACT_Entity_Process
├─ Parameter: Entity object
├─ Change object
├─ Commit
└─ Show message (confirmation)
```

### Scenario 3: Want to Open in Popup

**Best Solution:** Show page in modal

```
On Row Click:
├─ Action: Show page
├─ Page: Entity_Edit
├─ Location: Pop-up
└─ Object: {CurrentObject}
```

### Scenario 4: Complex Logic with Multiple Steps

**Best Solution:** Microflow with multiple activities

```
Microflow: ACT_Order_ComplexProcess
├─ Parameter: Order
├─ Retrieve: Associated Customer
├─ Decision: Check status
├─ Multiple activities
└─ Navigation or message
```

## What Studio Pro Shows

### When Correctly Configured:

```
On Row Click: [Configure...]
├─ Action Type:
│   ├─ Do nothing (default)
│   ├─ Show page → [List of pages accepting your entity]
│   ├─ Call microflow → [List of microflows accepting your entity]
│   ├─ Call nanoflow → [List of nanoflows accepting your entity]
│   └─ More... → Additional options
```

### When NOT Showing Actions:

```
On Row Click: [Configure...]
├─ Action Type:
│   ├─ Do nothing (default)
│   ├─ Show page → (no pages listed) ← PROBLEM
│   ├─ Call microflow → (no microflows listed) ← PROBLEM
│   └─ Call nanoflow → (no nanoflows listed) ← PROBLEM
```

**If you see this:** Follow the fixes above!

## Understanding the Requirements

### Why Actions Might Not Show:

**Mendix matches actions based on:**
1. **Entity Type** - Parameter must match data source entity
2. **Security** - User role must have access
3. **Scope** - Action must be in current module or imported
4. **Parameter Count** - Must accept exactly one parameter (the entity)

### What Makes an Action Compatible:

✅ **Compatible Microflow:**
```
Name: ACT_VisitRequest_View
Parameters: 
  └─ VisitRequest (VisitRequest entity)
Return Type: None (or any)
Security: Accessible to user role
```

❌ **Incompatible Microflow:**
```
Name: ACT_Customer_View
Parameters:
  └─ Customer (Customer entity) ← Wrong entity type
```

❌ **Incompatible Microflow:**
```
Name: ACT_DoSomething
Parameters:
  └─ (none) ← No parameter
```

❌ **Incompatible Microflow:**
```
Name: ACT_VisitRequest_View
Parameters:
  ├─ VisitRequest (VisitRequest entity)
  └─ Customer (Customer entity) ← Too many parameters
```

## Testing the Configuration

### Minimal Test Setup:

1. **Create test microflow:**
   ```
   ACT_Test
   ├─ Parameter: YourEntity
   └─ Show message: 'It works!'
   ```

2. **Configure widget:**
   ```
   On Row Click: Call microflow → ACT_Test
   ```

3. **Run app and click row**
   - Should show 'It works!' message
   - Confirms action system working

4. **Build real microflow:**
   - Now create actual logic
   - Navigate to pages, process data, etc.

## Get More Help

If none of these fixes work:

1. **Check Mendix version:** Must be 8.0+
2. **Check widget version:** Must be latest
3. **Check console:** Look for JavaScript errors (F12)
4. **Simplify:** Test with minimal microflow first
5. **Contact support:** With screenshots of:
   - Widget properties (data source tab)
   - Action configuration screen
   - Example microflow showing parameter

## Summary

**Most common causes:**
1. ✅ No compatible microflow exists - Create one
2. ✅ Data source not configured - Configure first
3. ✅ Wrong entity type - Match parameter to data source
4. ✅ Security restrictions - Add user role to microflow
5. ✅ Widget needs update - Deploy latest version
6. ✅ Studio Pro needs refresh - Press F5

**After following these steps, you should see actions in the dropdown!**
