import { FilterFn } from "@tanstack/react-table";
import { isValid } from "date-fns";
import { Indicator } from "@/store/indicator-store";

export const dateRangeFilter: FilterFn<Indicator> = (row, columnId, value) => {
  const rowDateValue = row.getValue(columnId);
  if (typeof rowDateValue !== "string") return false;

  const rowDate = new Date(rowDateValue);
  if (!isValid(rowDate)) return false;

  const [start, end] = value as [Date | undefined, Date | undefined];

  if (!start && !end) return true;

  const startDate = start ? new Date(start.setHours(0, 0, 0, 0)) : null;
  const endDate = end ? new Date(end.setHours(23, 59, 59, 999)) : null;

  if (startDate && !endDate) return rowDate >= startDate;
  if (!startDate && endDate) return rowDate <= endDate;
  if (startDate && endDate) return rowDate >= startDate && rowDate <= endDate;

  return true;
};

export const categoryFilter: FilterFn<Indicator> = (row, id, value) => {
  return value.includes(row.original.category);
};
