# Date Formatting Options

## Overview

The AG Grid widget provides multiple date formatting options to display dates in your preferred format. All date formatters work with DateTime attributes from your Mendix entity.

## Available Date Formats

### Standard Formats

| Formatter | Description | Example Output | Use Case |
|-----------|-------------|----------------|----------|
| **dateShort** | US Short Format (MM/DD/YYYY) | 10/08/2025 | US applications, informal dates |
| **dateMDY** | Same as dateShort | 10/08/2025 | Explicit US format |
| **dateLong** | Long Format with Month Name | October 8, 2025 | Formal documents, reports |
| **dateISO** | ISO 8601 Format (YYYY-MM-DD) | 2025-10-08 | International standard, sorting, APIs |
| **dateDMY** | European Format (DD/MM/YYYY) | 08/10/2025 | European applications |
| **dateYMD** | Asian Format (YYYY/MM/DD) | 2025/10/08 | Asian markets, Japanese systems |
| **dateTime** | Date and Time | 10/8/2025, 2:30:00 PM | Timestamps, created/modified dates |
| **time** | Time Only | 2:30:00 PM | Clock times, duration endpoints |

### Format Details

#### dateShort / dateMDY
- **Format:** MM/DD/YYYY
- **Output:** 10/08/2025
- **Best for:** US-based applications, dashboards, informal dates
- **Sorting:** Not ideal for sorting (use dateISO instead)

#### dateLong
- **Format:** Month DD, YYYY
- **Output:** October 8, 2025
- **Best for:** Reports, formal documents, user-friendly displays
- **Locale-aware:** Uses browser's locale for month names

#### dateISO
- **Format:** YYYY-MM-DD
- **Output:** 2025-10-08
- **Best for:** International applications, database exports, sorting
- **Standard:** ISO 8601 international standard
- **Sorting:** Perfect for alphabetical/string sorting

#### dateDMY
- **Format:** DD/MM/YYYY
- **Output:** 08/10/2025
- **Best for:** European, Australian, and most international markets
- **Note:** Can be confusing for US users (08/10 = Aug 10 in US, Oct 8 in EU)

#### dateYMD
- **Format:** YYYY/MM/DD
- **Output:** 2025/10/08
- **Best for:** Japanese, Chinese, Korean applications
- **Sorting:** Good for sorting (year first)

#### dateTime
- **Format:** Locale-specific date and time
- **Output:** 10/8/2025, 2:30:00 PM (US) or 08/10/2025 14:30:00 (EU)
- **Best for:** Audit logs, created/modified timestamps
- **Locale-aware:** Adapts to user's browser settings

#### time
- **Format:** Locale-specific time only
- **Output:** 2:30:00 PM or 14:30:00
- **Best for:** Schedules, appointment times, time-only fields
- **Locale-aware:** 12-hour or 24-hour based on browser settings

## Configuration

### In Studio Pro

1. Open your AG Grid widget
2. Go to **Columns** configuration
3. Select a column with a DateTime attribute
4. Find **Formatter** dropdown
5. Choose your preferred date format:
   - Date (MM/DD/YYYY) - US format
   - Date (Month DD, YYYY) - Long format
   - Date (YYYY-MM-DD) - ISO format
   - Date (DD/MM/YYYY) - European format
   - Date (YYYY/MM/DD) - Asian format
   - Date & Time - Full timestamp
   - Time Only - Just the time

### Examples

#### Example 1: Order Management (US)
```
Columns:
- Order ID: Fixed, no formatter
- Customer: Fixed, no formatter
- Order Date: formatter = "dateShort" (MM/DD/YYYY)
- Ship Date: formatter = "dateShort" (MM/DD/YYYY)
- Created: formatter = "dateTime" (full timestamp)
```
Result: Clean, US-friendly date format

#### Example 2: International Application
```
Columns:
- Event Name: no formatter
- Event Date: formatter = "dateISO" (YYYY-MM-DD)
- Registration Deadline: formatter = "dateISO" (YYYY-MM-DD)
```
Result: Unambiguous, internationally recognized format

#### Example 3: European System
```
Columns:
- Document ID: no formatter
- Submission Date: formatter = "dateDMY" (DD/MM/YYYY)
- Review Date: formatter = "dateDMY" (DD/MM/YYYY)
```
Result: European date convention

#### Example 4: Formal Report
```
Columns:
- Report Title: no formatter
- Publication Date: formatter = "dateLong" (October 8, 2025)
- Author: no formatter
```
Result: Professional, readable dates

#### Example 5: Audit Log
```
Columns:
- Action: no formatter
- User: no formatter
- Timestamp: formatter = "dateTime" (10/8/2025, 2:30:00 PM)
- Duration: no formatter
```
Result: Complete timestamp for tracking

## Choosing the Right Format

### Use dateShort / dateMDY when:
- ✅ Your users are primarily in the US
- ✅ Informal, dashboard-style displays
- ✅ Space is limited
- ❌ Don't use if: International audience, need sorting, ambiguous dates (01/02 could be Jan 2 or Feb 1)

### Use dateLong when:
- ✅ Formal documents and reports
- ✅ User-friendly displays
- ✅ You want unambiguous dates (no 01/02 confusion)
- ❌ Don't use if: Space is very limited, need consistent width

### Use dateISO when:
- ✅ International applications
- ✅ Need to sort dates as strings
- ✅ Exporting to databases or APIs
- ✅ Avoiding DD/MM vs MM/DD confusion
- ✅ Technical or developer-facing interfaces

### Use dateDMY when:
- ✅ European, Australian, or most non-US markets
- ✅ Your organization's standard is DD/MM/YYYY
- ❌ Don't use if: US users might be confused

### Use dateYMD when:
- ✅ Japanese, Chinese, Korean markets
- ✅ Sorting by date is important (year first)
- ✅ Hierarchical date organization preferred

### Use dateTime when:
- ✅ Need both date and time
- ✅ Audit trails, logs, timestamps
- ✅ Created/Modified columns
- ❌ Don't use if: Only date is relevant, space is limited

### Use time when:
- ✅ Only the time matters (schedules, appointments)
- ✅ Date is shown in another column or is implied
- ✅ Time-of-day is the key information

## Regional Considerations

| Region | Recommended Format | Example |
|--------|-------------------|---------|
| United States | dateShort (MM/DD/YYYY) | 10/08/2025 |
| Europe (most) | dateDMY (DD/MM/YYYY) | 08/10/2025 |
| UK | dateDMY (DD/MM/YYYY) | 08/10/2025 |
| Japan | dateYMD (YYYY/MM/DD) | 2025/10/08 |
| China | dateYMD (YYYY/MM/DD) | 2025/10/08 |
| Korea | dateYMD (YYYY/MM/DD) | 2025/10/08 |
| International | dateISO (YYYY-MM-DD) | 2025-10-08 |
| Canada | dateDMY or dateShort | 08/10/2025 or 10/08/2025 |
| Australia | dateDMY (DD/MM/YYYY) | 08/10/2025 |

## Sorting Considerations

**Best for sorting:**
1. **dateISO** (YYYY-MM-DD) - Sorts perfectly as strings
2. **dateYMD** (YYYY/MM/DD) - Also sorts well (year first)

**Not ideal for sorting:**
- dateMDY (MM/DD/YYYY) - Sorts by month first
- dateDMY (DD/MM/YYYY) - Sorts by day first
- dateLong (October 8, 2025) - Sorts alphabetically by month name

**Note:** If you need to sort dates, either:
- Use dateISO or dateYMD formatter
- Or ensure your data source has proper date sorting
- AG Grid handles native Date objects correctly regardless of display format

## Common Patterns

### Pattern 1: Mixed Date Columns
```
Order List:
- Order Date: dateShort (quick reference)
- Expected Delivery: dateLong (user-friendly)
- Last Updated: dateTime (precise timestamp)
```

### Pattern 2: Timeline View
```
Project Timeline:
- Milestone: no formatter
- Start Date: dateISO (sorts correctly)
- End Date: dateISO (sorts correctly)
- Days Remaining: number
```

### Pattern 3: Schedule Grid
```
Appointment Schedule:
- Patient Name: no formatter
- Appointment Date: dateLong (clear, no ambiguity)
- Appointment Time: time (clock time only)
- Duration: customPrefix ("30 min")
```

## Technical Notes

### Date Parsing
- Widget accepts JavaScript Date objects
- Mendix DateTime attributes are automatically converted
- Invalid dates display as original value (graceful fallback)

### Browser Locale
- `dateTime` and `time` formatters respect user's browser locale
- 12-hour vs 24-hour clock determined by browser settings
- Month names in `dateLong` follow browser's language settings

### Custom Formats
If you need a format not listed here (e.g., "DD-Mon-YYYY" → "08-Oct-2025"):
- Use `customPrefix` formatter
- Pre-format the date in a calculated attribute in Mendix
- Or request a new formatter type

## Migration from Old Formats

If you previously used:
- **dateShort** - Now explicitly MM/DD/YYYY (no change)
- **dateLong** - Same behavior (Month DD, YYYY)

New options added:
- **dateISO** - For international/sortable dates
- **dateDMY** - For European dates
- **dateYMD** - For Asian dates
- **dateMDY** - Explicit alias for dateShort

## Troubleshooting

### Issue: Date shows as raw number
**Cause:** Mendix stores dates as milliseconds
**Solution:** Ensure column attribute type is DateTime, not String/Integer

### Issue: Date format not applied
**Cause:** Formatter not selected or column not DateTime type
**Solution:** Check formatter dropdown is set, verify attribute is DateTime

### Issue: Wrong date format for my region
**Cause:** Default format may not match your locale
**Solution:** Select appropriate regional format (dateDMY, dateISO, etc.)

### Issue: Dates sort incorrectly
**Cause:** String sorting doesn't work well with some formats
**Solution:** Use dateISO (YYYY-MM-DD) or configure data source sort

## Summary

**Quick Reference:**
- US → **dateShort** or **dateMDY**
- Europe → **dateDMY**
- Asia → **dateYMD**
- International → **dateISO**
- Formal → **dateLong**
- Timestamps → **dateTime**
- Times → **time**

Choose the format that matches your users' expectations and regional conventions!
