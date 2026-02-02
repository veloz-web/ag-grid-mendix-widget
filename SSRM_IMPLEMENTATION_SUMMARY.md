# Server-Side Row Model Implementation Summary

## Overview
Implemented support for AG Grid's Server-Side Row Model (SSRM) to handle large datasets by offloading data operations (sorting, filtering, grouping) to a Mendix Microflow.

## Key Changes

### 1. Module Registration (`src/agGridModules.ts`)
- Registered `ServerSideRowModelModule` to enable SSRM features.

### 2. Configuration (`src/AGGrid.xml`)
- Added `rowModelType` property (Enum: `clientSide` | `serverSide`).
- Added `serverSideMicroflow` property (String) to specify the Mendix Microflow to call.

### 3. Logic Implementation (`src/hooks/useGridApi.ts`)
- Implemented `createServerSideDatasource` function.
  - Bridges AG Grid's `getRows` method to Mendix `mx.data.action`.
  - Serializes request parameters (startRow, endRow, sortModel, filterModel) to JSON.
  - Handles success/failure callbacks.
- Updated `onGridReady` to initialize the datasource when `rowModelType` is set to `serverSide`.

### 4. Component Integration
- **`src/AGGrid.tsx`**: Passed `rowModelType` and `serverSideMicroflow` props to `useGridApi` and child components.
- **`src/components/viewRenderer.tsx`**: Propagated `rowModelType` to `GridView`.
- **`src/components/GridView.tsx`**: 
  - Updated `GridViewProps` interface.
  - Passed `rowModelType` to the `AgGridReact` component.

## Usage
1. In Mendix Studio Pro, set **Data Mode** to `Server Side`.
2. Configure **Server Side Microflow** with the name of your microflow (e.g., `MyModule.DS_GetGridData`).
3. The microflow should accept a JSON string argument (`requestJson`) and return a JSON string containing `{ "rowData": [...], "lastRow": 100 }`.
