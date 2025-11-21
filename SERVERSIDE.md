# Server-Side Rendering (SSRM) Implementation Guide

This document outlines the steps required to upgrade the current client-side AG Grid widget to support **Server-Side Row Model (SSRM)**. This allows for handling large datasets by performing querying, filtering, and sorting on the server (Mendix runtime) rather than in the browser.

## 1. Prerequisites

- **AG Grid Enterprise License**: The Server-Side Row Model is an enterprise-only feature.
- **Mendix Knowledge**: Familiarity with Microflows, Java Actions (for OQL), and JSON serialization.

## 2. Required AG Grid Modules

You must register the `ServerSideRowModelModule` in `src/agGridModules.ts`.

```typescript
// src/agGridModules.ts
import { ModuleRegistry } from "ag-grid-community";
import { ServerSideRowModelModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([
    // ... existing modules
    ServerSideRowModelModule
]);
```

## 3. Property Configuration Changes (`AGGrid.xml`)

To support server-side operations, we need to tell the widget how to fetch data. The standard `dataSource` property (ListValue) loads data into the client, which defeats the purpose of SSRM for very large datasets.

We recommend adding a "Data Mode" property and a specific configuration for the server-side fetcher.

```xml
<propertyGroup caption="Data Mode">
    <property key="rowModelType" type="enumeration" defaultValue="clientSide">
        <caption>Row Model</caption>
        <description>Choose Client-Side for small datasets or Server-Side for large datasets.</description>
        <enumerationValues>
            <enumerationValue key="clientSide">Client-Side (Standard)</enumerationValue>
            <enumerationValue key="serverSide">Server-Side (Large Data)</enumerationValue>
        </enumerationValues>
    </property>
</propertyGroup>

<propertyGroup caption="Server-Side Configuration">
    <property key="serverSideMicroflow" type="microflow" required="false">
        <caption>Data Loader Microflow</caption>
        <description>Microflow that accepts an AG Grid Request JSON and returns a Response JSON.</description>
        <returnType type="String" />
    </property>
    <property key="entityName" type="string" required="false">
        <caption>Entity Name</caption>
        <description>The entity type being retrieved (helper for OQL generation).</description>
    </property>
</propertyGroup>
```

> **Note**: While Mendix Pluggable Widgets have a `datasource` property that supports paging/sorting (`setLimit`, `setOffset`), mapping AG Grid's complex filter model (nested AND/OR, specific text filters) directly to Mendix's `ListValue` filter API is often restrictive. A **Custom Microflow** approach provides the most flexibility.

## 4. Implementation Logic

### A. Grid Options Configuration

In `src/hooks/useGridApi.ts` or `AGGrid.tsx`, you must configure the grid to use the server-side model when selected.

```typescript
// Grid Options
const gridOptions = {
    rowModelType: props.rowModelType, // 'clientSide' or 'serverSide'
    // ... other options
};
```

### B. The Datasource Adapter

You need to implement the `IServerSideDatasource` interface. This adapter acts as the bridge between AG Grid and Mendix.

```typescript
const createServerSideDatasource = (mxMicroflow: string): IServerSideDatasource => {
    return {
        getRows: async (params: IServerSideGetRowsParams) => {
            const { startRow, endRow, sortModel, filterModel } = params.request;

            // 1. Construct the Request JSON
            const requestJson = JSON.stringify({
                startRow,
                endRow,
                sortModel,
                filterModel,
                groupKeys: params.request.groupKeys
            });

            try {
                // 2. Call Mendix Microflow
                // Note: Pluggable widgets usually use Action values, but for raw client API access:
                const responseJson = await new Promise<string>((resolve, reject) => {
                    mx.data.action({
                        params: {
                            actionname: mxMicroflow,
                            applyto: "selection", // or "none" depending on needs
                            guids: [], // if context needed
                            args: {
                                requestJson: requestJson
                            }
                        },
                        callback: (res) => resolve(res as string),
                        error: (err) => reject(err)
                    });
                });

                // 3. Parse Response
                // Expected format: { rowData: [...], lastRow: 1000 }
                const response = JSON.parse(responseJson);

                // 4. Pass data to AG Grid
                params.success({
                    rowData: response.rowData,
                    rowCount: response.lastRow
                });
            } catch (error) {
                console.error("Error fetching server-side data", error);
                params.fail();
            }
        }
    };
};
```

## 5. Data Source Strategies

### Option A: Microflow with OQL (Recommended for Performance)

This is the most robust solution for complex filtering and sorting.

1.  **Input**: The Microflow receives a JSON string (the AG Grid request).
2.  **Processing**:
    *   Parse the JSON.
    *   Construct an OQL query dynamically.
    *   **OQL is required** because standard Mendix retrieves do not easily support dynamic "OR" filtering or complex text matching (e.g., "Contains X AND StartsWith Y") that AG Grid supports.
3.  **Execution**: Use a Java Action (like `ExecuteOQL`) to run the query.
4.  **Output**: Serialize the resulting Mendix objects to JSON and return.

### Option B: Microflow with Database Retrieve

If your data needs are simple (basic paging and sorting, simple equality filters):

1.  **Input**: JSON Request.
2.  **Processing**:
    *   Use "Retrieve from Database".
    *   Set **Offset** and **Amount** based on `startRow` and `endRow`.
    *   Set **Sorting** based on `sortModel`.
    *   **Filtering**: You must manually map `filterModel` to XPath constraints. This is difficult for complex filters.
3.  **Output**: Return list.

### Option C: Mendix Native `ListValue` (Limited)

You can attempt to use the widget's `props.dataSource` (ListValue).

*   **Pros**: No extra microflows needed.
*   **Cons**:
    *   AG Grid's `getRows` is asynchronous and demand-driven.
    *   Mendix's `ListValue` is reactive.
    *   You would need to call `props.dataSource.setLimit(...)` inside `getRows`, then wait for the component to re-render with new `items`, and *then* call `params.success()`. This requires complex `useEffect` synchronization and is prone to race conditions.
    *   Filtering is limited to what `ListValue.setFilter()` supports (basic filtering).

## 6. Summary of Work Required

To enable Server-Side support:

1.  **Frontend (Widget)**:
    *   Import `ServerSideRowModelModule`.
    *   Add `rowModelType` and `serverSideMicroflow` properties.
    *   Implement `IServerSideDatasource` in `useGridApi.ts`.
    *   Serialize AG Grid request params to JSON.

2.  **Backend (Mendix)**:
    *   Create a **JSON Structure** matching the AG Grid Request/Response.
    *   Create a **Microflow** that accepts the request.
    *   Implement **OQL generation logic** (likely via Java Action) to handle the dynamic filters and sorting efficiently.
    *   Return the data + total count.

This architecture allows the widget to handle millions of rows by leveraging the database's power via OQL, while keeping the frontend lightweight.
