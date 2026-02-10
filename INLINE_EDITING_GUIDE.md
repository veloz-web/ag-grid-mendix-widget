# Inline Editing Guide

## Overview

The grid supports **inline editing** for editable columns. Editing is Mendix‑native: values are applied to the row’s `MxObject`, then the configured action is executed with the **row as context**.

## Configuration

### Column Editing (per column)
In **Columns → Editing**:

- **Editable**: enable inline editing for this column
- **Editor Type**: text, number, date, datetime, checkbox, select, rich select
- **Select Options (JSON)**: required for select/richSelect editors
- **Validation**: required, min/max, regex pattern

**Select Options Examples**
```json
["Open", "Closed", "Blocked"]
```

```json
[{"value":"Open","label":"Open"},{"value":"Closed","label":"Closed"}]
```

### Grid Editing Options
In **Editing**:

- **Edit Mode**: Cell or Full Row
- **Stop Editing on Blur**
- **Enable Undo/Redo**

### Action
In **Events**:

- **On Cell Edit Commit**: executed after a cell edit is committed. Uses the edited row as the action context.

## Server‑Side Row Model
When using **Server‑Side** row model, the grid refreshes the data source after edits to keep the cache in sync.

## Validation Notes
Client‑side validation uses the column rules. Final validation should be performed in your microflow.

## Tips
- Avoid editable columns with **templates** or **link renderers**.
- For dates, AG Grid uses the date editor — ensure your Mendix attribute is DateTime.
