
"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table"

type TableState = {
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
  columnVisibility?: VisibilityState
  rowSelection?: RowSelectionState
}

export function useTableState(initialState: TableState = {}) {
  const [tableState, setTableState] = React.useState<TableState>({
    sorting: initialState.sorting ?? [],
    columnFilters: initialState.columnFilters ?? [],
    columnVisibility: initialState.columnVisibility ?? {},
    rowSelection: initialState.rowSelection ?? {},
  })

  const customSetTableState = (updater: TableState | ((prevState: TableState) => TableState)) => {
    if (typeof updater === "function") {
        setTableState(prevState => ({ ...prevState, ...updater(prevState) }));
    } else {
        setTableState(prevState => ({ ...prevState, ...updater }));
    }
  }

  return { tableState, setTableState: customSetTableState }
}
