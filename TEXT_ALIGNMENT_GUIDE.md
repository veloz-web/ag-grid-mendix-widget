# Column Text Alignment Guide

## Overview

The AG Grid widget now supports configurable text alignment for columns with smart automatic defaults based on data type and formatting.

## Alignment Options

### Auto (Default - Recommended)
When set to "Auto", the widget intelligently determines alignment based on:

**Right-Aligned (Numbers & Dates):**
- Integer, Long, Decimal types
- Currency formatters (USD, EUR, GBP)
- Percentage formatter
- Number formatter
- Decimal formatter
- All date formatters (dateShort, dateLong, dateISO, dateDMY, dateMDY, dateYMD, dateTime)
- Time formatter

**Center-Aligned (Actions & Badges):**
- Link formatter (action buttons/icons)
- Status Badge formatter

**Left-Aligned (Text & Default):**
- String type
- Boolean type
- Enum type
- All other cases

### Manual Override
You can override the automatic alignment by explicitly setting:
- **Left**: Aligns content to the left
- **Center**: Centers the content
- **Right**: Aligns content to the right

## Configuration

### In Mendix Studio Pro

1. **Select your AG Grid widget**
2. **Click on a column in the Columns property**
3. **Find "Text Alignment"** property
4. **Choose alignment:**
   - `Auto` - Let the widget decide (recommended)
   - `Left` - Force left alignment
   - `Center` - Force center alignment
   - `Right` - Force right alignment

## Examples

### Example 1: Default Auto Alignment

```
Column Configuration:
├── Name (String) → Auto → Left-aligned ✓
├── Age (Integer) → Auto → Right-aligned ✓
├── Salary (Decimal, Currency formatter) → Auto → Right-aligned ✓
├── Status (String) → Auto → Left-aligned ✓
└── Actions (Link formatter) → Auto → Center-aligned ✓
```

### Example 2: Custom Override

```
Column Configuration:
├── Product Code (String) → Right → Right-aligned ✓
│   └── Use case: Product codes look better right-aligned
├── Description (String) → Left → Left-aligned ✓
│   └── Default behavior, readable text
└── Price (Decimal) → Center → Center-aligned ✓
    └── Override: Center-align for visual emphasis
```

### Example 3: Mixed Data Grid

| Column | Type | Formatter | Alignment (Auto) | Result |
|--------|------|-----------|------------------|--------|
| ID | Integer | None | Right | Numbers align right |
| Name | String | Capitalize | Left | Text flows naturally |
| Email | String | Lowercase | Left | Email addresses left-aligned |
| Amount | Decimal | Currency (USD) | Right | $1,234.56 right-aligned |
| Created | DateTime | dateShort | Right | 12/25/2024 right-aligned |
| Status | Enum | statusBadge | Center | Badge centered |
| View | String | link | Center | Eye icon centered |

## Visual Design Benefits

### Numbers Right-Aligned
```
Before (left-aligned):        After (right-aligned):
ID                            ID
1                                  1
42                                42
123                              123
9999                            9999
← Hard to compare            ← Easy to compare ✓
```

### Actions Centered
```
Before (left-aligned):        After (centered):
Actions                       Actions
👁️                             👁️
👁️                             👁️
👁️                             👁️
← Looks unbalanced           ← Visually balanced ✓
```

### Text Left-Aligned
```
Before (right-aligned):       After (left-aligned):
Name                          Name
       Alice                  Alice
         Bob                  Bob
   Christina                  Christina
← Hard to read               ← Natural reading flow ✓
```

## Header Alignment

Headers automatically align to match their column content:
- Left-aligned columns → Left-aligned headers
- Center-aligned columns → Center-aligned headers  
- Right-aligned columns → Right-aligned headers

This creates a cohesive visual design where the header "belongs" to its data.

## Best Practices

### ✅ Do

1. **Use Auto for most columns**
   - It applies proven UX principles
   - Aligns numbers/dates right for easy comparison
   - Centers actions for visual balance

2. **Override for special cases**
   - Product codes that are numeric but treated as text
   - Emphasized columns that need centering
   - Mixed content columns

3. **Consider your data**
   - IDs: Right-aligned (even if strings)
   - Names: Left-aligned
   - Dates: Right-aligned
   - Actions: Centered
   - Status badges: Centered

### ❌ Don't

1. **Don't right-align long text**
   - Makes reading difficult
   - Breaks natural eye flow

2. **Don't left-align numbers**
   - Hard to compare magnitudes
   - Looks unprofessional

3. **Don't center everything**
   - Centered text is hard to scan
   - Use center only for symmetric content

## Technical Implementation

### How Auto Alignment Works

```typescript
// Smart alignment logic
const getCellAlignment = (col: ColumnsType): string => {
    // 1. Check explicit override
    if (col.alignment && col.alignment !== 'auto') {
        return col.alignment;
    }

    // 2. Check formatter type
    if (formatter === 'link' || formatter === 'statusBadge') {
        return 'center';
    }

    // 3. Check data type
    if (isNumeric || isDate) {
        return 'right';
    }

    // 4. Default to left
    return 'left';
};
```

### CSS Classes Applied

**Cell Styles:**
```css
.ag-cell {
    text-align: left;   /* or center, or right */
}
```

**Header Styles:**
```css
.ag-header-cell-left .ag-header-cell-label {
    justify-content: flex-start;
    text-align: left;
}

.ag-header-cell-center .ag-header-cell-label {
    justify-content: center;
    text-align: center;
}

.ag-header-cell-right .ag-header-cell-label {
    justify-content: flex-end;
    text-align: right;
}
```

## Migration from Previous Versions

If you're upgrading from a version without alignment support:

**No action needed!** 
- Default is "Auto"
- Your columns will automatically get appropriate alignment
- Numbers/dates will look better out of the box
- You can override if needed

## Troubleshooting

### Numbers appear left-aligned

**Cause:** Column might be configured as String type
**Solution:** 
1. Check attribute type in Mendix
2. Ensure it's Integer, Long, or Decimal
3. Or use a number formatter (currency, percentage, number)

### Headers don't align with content

**Cause:** CSS conflict or cache issue
**Solution:**
1. Clear browser cache
2. Check for custom CSS overriding alignment
3. Verify AGGrid.css is loaded

### Status badges look off-center

**Cause:** Badge styling or padding
**Solution:**
1. Alignment should be "Auto" or "Center"
2. Check badge CSS classes
3. Verify statusMapping JSON is correct

## Related Features

- **Formatters**: See [DATE_FORMATTING_GUIDE.md](./DATE_FORMATTING_GUIDE.md)
- **Status Badges**: See [UI_REFERENCE.md](./UI_REFERENCE.md)
- **Links**: See [LINK_NAVIGATION.md](./LINK_NAVIGATION.md)
- **Column Width**: See [COLUMN_WIDTH_CONFIGURATION.md](./COLUMN_WIDTH_CONFIGURATION.md)

## Summary

The alignment feature makes your grids more professional and easier to read:

✅ **Auto mode** handles 95% of cases correctly  
✅ **Manual override** for special needs  
✅ **Header alignment** matches content  
✅ **Zero configuration** required for basic use  
✅ **Follows UX best practices** automatically  

Just set columns to "Auto" (default) and enjoy properly aligned, professional-looking grids!
