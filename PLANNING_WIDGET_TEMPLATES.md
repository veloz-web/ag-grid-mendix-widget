# Planning: Widget-Based Templates for Card and List Views

## Objective
Allow configurators to define Card and List view templates using Mendix widgets (drag-and-drop) instead of typing raw HTML strings into the widget properties. This enables the use of the "HTML Snippet" widget or other Mendix widgets to compose the card/list item UI.

## Current State
- **Card Template**: Defined via `customCardTemplate` (String/HTML) in `AGGrid.xml`.
- **List Template**: Defined via `customListTemplate` (String/HTML) in `AGGrid.xml`.
- **Rendering**: The HTML string is processed (replacing `{{Field}}` placeholders) and rendered using `dangerouslySetInnerHTML`.

## Proposed Changes

### 1. XML Configuration (`src/AGGrid.xml`)
Add new properties to allow dropping widgets.
```xml
<property key="cardTemplateWidgets" type="widgets" required="false">
    <caption>Card Template (Widgets)</caption>
    <description>Drop Mendix widgets here to define the card layout. (Overrides HTML template if present)</description>
</property>

<property key="listTemplateWidgets" type="widgets" required="false">
    <caption>List Template (Widgets)</caption>
    <description>Drop Mendix widgets here to define the list layout. (Overrides HTML template if present)</description>
</property>
```

### 2. Component Updates
Update `src/components/CustomTemplateView.tsx` (and related renderers) to support rendering widgets.

#### Logic:
- Check if `cardTemplateWidgets` is provided.
- If yes, render it.
- If no, fall back to `customCardTemplate` (HTML string).

### 3. The Data Context Challenge
**Critical Limitation**: Mendix Pluggable Widgets do not currently support passing a specific Mendix Object (Row Object) to the children defined in a `widgets` property.
- Widgets dropped into the template will receive the **Page Context** (or the context of the AG Grid widget), not the **Row Context**.
- **Implication**: You cannot simply drop a "Text" widget and select a row attribute (e.g., `Name`) because the Text widget won't "see" the row object.

#### Workarounds / Solutions:
1.  **HTML Snippet Usage**: If the user uses the "HTML Snippet" widget, they can write HTML/JS. However, dynamic data binding (`{{Name}}`) won't work automatically unless the HTMLSnippet widget itself supports fetching data or we provide a way to inject it (which is difficult with standard widgets).
2.  **Static Content**: Useful for static layouts, buttons, or headers.
3.  **Future Proofing**: Implementing the `widgets` property now allows us to support this feature fully if Mendix introduces a "List Item Context" capability for custom widgets.

## Implementation Plan

1.  **Modify XML**: Add `cardTemplateWidgets` and `listTemplateWidgets` properties.
2.  **Update Types**: Run build to generate new prop types.
3.  **Update Renderer**:
    - Modify `CustomTemplateView.tsx` to accept the new props.
    - Implement conditional rendering: `widgets` > `html` > `default`.
    - **Note**: For the initial implementation, we will render the widgets *as is*. We will document the context limitation.
4.  **Verify**: Test by dropping a static widget (e.g., a Label or HTML Snippet with static text) into the template and verifying it repeats for each row.

## Questions for User
- Do you specifically need the "HTML Snippet" widget to access row data (e.g. `{{Name}}`)?
- Or is the goal just to use the Mendix editor to structure the HTML (even if it's static or uses JS to fetch data)?
