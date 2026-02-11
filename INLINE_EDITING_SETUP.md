# CRUD Operations Setup Guide

This guide explains how to configure Create, Read, Update, and Delete (CRUD) operations in the AG Grid Mendix widget.

## Table of Contents

- [Inline Editing (Update)](#inline-editing-update)
- [Row Deletion (Delete)](#row-deletion-delete)
- [Row Addition (Create)](#row-addition-create)
- [Best Practices](#best-practices)

---

## Inline Editing (Update)

Inline editing allows users to edit cell values directly in the grid without opening a separate form. The widget supports **two modes** that are automatically detected based on your data source:

1. **Entity Mode** (automatic) - For Mendix entity objects with `.set()` methods
2. **Custom Mode** (manual) - For non-persistable entities or custom data structures

## Data Source Modes

### Mode 1: Entity Objects (Automatic Persistence)

**Best for**: Database entities, persistable objects

The widget automatically:
1. Detects that objects have a `.set()` method
2. Calls `data.set(attributeName, newValue)` to update the object in memory
3. Passes the updated object to your `onCellEditCommit` action
4. Your action just needs to commit the object

**Example**:
```
Data Source: Database → Product entity
onCellEditCommit: Microflow that commits the Product object
```

### Mode 2: Custom Data (Manual Handling)

**Best for**: Non-persistable entities, transformed data, external APIs

The widget:
1. Detects that objects DON'T have a `.set()` method
2. Stores edit information in `data._editedValues[attributeName] = {oldValue, newValue}`
3. Passes the object with `_editedValues` to your `onCellEditCommit` action
4. Your action reads `_editedValues` and handles the update logic

**Example**:
```
Data Source: Microflow → Non-persistable entity or custom object
onCellEditCommit: Microflow that reads _editedValues and updates external system
```

## ⚠️ Data Source Requirements

The widget supports **both** entity objects and custom data structures:

### ✅ Supported: Entity Objects (Mode 1)
```
Data Source Type: Database or Microflow
Returns: List of persistable entity objects
Requirements: Objects must have .set() method
```

The widget will automatically update the object in memory and pass it to your action for commit.

### ✅ Supported: Custom Data (Mode 2)
```
Data Source Type: Microflow or Nanoflow
Returns: Non-persistable entities, custom objects, or transformed data
Requirements: Must configure onCellEditCommit action to handle updates
```

The widget will store edit info in `_editedValues` and pass the object to your action. Your action must handle the persistence logic.

### ❌ Not Recommended
```
❌ Association data sources (not directly editable)
❌ Static/read-only data sources
```

## Step-by-Step Configuration

### 1. Configure Data Source (REQUIRED)

In the widget's **Data Source** tab:

- **Data Source**: Select a **Database** source or **Microflow** that returns your entity list
- The data source MUST return Mendix objects (not plain JSON or transformed data)

Example Domain Model:
```
Entity: Product
  - Name (String)
  - Price (Decimal)
  - Description (String)
  - InStock (Boolean)
```

### 2. Mark Columns as Editable

In the widget's **Columns** tab, for each column you want to make editable:

1. Select the column
2. Go to **Editing** section
3. Set **Editable** = `Yes`
4. Choose **Editor Type**:
   - `Text` - For string attributes
   - `Number` - For integer/decimal/long attributes
   - `Select` - For dropdowns (requires editor options configuration)
   - `Date` - For date/datetime attributes
   - `LargeText` - For multi-line text (opens popup editor)

Example column configuration:
```
Column: Name
  Attribute: Name
  Editable: Yes
  Editor Type: Text

Column: Price
  Attribute: Price
  Editable: Yes
  Editor Type: Number

Column: InStock
  Attribute: InStock
  Editable: Yes
  Editor Type: Select
  Editor Options: [{"value": true, "label": "Yes"}, {"value": false, "label": "No"}]
```

### 3. Configure On Cell Edit Commit Action (REQUIRED)

In the widget's **Events** tab:

1. Set **On Cell Edit Commit** to a **Microflow** or **Nanoflow**
2. The action receives the **edited object** as its parameter
3. The action should commit the object (Mode 1) or handle custom persistence (Mode 2)

#### Mode 1: Entity Objects - Simple Commit

**Example Microflow: `ACT_Product_CommitEdit`**
```
Input Parameter: Product (Product entity)
Actions:
  1. Commit object: $Product
  2. (Optional) Show message: "Product updated"
  3. End event
```

> **Note**: The object is already updated in memory via `.set()`, so just commit it.

#### Mode 2: Custom Data - Manual Update Handling

**Example Microflow: `ACT_CustomData_CommitEdit`**
```
Input Parameter: CustomObject (Non-persistable entity)

Actions:
  1. Check if $CustomObject has _editedValues
  2. For each edited field in _editedValues:
     - Get oldValue and newValue
     - Perform custom update logic (e.g., call REST API, update database via SQL)
  3. Handle success/error
  4. End event
```

**Example Java Action to read _editedValues**:
```java
// In your microflow, call a Java action to parse _editedValues
public Map<String, Object> getEditedValues(IContext context, IMendixObject obj) {
    Object editedValues = obj.getValue(context, "_editedValues");
    // Parse and return the map of changes
    return (Map<String, Object>) editedValues;
}
```

**Alternative: Use JavaScript action in Nanoflow**:
```javascript
// In a JavaScript action called from nanoflow
export function getEditedValues(obj) {
    return obj._editedValues || {};
}
```

Then in your nanoflow:
```
1. Call JS action: getEditedValues($CustomObject) → $Changes
2. For each change in $Changes:
   - Extract attributeName, oldValue, newValue
   - Call your custom update logic
3. Refresh grid if needed
```

### 4. Optional: Configure Edit Mode

In the widget's **CRUD** tab:

- **Edit Mode**: 
  - `Cell` (default) - Edit one cell at a time
  - `Row` - Edit multiple cells in a row, then save the entire row at once

- **Stop Editing When Cells Lose Focus**: 
  - `Yes` (default) - Auto-save when clicking elsewhere
  - `No` - Require explicit Enter/Tab key to save

- **Undo/Redo Cell Editing**: 
  - `Yes` - Enable Ctrl+Z / Ctrl+Y for edits
  - `No` (default) - No undo functionality

## How It Works (Internal Flow)

### Mode 1: Entity Objects

When a user edits a cell on an entity object:

1. User double-clicks a cell (or presses Enter) → Cell enters edit mode
2. User types new value and presses Enter (or clicks away if auto-save enabled)
3. Widget detects `data.set()` method exists
4. Widget calls `data.set(attributeName, newValue)` to update the object in memory
5. Widget calls your `onCellEditCommit` action with the updated object
6. Your action commits the object to persist changes to the database
7. If commit fails, widget automatically reverts the value and refreshes the cell

### Mode 2: Custom Data

When a user edits a cell on a non-entity object:

1. User double-clicks a cell (or presses Enter) → Cell enters edit mode
2. User types new value and presses Enter (or clicks away if auto-save enabled)
3. Widget detects `data.set()` method does NOT exist
4. Widget stores `data._editedValues[attributeName] = {oldValue, newValue}`
5. Widget calls your `onCellEditCommit` action with the object (containing `_editedValues`)
6. Your action reads `_editedValues` and performs custom update logic
7. If action succeeds, widget cleans up `_editedValues`
8. If action fails, widget removes the failed edit from `_editedValues` and refreshes the cell

## Troubleshooting

### "Columns are marked as editable but no 'On Cell Edit Commit' action is configured"

**Solution**: You MUST configure an action in the **Events** tab → **On Cell Edit Commit**. Without this, edits won't be persisted.

### "Cell doesn't enter edit mode when I click"

**Possible causes**:
1. Column's **Editable** is set to `No`
2. Data source doesn't return actual Mendix objects
3. Column uses a **Custom Formatter** or **Template** (these disable editing)
4. Grid is in read-only mode

**Solution**: Check column configuration and ensure data source returns entity objects.

### "Edits revert immediately after saving"

**Possible causes**:
1. Your `onCellEditCommit` action is failing/throwing an error
2. Your action isn't committing the object
3. Grid is refreshing data from the server, overwriting local changes

**Solution**: 
- Check runtime logs for errors in your action
- Ensure your action includes a **Commit** activity
- If using server-side row model, ensure `onDataRefresh` is configured correctly

### "I get 'data.set is not a function' error"

**This is not an error!** This warning appears when editing non-entity objects (Mode 2).

**What's happening**: 
- Your data source returns objects without `.set()` methods (non-persistable entities, custom objects)
- The widget automatically switches to Mode 2
- Edit information is stored in `_editedValues` instead

**Action required**: 
- Ensure your `onCellEditCommit` action is configured
- Update your action to read `_editedValues` and handle the update logic
- See "Mode 2: Custom Data" section above for implementation examples

**If you expected Mode 1 (entity objects)**:
- Verify your data source returns actual persistable entity objects
- Check in Chrome DevTools console: `console.log(data)` should show a Mendix object with `.set` method

### "Select editor doesn't show options"

**Solution**: Configure **Editor Options** for the column:
```json
[
  {"value": "active", "label": "Active"},
  {"value": "inactive", "label": "Inactive"}
]
```

## Example: Complete Configuration

### Example 1: Entity Objects (Mode 1)

**Domain Model**:
```
Entity: Employee
  - FullName (String)
  - Email (String)
  - Salary (Decimal)
  - Department (String)
  - Active (Boolean)
```

**Widget Configuration**:

**Data Source Tab**:
- Data Source: `Database` → `Employee` entity

**Columns Tab**:
```
Column 1:
  Attribute: FullName
  Caption: "Name"
  Editable: Yes
  Editor Type: Text

Column 2:
  Attribute: Email
  Caption: "Email"
  Editable: Yes
  Editor Type: Text

Column 3:
  Attribute: Salary
  Caption: "Salary"
  Editable: Yes
  Editor Type: Number
  Formatter: currency

Column 4:
  Attribute: Department
  Caption: "Department"
  Editable: Yes
  Editor Type: Select
  Editor Options: [
    {"value": "Engineering", "label": "Engineering"},
    {"value": "Sales", "label": "Sales"},
    {"value": "HR", "label": "HR"}
  ]

Column 5:
  Attribute: Active
  Caption: "Status"
  Editable: Yes
  Editor Type: Select
  Editor Options: [
    {"value": true, "label": "Active"},
    {"value": false, "label": "Inactive"}
  ]
```

**Events Tab**:
- On Cell Edit Commit: `ACT_Employee_CommitEdit`

**Microflow: `ACT_Employee_CommitEdit`**:
```
Input: $Employee (Employee)
Actions:
  1. Commit object: $Employee
  2. (Optional) Log message: "Employee " + $Employee/FullName + " updated"
```

**CRUD Tab**:
- Edit Mode: `Cell`
- Stop Editing When Cells Lose Focus: `Yes`
- Undo/Redo Cell Editing: `No`

---

### Example 2: Custom Data / Non-Persistable Entity (Mode 2)

**Domain Model**:
```
Non-Persistable Entity: ExternalProduct
  - ProductID (String) - from external API
  - ProductName (String) - editable
  - Price (Decimal) - editable
  - ExternalSystemID (String) - from external API
```

**Widget Configuration**:

**Data Source Tab**:
- Data Source: `Microflow` → `DS_LoadExternalProducts` (returns list of ExternalProduct NPE)

**Columns Tab**:
```
Column 1:
  Attribute: ProductID
  Caption: "ID"
  Editable: No

Column 2:
  Attribute: ProductName
  Caption: "Product Name"
  Editable: Yes
  Editor Type: Text

Column 3:
  Attribute: Price
  Caption: "Price"
  Editable: Yes
  Editor Type: Number
```

**Events Tab**:
- On Cell Edit Commit: `ACT_ExternalProduct_CommitEdit`

**Microflow: `ACT_ExternalProduct_CommitEdit`**:
```
Input: $ExternalProduct (ExternalProduct NPE)

Actions:
  1. Create variable: $EditedValues (String) = toString($ExternalProduct._editedValues)
  2. Java Action: ParseEditedValues($ExternalProduct) → $Changes (Map)
  3. Decision: Is $Changes empty?
     - Yes → End (no changes)
     - No → Continue
  4. For each change in $Changes:
     - Get attributeName, oldValue, newValue
     - Call REST: PUT /api/products/{$ExternalProduct/ProductID}
       Body: {"field": $attributeName, "value": $newValue}
  5. Decision: REST call successful?
     - Yes → Show message "Product updated in external system"
     - No → Throw error "Failed to update external product"
  6. End event
```

**Java Action: `ParseEditedValues`**:
```java
public class ParseEditedValues extends CustomJavaAction<Map<String, Object>> {
    private IMendixObject ExternalProduct;

    @Override
    public Map<String, Object> executeAction() throws Exception {
        Map<String, Object> result = new HashMap<>();
        
        // Try to get the _editedValues property
        Object editedValuesObj = ExternalProduct.getValue(getContext(), "_editedValues");
        
        if (editedValuesObj instanceof Map) {
            return (Map<String, Object>) editedValuesObj;
        }
        
        return result; // Return empty map if no edits
    }
}
```

**Alternative: JavaScript Action in Nanoflow**:
```javascript
// @flow
/**
 * @param {MxObject} externalProduct
 * @returns {Promise.<string>}
 */
export async function GetEditedValuesJSON(externalProduct) {
    if (externalProduct._editedValues) {
        return JSON.stringify(externalProduct._editedValues);
    }
    return "{}";
}
```

Then parse the JSON in your nanoflow and process each change.

**CRUD Tab**:
- Edit Mode: `Cell`
- Stop Editing When Cells Lose Focus: `Yes`

---

---

## Row Deletion (Delete)

Row deletion allows users to delete one or more rows from the grid via toolbar button or context menu.

### Configuration

#### 1. Enable Row Delete

In the widget's **CRUD** tab:

- **Enable Row Delete**: `Yes`
- **Delete Button Label**: Custom text (e.g., "Delete", "Remove")
- **Show in Toolbar**: Display delete button in toolbar
- **Show in Context Menu**: Add delete option to right-click menu
- **Require Selection**: Require at least one row to be selected
- **Enable Bulk Delete**: Allow deleting multiple rows at once
- **Confirmation**: Enable/configure delete confirmation dialog

#### 2. Configure Delete Action

In the widget's **Events** tab:

- **On Delete Row**: Set to a Microflow or Nanoflow
- The action receives **the row object** as parameter
- The action should delete/commit the object

### Example Configuration

**CRUD Tab**:
```
Enable Row Delete: Yes
Delete Button Label: "Delete"
Show in Toolbar: Yes
Show in Context Menu: Yes
Require Selection: Yes
Enable Bulk Delete: Yes
Confirmation Enabled: Yes
Confirmation Title: "Confirm Delete"
Confirmation Message: "Are you sure you want to delete the selected row(s)?"
```

**Events Tab**:
- On Delete Row: `ACT_Product_Delete`

**Microflow: `ACT_Product_Delete`**:
```
Input: $Product (Product entity)

Actions:
  1. Delete object: $Product
  2. (Optional) Show message: "Product deleted"
  3. End event
```

### How It Works

1. User selects one or more rows and clicks "Delete" button (or right-clicks → Delete)
2. If confirmation is enabled, a dialog appears
3. For each selected row, the widget calls your `onDeleteRow` action with the row object
4. Your action deletes the object (or marks it for deletion, calls API, etc.)
5. Widget removes successful deletions from the grid and shows toast notification
6. Selection is cleared

### Notes

- **Works with both entity and non-entity data** - The row object is passed to your action regardless of type
- **Bulk operations** - When bulk delete is enabled and multiple rows are selected, the action is called once per row
- **Transaction support** - For client-side row model, widget uses AG Grid's `applyTransaction` for smooth removal
- **Server-side model** - For server-side row model, widget calls `dataSource.reload()` after successful deletes

---

## Row Addition (Create)

Row addition allows users to add new rows via a toolbar button.

### Configuration

#### 1. Enable Row Add

In the widget's **CRUD** tab:

- **Enable Row Add**: `Yes`
- **Add Button Label**: Custom text (e.g., "Add", "New", "+ Create")
- **Add Button Position**: `left` or `right` in toolbar

#### 2. Configure Add Action

In the widget's **Events** tab:

- **On Add Row**: Set to a Microflow or Nanoflow
- The action receives **NO parameters** (you create the object)
- The action should:
  1. Create a new entity object
  2. Set default values
  3. (Optional) Open a form/page for the user to fill in details
  4. Commit the object
  5. (Optional) Refresh the grid data source

### Example Configuration

**CRUD Tab**:
```
Enable Row Add: Yes
Add Button Label: "+ Add Product"
Add Button Position: left
```

**Events Tab**:
- On Add Row: `ACT_Product_Add`

**Microflow: `ACT_Product_Add`**:
```
Input: None

Actions:
  1. Create object: Product → $NewProduct
  2. Change object: $NewProduct
     - Name = "New Product"
     - Price = 0
     - InStock = true
  3. Show page: ProductEdit_Page
     - Pass object: $NewProduct
  4. End event
```

**Alternative: Add and Stay in Grid**:
```
Input: None

Actions:
  1. Create object: Product → $NewProduct
  2. Change object: $NewProduct
     - Name = "Untitled Product"
     - Price = 0
  3. Commit object: $NewProduct
  4. Refresh in client: Yes (this triggers grid reload)
  5. End event
```

### How It Works

1. User clicks "Add" button in toolbar
2. Widget calls your `onAddRow` action
3. Your action creates and initializes the new object
4. Your action can either:
   - **Open a form** for the user to fill in details, then commit
   - **Create and commit** directly with default values, then grid auto-refreshes
5. New row appears in the grid after commit/refresh

### Notes

- **No parameters** - The action receives no context, so you have full control over object creation
- **Flexible workflow** - Can open forms, show dialogs, or create objects directly
- **Works with all data sources** - Whether entity or non-entity data, your action handles creation
- **Auto-refresh** - If using database data source, grid automatically picks up new rows on commit

---

## Best Practices

## Best Practices

### General CRUD Best Practices

1. **Always handle errors** - Wrap commits/deletes in error handling and show user-friendly messages
2. **Validate before commit** - Add validation logic in your microflows before committing changes
3. **Use transactions** - Group related operations in microflows to maintain data integrity
4. **Provide feedback** - Show success/error messages to confirm actions completed
5. **Test with real data** - Ensure your actions work with actual production data scenarios

### Inline Editing (Update) Best Practices

1. **For entity mode** - Just commit the object; the widget has already updated it via `.set()`
2. **For custom mode** - Read `_editedValues` to see what changed, then handle persistence accordingly
3. **Consider row-level editing** - For forms with many editable fields, `Row` edit mode provides better UX than `Cell` mode
4. **Handle async operations** - If calling external APIs, handle loading states and timeouts
5. **Validate on commit** - Check business rules before committing edits

### Row Deletion (Delete) Best Practices

1. **Always enable confirmation** - Prevent accidental deletions with confirmation dialogs
2. **Handle cascading deletes** - Ensure your delete action handles associated objects
3. **Soft delete option** - Consider marking records as deleted instead of hard deleting
4. **Bulk delete carefully** - When enabling bulk delete, ensure your action can handle multiple calls efficiently
5. **Clear selection after delete** - Widget does this automatically, but ensure your action doesn't interfere

### Row Addition (Create) Best Practices

1. **Set sensible defaults** - Initialize new objects with appropriate default values
2. **Use forms for complex objects** - Open a detail page for objects with many required fields
3. **Direct add for simple objects** - For simple entities, create and commit directly without a form
4. **Handle mandatory fields** - Ensure required fields are either defaulted or collected before commit
5. **Refresh strategy** - Let the grid auto-refresh for database sources, or manually refresh for others

### Performance Considerations

1. **Server-side row model for large datasets** - Use for 10,000+ rows to avoid loading all data at once
2. **Optimize delete operations** - For bulk delete, consider batching database operations
3. **Minimize refreshes** - Only reload grid data when necessary (after add/delete, not on every edit)
4. **Use pagination** - Enable pagination to limit rendered rows and improve performance
5. **Virtual scrolling** - Let AG Grid virtualize rows for smooth scrolling with large datasets

## Related Documentation

- [Row Actions Guide](ROW_CLICK_ACTIONS.md) - How to configure row click/double-click actions
- [Custom Formatters Guide](CUSTOM_FORMATTERS_GUIDE.md) - How to format cell values (note: formatters disable editing)
- [Data Source Guide](QUICK_SETUP_GUIDE.md) - How to configure data sources
