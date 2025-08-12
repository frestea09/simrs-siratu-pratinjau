
"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  Updater,
} from "@tanstack/react-table"

type TableState = {
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
  columnVisibility?: VisibilityState
  rowSelection?: RowSelectionState
}

type SetTableState = {
    setSorting: (updater: Updater<SortingState>) => void;
    setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
    setColumnVisibility: (updater: Updater<VisibilityState>) => void;
    setRowSelection: (updater: Updater<RowSelectionState>) => void;
};


export function useTableState(initialState: TableState = {}) {
  const [sorting, setSorting] = React.useState<SortingState>(initialState.sorting ?? [])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialState.columnFilters ?? [])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState.columnVisibility ?? {})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialState.rowSelection ?? {})

  const tableState: TableState = {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
  }

  const setTableState: SetTableState = {
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection,
  }


  return { tableState, setTableState }
}
