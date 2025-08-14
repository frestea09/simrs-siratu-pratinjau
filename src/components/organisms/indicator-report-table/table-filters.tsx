
"use client"

import * as React from "react"
import { Table, RowData } from "@tanstack/react-table"
import { FilterFn } from "@tanstack/react-table"
import { format, isValid } from "date-fns"
import { DateRange } from "react-day-picker"
import { Download, Filter, Calendar as CalendarIcon, X as XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Indicator, IndicatorCategory } from "@/store/indicator-store"

declare module '@tanstack/react-table' {
    interface FilterFns {
        dateRangeFilter: FilterFn<RowData>
        categoryFilter: FilterFn<RowData>
    }
}

export const dateRangeFilter: FilterFn<Indicator> = (row, columnId, value) => {
    const rowDateValue = row.getValue(columnId)
    if (typeof rowDateValue !== 'string') return false;
    
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
}


export const categoryFilter: FilterFn<Indicator> = (row, id, value) => {
    return value.includes(row.original.category);
}

const categoryOptions: {value: IndicatorCategory, label: string}[] = [
    { value: 'INM', label: 'INM'},
    { value: 'IMP-RS', label: 'IMP-RS'},
    { value: 'IMPU', label: 'IMPU'},
    { value: 'SPM', label: 'SPM'},
]

interface TableFiltersProps<TData> {
  table: Table<TData>
  showCategoryFilter: boolean
  onExport: () => void
  showDateFilter?: boolean
}

export function TableFilters<TData>({ table, showCategoryFilter, onExport, showDateFilter = true }: TableFiltersProps<TData>) {
  const [date, setDate] = React.useState<DateRange | undefined>()

  React.useEffect(() => {
    if (showDateFilter) {
        table.getColumn("period")?.setFilterValue(date ? [date.from, date.to] : undefined);
    }
  }, [date, table, showDateFilter]);

  return (
    <div className="flex items-center py-4 gap-2 flex-wrap">
      <Input
        placeholder="Cari nama indikator..."
        value={(table.getColumn("indicator")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("indicator")?.setFilterValue(event.target.value)}
        className="max-w-xs"
      />
      {showDateFilter && (
        <div className="relative">
            <Popover>
            <PopoverTrigger asChild>
                <Button
                id="date"
                variant={"outline"}
                className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                    date.to ? (<> {format(date.from, "d MMM yyyy")} - {format(date.to, "d MMM yyyy")} </>) 
                    : (format(date.from, "d MMM yyyy"))
                ) : (<span>Pilih rentang tanggal</span>)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2}/>
            </PopoverContent>
            </Popover>
            {date && (
            <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setDate(undefined)}>
                <XIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
            )}
        </div>
      )}
      {showCategoryFilter && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Kategori
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Kategori</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categoryOptions.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.value}
                className="capitalize"
                checked={(table.getColumn("category")?.getFilterValue() as string[] | undefined)?.includes(cat.value) ?? false}
                onCheckedChange={(value) => {
                  const currentFilter = (table.getColumn("category")?.getFilterValue() as string[] | undefined) || [];
                  const newFilter = value ? [...currentFilter, cat.value] : currentFilter.filter(s => s !== cat.value);
                  table.getColumn("category")?.setFilterValue(newFilter.length ? newFilter : undefined);
                }}
              >
                {cat.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Button variant="outline" className="ml-auto" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Unduh Laporan
      </Button>
    </div>
  )
}
