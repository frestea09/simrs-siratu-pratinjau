import { FilterFn } from '@tanstack/react-table';

const noop: FilterFn<any> = () => true;

export const defaultFilterFns = {
  dateRangeFilter: noop,
  categoryFilter: noop,
  statusFilter: noop,
};

export type DefaultFilterFns = typeof defaultFilterFns;
