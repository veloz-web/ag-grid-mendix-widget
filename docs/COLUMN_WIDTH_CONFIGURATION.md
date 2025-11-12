# Column Width Configuration

The AG Grid widget supports three types of column width sizing to give you complete control over your layout.

## Width Types

### 1. Fixed (Default)
- **Use when:** You want a specific pixel width
- **Properties:**
  - Width Type: "Fixed (pixels)"
  - Fixed Width (px): Enter the desired width (default: 150)
- **Example:** A column with Fixed Width of 200 will always be 200 pixels wide
- **Best for:** Columns with consistent content size (IDs, status badges, action buttons)

### 2. Flexible (fr units)
- **Use when:** You want columns to share available space proportionally
- **Properties:**
  - Width Type: "Flexible (fr units)"
  - Flex Value: The flex ratio (default: 1)
  - Minimum Width (px): Minimum allowed width (default: 50)
  - Maximum Width (px): Optional maximum width
- **Example:** 
  - Two columns with Flex Value of 1 each will split available space 50/50
  - One column with Flex Value of 2 and another with 1 will split space 66%/33%
- **Best for:** Content columns that should fill remaining space (names, descriptions, addresses)

### 3. Auto
- **Use when:** You want the column to fit its content
- **Properties:**
  - Width Type: "Auto (fit content)"
  - Minimum Width (px): Minimum allowed width (default: 50)
  - Maximum Width (px): Optional maximum width
- **Example:** A column with auto width will expand/contract based on the widest content
- **Best for:** Short, variable-length content (abbreviations, codes)

## Common Patterns

### Pattern 1: Fixed Actions + Flexible Content
Perfect for tables with action buttons:
- **ID Column:** Fixed, 100px
- **Name Column:** Flexible, flex: 2
- **Description Column:** Flexible, flex: 3
- **Status Column:** Fixed, 120px
- **Actions Column:** Fixed, 100px (view/edit buttons)

Result: Actions and fixed columns stay consistent, content columns fill remaining space proportionally.

### Pattern 2: All Flexible
Great for responsive layouts:
- **All columns:** Flexible with appropriate flex ratios
- **Example:** Name (flex: 2), Email (flex: 2), Phone (flex: 1), Status (flex: 1)

Result: Columns resize proportionally when window changes.

### Pattern 3: Auto Fit
Let content determine sizes:
- **Short columns:** Auto width
- **Long columns:** Flexible with minWidth constraints

Result: Optimal use of space based on actual data.

## Best Practices

1. **Always set minWidth for flexible/auto columns**
   - Prevents columns from becoming too narrow
   - Default of 50px is usually too small for most content
   - Recommended: 100-150px for text columns

2. **Use maxWidth to prevent excessive growth**
   - Especially important for short columns with occasional long values
   - Example: A "Status" column might be 80px wide but shouldn't grow to 400px for one long status text

3. **Mix fixed and flexible for best results**
   - Fixed: Action buttons, icons, short codes
   - Flexible: Names, descriptions, long text
   - Auto: Optional, for truly variable content

4. **Consider mobile views**
   - Flexible columns work better on mobile
   - Fixed pixel widths may cause horizontal scrolling

5. **Test with real data**
   - Edge cases (very long text, empty cells) can affect layout
   - Use minWidth/maxWidth to handle edge cases

## Migration from Previous Version

If you have existing widgets using the old `width` property (integer only):
- **Old widgets will continue to work** - they default to "Fixed (pixels)" type
- **To upgrade:** Change Width Type to "Flexible" or "Auto" for better responsive behavior
- **Recommended:** Review and update width settings for optimal layout

## Examples

### Example 1: Classic Data Table
```
| Column          | Width Type | Fixed Width | Flex Value | Min Width | Max Width |
|-----------------|------------|-------------|------------|-----------|-----------|
| ID              | Fixed      | 80          | -          | -         | -         |
| Customer Name   | Flexible   | -           | 2          | 150       | -         |
| Email           | Flexible   | -           | 2          | 180       | 400       |
| Phone           | Fixed      | 140         | -          | -         | -         |
| Status          | Auto       | -           | -          | 80        | 150       |
| Actions         | Fixed      | 100         | -          | -         | -         |
```

### Example 2: Simple List
```
| Column          | Width Type | Flex Value | Min Width |
|-----------------|------------|------------|-----------|
| Title           | Flexible   | 3          | 200       |
| Category        | Flexible   | 1          | 100       |
| Date            | Flexible   | 1          | 120       |
```

### Example 3: Dense Information Display
```
| Column          | Width Type | Settings           |
|-----------------|------------|--------------------|
| Code            | Auto       | min: 60, max: 100  |
| Description     | Flexible   | flex: 3, min: 200  |
| Quantity        | Fixed      | 90px               |
| Unit            | Auto       | min: 50, max: 80   |
| Price           | Fixed      | 110px              |
```

## Technical Details

- **Flexible width** uses AG Grid's `flex` property (similar to CSS flexbox)
- **Auto width** omits both `width` and `flex`, allowing AG Grid to calculate optimal size
- **Fixed width** uses AG Grid's `width` property
- All three types support AG Grid's native column resizing (if enabled)
- Flexible columns share the space remaining after fixed and auto columns are sized
