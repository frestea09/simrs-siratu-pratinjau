import { Table, RowData, FilterFn } from "@tanstack/react-table";

export interface TableFiltersProps<TData> {
  table: Table<TData>;
  showCategoryFilter: boolean;
  onExport: () => void;
  showDateFilter?: boolean;
}

declare module '@tanstack/react-table' {
  interface FilterFns {
    dateRangeFilter: FilterFn<RowData>;
    categoryFilter: FilterFn<RowData>;
  }
}
