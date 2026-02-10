# Exhaustive Implementation Plan: AG Grid Port to Mendix 10.24 Widget
## Features: ADD, DELETE, and Inline Editing

---

## **Time Estimates (Revised)**
- **Inline Editing**: 1.5–2 days
- **Delete Actions**: 0.75–1 day  
- **Add Actions**: 1–1.5 days
- **Integration & Testing**: 1–2 days
- **Total**: 4.25–6.5 days (excluding advanced features)

---

## **Architecture Overview**

### **Data Flow Pattern (Mendix-native)**
```
UI Event → Update MxObject value(s) → ListActionValue.get(row).execute() →
Microflow commits (or rejects) → Grid refresh (client transaction or dataSource reload)
```

### **Key Mendix Integration Points**
1. **Widget XML Configuration** (`AGGrid.xml`)
2. **TypeScript Component** (event handlers, AG Grid API)
3. **Mendix Actions** (microflows/nanoflows for CRUD operations)
4. **Data Source Management** (client-side vs. server-side model)

### **Mendix-native Constraints (Important)**
- **ListActionValue does not accept parameters.** We must update the row’s `MxObject` values first, then call `action.get(row).execute()`.
- **Server-side row model** should refresh via `dataSource.reload()` or `gridApi.refreshServerSide({ purge: true })` after edits/deletes/adds.
- **Use current row item** as the action context (mirrors existing `onRowClick`/`onRowDoubleClick`).
- **Validation** should be minimal client-side; final validation belongs in the microflow.

---

## **Phase 1: Inline Editing (1.5–2 days)**

### **1.1 XML Configuration** (2–3 hours)
Add per-column editing configuration:

```xml
<property key="columns" type="object" isList="true">
  <!-- Existing column properties -->
  <property key="field" type="attribute" required="true" />
  <property key="headerName" type="string" />
  
  <!-- NEW: Editing properties -->
  <property key="editable" type="boolean" defaultValue="false">
    <caption>Editable</caption>
    <description>Allow inline editing for this column</description>
  </property>
  
  <property key="editorType" type="enumeration" defaultValue="text">
    <caption>Editor Type</caption>
    <enumerationValues>
      <enumerationValue key="text">Text</enumerationValue>
      <enumerationValue key="number">Number</enumerationValue>
      <enumerationValue key="date">Date</enumerationValue>
      <enumerationValue key="datetime">DateTime</enumerationValue>
      <enumerationValue key="boolean">Checkbox</enumerationValue>
      <enumerationValue key="select">Dropdown</enumerationValue>
      <enumerationValue key="richSelect">Rich Select</enumerationValue>
    </enumerationValues>
  </property>
  
  <property key="selectOptions" type="datasource" isList="true" required="false">
    <caption>Dropdown Options</caption>
    <description>Data source for select/richSelect editors</description>
  </property>
  
  <property key="validation" type="object">
    <property key="required" type="boolean" defaultValue="false" />
    <property key="minValue" type="decimal" required="false" />
    <property key="maxValue" type="decimal" required="false" />
    <property key="pattern" type="string" required="false">
      <caption>Regex Pattern</caption>
    </property>
  </property>
</property>

<!-- Global editing action (Mendix ListActionValue) -->
<property key="onCellEditCommit" type="action" required="false">
  <caption>On Cell Edit Commit</caption>
  <description>Triggered after value is applied to the row MxObject. Uses the row item as context.</description>
  <returnType type="Boolean" />
</property>

<property key="editMode" type="enumeration" defaultValue="cell">
  <caption>Edit Mode</caption>
  <enumerationValues>
    <enumerationValue key="cell">Single Cell</enumerationValue>
    <enumerationValue key="row">Full Row</enumerationValue>
  </enumerationValues>
</property>

<property key="stopEditingWhenCellsLoseFocus" type="boolean" defaultValue="true" />
<property key="undoRedoCellEditing" type="boolean" defaultValue="false" />
```

### **1.2 TypeScript Column Definition Mapping** (3–4 hours)

```typescript
// AGGridWidget.tsx

interface EditableColumnConfig {
  editable: boolean;
  editorType: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'richSelect';
  validation?: {
    required?: boolean;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
  };
  selectOptions?: Array<{ value: string; label: string }>;
}

const buildColumnDefs = (columns: ColumnConfig[]): ColDef[] => {
  return columns.map(col => {
    const colDef: ColDef = {
      field: col.field,
      headerName: col.headerName,
      editable: col.editable,
    };

    if (col.editable) {
      // Map editor types
      switch (col.editorType) {
        case 'text':
          colDef.cellEditor = 'agTextCellEditor';
          break;
        case 'number':
          colDef.cellEditor = 'agNumberCellEditor';
          colDef.cellEditorParams = {
            min: col.validation?.minValue,
            max: col.validation?.maxValue,
            precision: 2
          };
          break;
        case 'date':
          colDef.cellEditor = 'agDateCellEditor';
          break;
        case 'boolean':
          colDef.cellEditor = 'agCheckboxCellEditor';
          break;
        case 'select':
          colDef.cellEditor = 'agSelectCellEditor';
          colDef.cellEditorParams = {
            values: col.selectOptions?.map(o => o.value) || []
          };
          break;
        case 'richSelect':
          colDef.cellEditor = 'agRichSelectCellEditor';
          colDef.cellEditorParams = {
            values: col.selectOptions || [],
            cellRenderer: (params: any) => params.value.label
          };
          break;
      }

      // Value parser for type conversion
      colDef.valueParser = createValueParser(col.editorType);
      
      // Value setter for custom logic
      colDef.valueSetter = (params) => {
        if (validateCellValue(params.newValue, col.validation)) {
          params.data[params.colDef.field!] = params.newValue;
          return true;
        }
        return false; // Reject invalid values
      };
    }

    return colDef;
  });
};

const createValueParser = (editorType: string) => {
  return (params: ValueParserParams) => {
    const value = params.newValue;
    switch (editorType) {
      case 'number':
        return parseFloat(value);
      case 'date':
      case 'datetime':
        return new Date(value);
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  };
};

const validateCellValue = (value: any, validation?: ValidationConfig): boolean => {
  if (validation?.required && (value === null || value === undefined || value === '')) {
    return false;
  }
  if (validation?.minValue !== undefined && value < validation.minValue) {
    return false;
  }
  if (validation?.maxValue !== undefined && value > validation.maxValue) {
    return false;
  }
  if (validation?.pattern && !new RegExp(validation.pattern).test(value)) {
    return false;
  }
  return true;
};
```

### **1.3 Event Handler Implementation** (4–5 hours)

```typescript
const AGGridWidget: FC<AGGridProps> = (props) => {
  const gridRef = useRef<AgGridReact>(null);
  
  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent) => {
    const { data, colDef, oldValue, newValue, node } = event;
    if (oldValue === newValue) return;

    // Mendix-native pattern: update MxObject first, then execute action on the row item
    if (data && typeof data.set === "function") {
      data.set(colDef.field!, newValue);
    }

    const action = props.onCellEditCommit?.get?.(data);
    if (action && action.canExecute) {
      try {
        await action.execute();
      } catch (error) {
        console.error("Edit commit failed:", error);
        if (data && typeof data.set === "function") {
          data.set(colDef.field!, oldValue);
        }
        gridRef.current?.api.refreshCells({ rowNodes: [node], columns: [colDef.field!], force: true });
        mx.ui.error("An error occurred while saving changes.");
      }
    }

    // For server-side row model, refresh after commit
    if (props.rowModelType === "serverSide" && props.dataSource?.reload) {
      props.dataSource.reload();
    }
  }, [props.onCellEditCommit, props.entityKeyField]);

  const gridOptions: GridOptions = {
    // ... other options
    onCellValueChanged,
    editType: props.editMode === 'row' ? 'fullRow' : undefined,
    stopEditingWhenCellsLoseFocus: props.stopEditingWhenCellsLoseFocus,
    undoRedoCellEditing: props.undoRedoCellEditing,
    
    // Prevent editing on read-only rows (if applicable)
    isRowSelectable: (node) => !node.data?.isReadOnly,
  };

  return (
    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        columnDefs={buildColumnDefs(props.columns)}
        rowData={props.rowData}
        gridOptions={gridOptions}
      />
    </div>
  );
};
```

### **1.4 Mendix Microflow Example** (1 hour)

**Microflow: `ACT_AGGrid_OnCellEditCommit`**
- **Parameters**: 
  - **Row entity itself** (context object)
- **Logic**:
  1. Validate updated values
  2. Commit changes
  3. Optionally return a boolean (success/failure)
  4. Optional: Log changes for audit trail

---

## **Phase 2: Delete Actions (0.75–1 day)**

### **2.1 XML Configuration** (1–2 hours)

```xml
<!-- Delete configuration -->
<property key="enableRowDelete" type="boolean" defaultValue="false">
  <caption>Enable Row Delete</caption>
</property>

<property key="onDeleteRow" type="action" required="false">
  <caption>On Delete Row</caption>
  <description>Microflow/nanoflow to execute when row is deleted</description>
  <returnType type="Boolean" />
</property>

<property key="deleteConfirmation" type="object">
  <property key="enabled" type="boolean" defaultValue="true">
    <caption>Show Confirmation Dialog</caption>
  </property>
  <property key="title" type="string" defaultValue="Confirm Delete">
    <caption>Dialog Title</caption>
  </property>
  <property key="message" type="string" defaultValue="Are you sure you want to delete this row?">
    <caption>Dialog Message</caption>
  </property>
</property>

<property key="deleteButton" type="object">
  <property key="showInToolbar" type="boolean" defaultValue="true" />
  <property key="showInContextMenu" type="boolean" defaultValue="true" />
  <property key="icon" type="icon" defaultValue="glyphicon-trash" />
  <property key="label" type="string" defaultValue="Delete" />
  <property key="requireSelection" type="boolean" defaultValue="true">
    <caption>Require Row Selection</caption>
  </property>
</property>

<property key="bulkDeleteEnabled" type="boolean" defaultValue="false">
  <caption>Allow Multiple Row Delete</caption>
</property>
```

### **2.2 TypeScript Implementation** (3–4 hours)

```typescript
// Custom toolbar component
const CustomToolbar: FC<CustomToolbarProps> = ({ gridRef, onDelete, deleteConfig }) => {
  const handleDelete = () => {
    const selectedRows = gridRef.current?.api.getSelectedRows() || [];
    
    if (selectedRows.length === 0) {
      mx.ui.info("Please select rows to delete.");
      return;
    }
    
    if (deleteConfig.confirmation.enabled) {
      mx.ui.confirmation({
        content: deleteConfig.confirmation.message,
        title: deleteConfig.confirmation.title,
        handler: () => onDelete(selectedRows)
      });
    } else {
      onDelete(selectedRows);
    }
  };
  
  return (
    <div className="ag-grid-toolbar">
      {deleteConfig.showInToolbar && (
        <button 
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={!deleteConfig.requireSelection}
        >
          <span className={deleteConfig.icon} /> {deleteConfig.label}
        </button>
      )}
    </div>
  );
};

// Context menu configuration
const getContextMenuItems = (params: GetContextMenuItemsParams): (string | MenuItemDef)[] => {
  const defaultItems: (string | MenuItemDef)[] = ['copy', 'copyWithHeaders', 'separator'];
  
  if (props.enableRowDelete && props.deleteButton.showInContextMenu) {
    defaultItems.push({
      name: props.deleteButton.label,
      icon: `<span class="${props.deleteButton.icon}"></span>`,
      action: () => {
        const rowsToDelete = params.node ? [params.node.data] : [];
        handleDeleteRows(rowsToDelete);
      },
      disabled: !params.node
    });
  }
  
  return defaultItems;
};

// Delete handler (Mendix-native)
const handleDeleteRows = async (rows: any[]) => {
  if (!props.onDeleteRow) {
    console.warn("onDeleteRow action not configured");
    return;
  }

  try {
    const results = await Promise.all(
      rows.map(async (row) => {
        const action = props.onDeleteRow.get?.(row);
        if (!action || !action.canExecute) return { row, success: false };
        await action.execute();
        return { row, success: true };
      })
    );

    const successfulDeletes = results.filter((r) => r.success).map((r) => r.row);
    if (successfulDeletes.length > 0) {
      if (props.rowModelType === "serverSide" && props.dataSource?.reload) {
        props.dataSource.reload();
      } else {
        gridRef.current?.api.applyTransaction({ remove: successfulDeletes });
      }
      mx.ui.info(`Successfully deleted ${successfulDeletes.length} row(s).`);
    }

    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      mx.ui.error(`Failed to delete ${failures.length} row(s).`);
    }
  } catch (error) {
    console.error("Delete operation failed:", error);
    mx.ui.error("An error occurred during delete operation.");
  }
};
```

### **2.3 Mendix Microflow Example** (1 hour)

**Microflow: `ACT_AGGrid_OnDeleteRow`**
- **Parameters**: **Row entity itself** (context object)
- **Logic**:
  1. Validate delete permissions/constraints
  2. Delete associated objects (if cascade delete needed)
  3. Delete entity
  4. Return Boolean (success/failure)

---

## **Phase 3: Add Actions (1–1.5 days)**

### **3.1 XML Configuration** (1–2 hours)

```xml
<!-- Add configuration -->
<property key="enableRowAdd" type="boolean" defaultValue="false">
  <caption>Enable Row Add</caption>
</property>

<property key="onAddRow" type="action" required="false">
  <caption>On Add Row</caption>
  <description>Microflow/nanoflow to create new row</description>
  <returnType type="Object" />
</property>

<property key="addButton" type="object">
  <property key="showInToolbar" type="boolean" defaultValue="true" />
  <property key="icon" type="icon" defaultValue="glyphicon-plus" />
  <property key="label" type="string" defaultValue="Add Row" />
  <property key="position" type="enumeration" defaultValue="top">
    <enumerationValues>
      <enumerationValue key="top">Top</enumerationValue>
      <enumerationValue key="bottom">Bottom</enumerationValue>
    </enumerationValues>
  </property>
</property>

<property key="addBehavior" type="enumeration" defaultValue="inline">
  <caption>Add Behavior</caption>
  <enumerationValues>
    <enumerationValue key="inline">Inline Editing</enumerationValue>
    <enumerationValue key="modal">Modal Dialog</enumerationValue>
    <enumerationValue key="microflow">Microflow Only</enumerationValue>
  </enumerationValues>
</property>

<property key="defaultValues" type="object" isList="true">
  <property key="field" type="attribute" />
  <property key="value" type="string" />
</property>

<property key="startEditingOnAdd" type="boolean" defaultValue="true">
  <caption>Start Editing Immediately After Add</caption>
</property>

<property key="addPosition" type="enumeration" defaultValue="top">
  <caption>Insert Position</caption>
  <enumerationValues>
    <enumerationValue key="top">Top of Grid</enumerationValue>
    <enumerationValue key="bottom">Bottom of Grid</enumerationValue>
    <enumerationValue key="afterSelected">After Selected Row</enumerationValue>
  </enumerationValues>
</property>
```

### **3.2 TypeScript Implementation** (4–5 hours)

```typescript
// Toolbar with Add button
const CustomToolbar: FC<CustomToolbarProps> = ({ 
  gridRef, 
  onDelete, 
  onAdd, 
  deleteConfig, 
  addConfig 
}) => {
  return (
    <div className="ag-grid-toolbar">
      {addConfig.showInToolbar && (
        <button 
          className="btn btn-primary"
          onClick={onAdd}
        >
          <span className={addConfig.icon} /> {addConfig.label}
        </button>
      )}
      
      {deleteConfig.showInToolbar && (
        <button 
          className="btn btn-danger"
          onClick={() => handleDeleteClick(gridRef, onDelete, deleteConfig)}
        >
          <span className={deleteConfig.icon} /> {deleteConfig.label}
        </button>
      )}
    </div>
  );
};

// Add row handler (Mendix-native)
const handleAddRow = async () => {
  if (!props.onAddRow || !props.onAddRow.canExecute) {
    console.warn("onAddRow action not configured");
    return;
  }

  try {
    // Execute Mendix action to create new entity
    const newRowData = await props.onAddRow.execute();

    if (!newRowData) {
      mx.ui.error("Failed to create new row");
      return;
    }

    if (props.rowModelType === "serverSide" && props.dataSource?.reload) {
      props.dataSource.reload();
      return;
    }

    // Determine insert position
    let addIndex: number | undefined;
    switch (props.addPosition) {
      case "top":
        addIndex = 0;
        break;
      case "bottom":
        addIndex = undefined; // Appends to end
        break;
      case "afterSelected":
        const selectedNodes = gridRef.current?.api.getSelectedNodes() || [];
        if (selectedNodes.length > 0) {
          addIndex = (selectedNodes[0].rowIndex ?? 0) + 1;
        }
        break;
    }

    const result = gridRef.current?.api.applyTransaction({ add: [newRowData], addIndex });

    if (result?.add?.length && props.startEditingOnAdd) {
      const newNode = result.add[0];
      const firstEditableCol = props.columns.find((col) => col.editable);
      if (firstEditableCol && newNode.rowIndex !== null) {
        gridRef.current?.api.startEditingCell({
          rowIndex: newNode.rowIndex,
          colKey: firstEditableCol.field
        });
        gridRef.current?.api.ensureIndexVisible(newNode.rowIndex, "middle");
      }
    }

    mx.ui.info("New row added successfully");
  } catch (error) {
    console.error("Add row operation failed:", error);
    mx.ui.error("An error occurred while adding a new row.");
  }
};

// Modal dialog approach (alternative)
const handleAddRowWithModal = async () => {
  if (!props.onAddRow || !props.onAddRow.canExecute) {
    return;
  }
  
  // Open Mendix page/form for data entry
  mx.ui.openForm(props.addFormPath, {
    callback: (newObject: mendix.lib.MxObject) => {
      if (newObject) {
        // Convert MxObject to plain data
        const newRowData = convertMxObjectToRowData(newObject);
        
        gridRef.current?.api.applyTransaction({
          add: [newRowData],
          addIndex: props.addPosition === 'top' ? 0 : undefined
        });
      }
    }
  });
};

// Helper: Convert Mendix object to grid row data
const convertMxObjectToRowData = (mxObj: mendix.lib.MxObject): any => {
  const rowData: any = {};
  
  props.columns.forEach(col => {
    rowData[col.field] = mxObj.get(col.field);
  });
  
  rowData[props.entityKeyField] = mxObj.getGuid();
  
  return rowData;
};
```

### **3.3 Mendix Microflow Example** (1 hour)

**Microflow: `ACT_AGGrid_OnAddRow`**
- **Parameters**: none (use widget configuration or static defaults inside microflow)
- **Logic**:
  1. Create new entity instance
  2. Apply default values defined in the microflow (or in a separate helper)
  3. Set required associations
  4. Commit object
  5. Return new object to widget (optional)
  6. Optional: Validate required fields

---

## **Phase 4: Advanced Features** (Optional, 2–4 days)

### **4.1 Validation Framework** (0.5–1 day)

```typescript
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any, rowData: any) => boolean;
}

const validateRow = (rowData: any, columns: ColumnConfig[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  columns.forEach(col => {
    if (!col.validation) return;
    
    const value = rowData[col.field];
    
    col.validation.rules?.forEach(rule => {
      let isValid = true;
      
      switch (rule.type) {
        case 'required':
          isValid = value !== null && value !== undefined && value !== '';
          break;
        case 'min':
          isValid = value >= rule.value;
          break;
        case 'max':
          isValid = value <= rule.value;
          break;
        case 'pattern':
          isValid = new RegExp(rule.value).test(value);
          break;
        case 'custom':
          isValid = rule.customValidator ? rule.customValidator(value, rowData) : true;
          break;
      }
      
      if (!isValid) {
        errors.push({
          field: col.field,
          message: rule.message
        });
      }
    });
  });
  
  return errors;
};

// Display validation errors
const showValidationErrors = (errors: ValidationError[]) => {
  const message = errors.map(e => `${e.field}: ${e.message}`).join('\n');
  mx.ui.error(message);
};
```

### **4.2 Undo/Redo** (0.5–1 day)

```typescript
interface CellChangeHistory {
  rowId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

class ChangeHistoryManager {
  private history: CellChangeHistory[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;
  
  recordChange(change: CellChangeHistory) {
    // Remove any "future" history if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    this.history.push(change);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }
  
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }
  
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
  
  undo(gridApi: GridApi): CellChangeHistory | null {
    if (!this.canUndo()) return null;
    
    const change = this.history[this.currentIndex];
    this.currentIndex--;
    
    // Apply undo
    const rowNode = gridApi.getRowNode(change.rowId);
    if (rowNode) {
      rowNode.setDataValue(change.field, change.oldValue);
    }
    
    return change;
  }
  
  redo(gridApi: GridApi): CellChangeHistory | null {
    if (!this.canRedo()) return null;
    
    this.currentIndex++;
    const change = this.history[this.currentIndex];
    
    // Apply redo
    const rowNode = gridApi.getRowNode(change.rowId);
    if (rowNode) {
      rowNode.setDataValue(change.field, change.newValue);
    }
    
    return change;
  }
}
```

### **4.3 Bulk Operations** (0.5–1 day)

```xml
<property key="bulkEditEnabled" type="boolean" defaultValue="false" />
<property key="onBulkEdit" type="action" required="false">
  <caption>On Bulk Edit</caption>
</property>
```

```typescript
const handleBulkEdit = async (field: string, newValue: any) => {
  const selectedRows = gridRef.current?.api.getSelectedRows() || [];
  
  if (selectedRows.length === 0) {
    mx.ui.info("Please select rows to edit.");
    return;
  }
  
  const bulkContext = {
    field,
    newValue,
    rowIds: selectedRows.map(r => r[props.entityKeyField]),
    rowCount: selectedRows.length
  };
  
  const result = await props.onBulkEdit.execute(bulkContext);
  
  if (result) {
    // Update all selected rows
    const transaction: RowDataTransaction = {
      update: selectedRows.map(row => ({
        ...row,
        [field]: newValue
      }))
    };
    
    gridRef.current?.api.applyTransaction(transaction);
  }
};
```

### **4.4 Server-Side Row Model Integration** (1–2 days)

```typescript
const createServerSideDatasource = (): IServerSideDatasource => {
  return {
    getRows: async (params: IServerSideGetRowsParams) => {
      try {
        const request = {
          startRow: params.request.startRow,
          endRow: params.request.endRow,
          filterModel: params.request.filterModel,
          sortModel: params.request.sortModel
        };
        
        // Call Mendix datasource microflow
        const response = await props.dataSource.execute(request);
        
        params.success({
          rowData: response.rows,
          rowCount: response.totalRows
        });
      } catch (error) {
        console.error('Server-side fetch failed:', error);
        params.fail();
      }
    }
  };
};

// Refresh specific row after edit
const refreshRowAfterEdit = async (rowId: string) => {
  if (props.rowModelType === 'serverSide') {
    // Purge cache and refresh
    const rowNode = gridRef.current?.api.getRowNode(rowId);
    if (rowNode) {
      gridRef.current?.api.refreshServerSide({
        route: [rowNode.id!],
        purge: true
      });
    }
  }
};
```

---

## **Phase 5: Testing & Edge Cases** (1–2 days)

### **5.1 Unit Tests**
- Column configuration parsing
- Value parsers for each editor type
- Validation logic
- Change history manager

### **5.2 Integration Tests**
- Mendix action execution (mock microflows)
- Grid transaction operations
- Error handling and rollback

### **5.3 Edge Cases to Handle**

| **Scenario** | **Handling Strategy** |
|--------------|----------------------|
| Null/undefined values | Default to empty string or 0, validate before commit |
| Concurrent edits (multi-user) | Implement optimistic locking with version tracking |
| Network failure during save | Show error, revert change, queue for retry |
| Read-only rows | Add `isRowEditable` callback based on row data |
| Large datasets (>10k rows) | Use server-side row model with pagination |
| Date/time timezone handling | Store in UTC, convert for display based on user locale |
| Decimal precision | Configure `cellEditorParams.precision` |
| Invalid characters in input | Use `valueParser` + regex validation |
| Deleting row being edited | Cancel edit mode before delete |
| Adding duplicate rows | Validate uniqueness in microflow |
| Cascade deletes | Handle in microflow with proper error messages |

### **5.4 Performance Optimizations**

```typescript
// Debounce cell edits to reduce microflow calls
const debouncedEditCommit = debounce(async (event: CellValueChangedEvent) => {
  await onCellValueChanged(event);
}, 300);

// Virtual scrolling for large datasets
const gridOptions: GridOptions = {
  rowBuffer: 10,
  rowModelType: props.largeDataset ? 'serverSide' : 'clientSide',
  cacheBlockSize: 100,
  maxBlocksInCache: 10
};

// Batch transactions for bulk operations
const applyBulkChanges = (changes: RowDataTransaction[]) => {
  gridRef.current?.api.applyTransactionAsync(
    { update: changes.flatMap(c => c.update || []) },
    (res) => console.log('Bulk update complete', res)
  );
};
```

---

## **Deliverables Checklist**

### **Code Artifacts**
- [ ] Updated `AGGrid.xml` with all new properties
- [ ] TypeScript component with CRUD handlers
- [ ] Custom cell editors (if needed beyond AG Grid defaults)
- [ ] Toolbar component with Add/Delete buttons
- [ ] Context menu configuration
- [ ] Validation framework
- [ ] Error handling utilities
- [ ] TypeScript type definitions

### **Mendix Artifacts**
- [ ] Sample microflows for Add/Edit/Delete
- [ ] Non-persistable entities for action contexts
- [ ] Domain model updates (if needed)
- [ ] Access rules for CRUD operations

### **Documentation**
- [ ] Widget configuration guide
- [ ] Microflow implementation examples
- [ ] Validation rules reference
- [ ] Performance tuning guide
- [ ] Migration guide (if upgrading existing widget)

### **Testing**
- [ ] Unit test suite
- [ ] Integration tests with mock Mendix runtime
- [ ] Manual QA test cases
- [ ] Performance benchmarks

---

## **Risk Mitigation**

| **Risk** | **Mitigation** |
|----------|---------------|
| Mendix API changes in 10.24 | Review Mendix 10.24 release notes, test against runtime |
| AG Grid license costs | Verify community edition limitations, budget for enterprise |
| Data consistency in multi-user scenarios | Implement optimistic locking, show conflict resolution UI |
| Performance with large datasets | Use server-side row model, implement pagination |
| Complex validation requirements | Design flexible validation DSL, allow custom microflows |

---

## **Next Steps**
1. Review and approve this plan
2. Set up development environment (Mendix 10.24 + AG Grid)
3. Create Git feature branch
4. Implement Phase 1 (Editing) → Test → Review
5. Implement Phase 2 (Delete) → Test → Review
6. Implement Phase 3 (Add) → Test → Review
7. Integration testing across all features
8. Documentation and code review
9. Deployment to test environment

**Questions to clarify before starting:**
- Server-side vs client-side row model preference?
- Expected maximum dataset size?
- Required validation complexity (simple rules vs custom logic)?
- Multi-user editing requirements (optimistic locking needed)?
- AG Grid edition (Community vs Enterprise)?