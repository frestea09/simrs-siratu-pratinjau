
"use client"

import * as React from "react"
import { Table, RowData, FilterFn } from "@tanstack/react-table"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ChevronDown, Calendar as CalendarIcon, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { SubmittedIndicator } from "@/store/indicator-store"
import { statusOptions, categoryOptions } from "../indicator-submission-table"

declare module '@tanstack/react-table' {
    interface FilterFns {
        dateRangeFilter: FilterFn<RowData>
        categoryFilter: FilterFn<RowData>
        statusFilter: FilterFn<RowData>
    }
}

export const getStatusVariant = (status: SubmittedIndicator['status']) => {
    switch (status) {
        case 'Diverifikasi': return 'default'
        case 'Menunggu Persetujuan': return 'secondary'
        case 'Ditolak': return 'destructive'
        default: return 'outline'
    }
}

export const dateRangeFilter: FilterFn<SubmittedIndicator> = (row, columnId, value) => {
    const date = new Date(row.original.submissionDate);
    const [start, end] = value as [Date | undefined, Date | undefined];
    
    if (start && !end) return date >= start;
    if (!start && end) {
        const localEndDate = new Date(end);
        localEndDate.setHours(23, 59, 59, 999);
        return date <= localEndDate;
    }
    if (start && end) {
        const localEndDate = new Date(end);
        localEndDate.setHours(23, 59, 59, 999);
        return date >= start && date <= localEndDate;
    }
    return true;
}

export const categoryFilter: FilterFn<SubmittedIndicator> = (row, columnId, value) => {
    return value.includes(row.original.category);
}

export const statusFilter: FilterFn<SubmittedIndicator> = (row, id, value) => {
    return value.includes(row.getValue(id))
}

interface TableFiltersProps<TData> {
  table: Table<TData>
}

export function TableFilters<TData>({ table }: TableFiltersProps<TData>) {
  const [date, setDate] = React.useState<DateRange | undefined>()

  React.useEffect(() => {
    const from = date?.from;
    const to = date?.to;
    table.getColumn("submissionDate")?.setFilterValue(from || to ? [from, to] : undefined);
  }, [date, table]);

  return (
    <div className="flex items-center py-4 gap-2 flex-wrap">
      <Input
        placeholder="Cari nama indikator..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
        className="max-w-sm"
      />
      <div className="flex-1 min-w-[200px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Pilih rentang tanggal</span>)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2}/>
          </PopoverContent>
        </Popover>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter berdasarkan</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Kategori</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
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
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="capitalize"
                  checked={(table.getColumn("status")?.getFilterValue() as string[] | undefined)?.includes(status) ?? false}
                  onCheckedChange={(value) => {
                    const currentFilter = (table.getColumn("status")?.getFilterValue() as string[] | undefined) || [];
                    const newFilter = value ? [...currentFilter, status] : currentFilter.filter(s => s !== status);
                    table.getColumn("status")?.setFilterValue(newFilter.length ? newFilter : undefined);
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
