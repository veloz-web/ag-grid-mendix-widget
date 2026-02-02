# Sort Configuration: "All or Nothing" Implementation

## Overview
Implemented an "all or nothing" approach for sort priority configuration to simplify usage and prevent configuration errors.

## The Rule
**Either ALL sortable columns must have `sortIndex` defined, OR ALL must be left at default (999).**

Partial configuration is not allowed and will show an error.

## Why "All or Nothing"?

### Problems with Partial Configuration
- **Confusing behavior**: Some columns sort, others don't - unclear to users why
- **Merge complexity**: Complex logic to combine default sorts with custom sorts
- **Maintenance burden**: Edge cases and unexpected behaviors
- **User confusion**: "Why is my sort not working?" when only some columns are configured

### Benefits of "All or Nothing"
- **Clear intent**: User either wants full control or default behavior
- **Simple logic**: No merging, no edge cases
- **Better errors**: Validation catches mistakes early (in preview)
- **Predictable**: Users know exactly what to expect

## Configuration Options

### Option 1: Use Default Sorting (Recommended for most cases)
Leave all `sortIndex` properties at their default value of `999`.

```
Column A: sortIndex = 999 ✅
Column B: sortIndex = 999 ✅
Column C: sortIndex = 999 ✅
```

**Result**: AG Grid handles sorting naturally based on user interactions.

### Option 2: Full Override (Advanced use case)
Assign `sortIndex` to **ALL** sortable columns.

```
Column A: sortIndex = 0 ✅
Column B: sortIndex = 1 ✅
Column C: sortIndex = 2 ✅
```

**Result**: Columns sort in the specified priority order.

### ❌ Invalid: Partial Configuration
```
Column A: sortIndex = 0 ❌
Column B: sortIndex = 999 ❌
Column C: sortIndex = 1 ❌
```

**Result**: Configuration error shown in preview and runtime.

## Implementation Details

### 1. Validation Function (`src/utils/data.ts`)
```typescript
export const validateSortConfiguration = (columns = []) => {
    const sortableColumns = columns.filter((col) => col.includeInSort !== false);
    const columnsWithCustomIndex = sortableColumns.filter((col) => 
        col.sortIndex !== undefined && col.sortIndex !== 999
    );

    // All or nothing rule
    if (columnsWithCustomIndex.length === 0 || 
        columnsWithCustomIndex.length === sortableColumns.length) {
        return { valid: true, error: null };
    }
    
    return {
        valid: false,
        error: "Either assign sortIndex to ALL sortable columns, or leave ALL at default (999)."
    };
};
```

### 2. Runtime Validation (`src/AGGrid.tsx`)
- Validates configuration on render
- Shows error UI if validation fails
- Prevents widget from rendering with invalid config

### 3. Preview Validation (`src/AGGrid.editorPreview.tsx`)
- Shows prominent error banner in Studio Pro
- Lists exactly which columns have the issue
- Guides user to fix the configuration

### 4. Property Description Update (`src/AGGrid.xml`)
Updated the `sortIndex` property description to clearly state the rule:
> "ALL or NOTHING: Either assign sortIndex to ALL sortable columns, or leave ALL at default (999). Partial configuration will show an error."

## User Experience

### In Studio Pro (Design Time)
When user configures columns with partial sortIndex:
```
🚫 Sort Configuration Error:
Sort Priority configuration error: 2 of 5 sortable columns have custom sortIndex. 
Either assign sortIndex to ALL sortable columns, or leave ALL at default (999).
```

### At Runtime
Same error message appears if invalid config reaches production.

## Migration Guide

### If you have existing partial configuration:

**Option A - Reset to Default:**
1. Set ALL column `sortIndex` properties to `999`
2. Let AG Grid handle sorting

**Option B - Complete the Configuration:**
1. Review which columns should be sortable
2. Assign `sortIndex` (0, 1, 2, ...) to **every** sortable column
3. Ensure no column is left at `999`

## Related Files
- `src/utils/data.ts` - Validation logic
- `src/AGGrid.tsx` - Runtime validation
- `src/AGGrid.editorPreview.tsx` - Preview validation
- `src/AGGrid.xml` - Property definition with updated description
