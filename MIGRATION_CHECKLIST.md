# Migration Checklist: Moving to Custom Formatters

Use this checklist when migrating from hardcoded formatters to the new custom formatter system.

## Why Migrate?

- ✅ **Reusable**: Use same formatter in multiple widgets/columns
- ✅ **Centralized**: Update formatting logic in one place
- ✅ **Maintainable**: No widget modifications needed
- ✅ **Flexible**: Override formatters per template use

## Migration Steps

### Step 1: Identify Current Usage

Find all places where you're using:
- [ ] Column property `formatter: "statusBadge"`
- [ ] Column property `statusMapping: '[...]'`
- [ ] Templates with `{{Status}}` expecting formatted output

### Step 2: Create Custom Formatter

In Studio Pro, for each formatter type:

- [ ] Open AG Grid widget properties
- [ ] Go to **Custom Formatters** section  
- [ ] Click **+ New**
- [ ] Fill in:
  - [ ] **Formatter Name**: e.g., `statusBadge`
  - [ ] **Formatter Type**: `JavaScript Function`
  - [ ] **Formatter Code**: Copy from [STATUS_BADGE_EXAMPLE.md](./STATUS_BADGE_EXAMPLE.md)
  - [ ] **Formatter Configuration**: Your JSON mapping

### Step 3: Update Templates

For each template using formatters:

**Card Template:**
- [ ] Find raw field references: `{{Status}}`
- [ ] Decide if you want raw or formatted:
  - Raw (for attributes): Keep `{{Status}}`
  - Formatted (for display): Change to `{{statusBadge("Status")}}`

**List Template:**
- [ ] Same process as card template
- [ ] Update each field reference

**Example Changes:**
```html
<!-- BEFORE -->
<div class="card">
    <div class="status">{{Status}}</div>  
    <!-- Shows formatted if column has formatter -->
</div>

<!-- AFTER -->
<div class="card" data-status="{{Status}}">
    <!-- Raw value for CSS selector -->
    <div class="status">{{statusBadge("Status")}}</div>
    <!-- Explicitly formatted -->
</div>
```

### Step 4: Update Grid View Columns (Optional)

If you're only using templates, you can simplify:

- [ ] Remove `statusMapping` from columns (moved to Custom Formatters config)
- [ ] Optionally keep `formatter: "statusBadge"` for grid view
- [ ] Or set `formatter: "none"` if only using in templates

**Grid view still respects column formatters!** This step is optional.

### Step 5: Test

- [ ] Build widget: `npm run build`
- [ ] Deploy to Mendix project
- [ ] Test each view mode:
  - [ ] Grid view shows formatted values
  - [ ] Card view renders custom template correctly
  - [ ] List view renders custom template correctly
- [ ] Check browser console (F12) for errors
- [ ] Verify `data-status` attributes have raw values
- [ ] Verify formatted badges display correctly

### Step 6: Cleanup (Optional)

Once confirmed working:

- [ ] Remove old `statusMapping` from column properties
- [ ] Document your custom formatters for team
- [ ] Update project documentation

## Common Patterns

### Pattern 1: Status Badge
```
✅ Custom Formatter: statusBadge (with JSON config)
✅ Template: {{statusBadge("Status")}}
✅ Grid: formatter="statusBadge" (uses custom formatter automatically)
```

### Pattern 2: User Avatar
```
✅ Custom Formatter: userAvatar (with avatar field config)
✅ Template: {{userAvatar("AssignedTo")}}
✅ Grid: formatter="none" (avatar only in cards)
```

### Pattern 3: Priority Indicator
```
✅ Custom Formatter: priority
✅ Template: {{priority("TaskPriority")}}
✅ Grid: formatter="none" or formatter="priority"
```

## Rollback Plan

If you need to rollback:

1. **Templates are backwards compatible**:
   - `{{Status}}` will show raw value (by design)
   - Built-in formatters still work in grid view

2. **Keep both approaches**:
   - Custom formatters in templates
   - Column formatters in grid view
   - They work together!

3. **Gradual migration**:
   - Migrate one formatter at a time
   - Test thoroughly before moving to next

## Verification Checklist

After migration:

- [ ] Widget builds without errors
- [ ] All formatters registered (check console for registration errors)
- [ ] Templates render correctly in all view modes
- [ ] No `undefined` or `[object Object]` in output
- [ ] CSS classes applied correctly
- [ ] Data attributes have raw values
- [ ] Click actions still work
- [ ] Performance is acceptable

## Troubleshooting

### Badge not showing?
- Check formatter name matches exactly (case-sensitive)
- Verify JSON configuration is valid
- Look for errors in browser console

### Shows {{statusBadge("Status")}} literally?
- Formatter not registered (check console)
- Typo in formatter name
- Missing formatter code

### Wrong values displayed?
- Field name doesn't match column header
- Check item object structure (F12 > Console > log the item)

## Getting Help

- Read [CUSTOM_FORMATTERS_GUIDE.md](./CUSTOM_FORMATTERS_GUIDE.md)
- Check [STATUS_BADGE_EXAMPLE.md](./STATUS_BADGE_EXAMPLE.md)
- Review [CUSTOM_FORMATTERS_SUMMARY.md](./CUSTOM_FORMATTERS_SUMMARY.md)
- Open issue on GitHub with:
  - Widget version
  - Formatter configuration
  - Console errors
  - Expected vs actual output

---

**Migration Time Estimate:**
- Simple project (1-2 formatters): 15-30 minutes
- Medium project (3-5 formatters): 30-60 minutes
- Complex project (5+ formatters): 1-2 hours

**Recommended Approach:** Start with one formatter, verify it works, then migrate the rest.
