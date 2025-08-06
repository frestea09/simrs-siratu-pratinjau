
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Indicator, useIndicatorStore } from "@/store/indicator-store"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const dateRangeFilter: FilterFn<Indicator> = (row, columnId, value, addMeta) => {
    // Period is in "yyyy-MM" format. We need to convert it to a Date object.
    const rowDate = new Date(row.original.period);
    const [start, end] = value as [Date, Date];

    // Normalize start date to the beginning of the month
    const normalizedStart = start ? new Date(start.getFullYear(), start.getMonth(), 1) : null;
    
    // Normalize end date to the end of the month
    const normalizedEnd = end ? new Date(end.getFullYear(), end.getMonth() + 1, 0) : null;
    
    if (normalizedStart && !normalizedEnd) {
        return rowDate >= normalizedStart;
    }
    if (!normalizedStart && normalizedEnd) {
        return rowDate <= normalizedEnd;
    }
    if (normalizedStart && normalizedEnd) {
        return rowDate >= normalizedStart && rowDate <= normalizedEnd;
    }
    return true;
}


export const columns: ColumnDef<Indicator>[] = [
  {
    accessorKey: "indicator",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Indikator
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("indicator")}</div>,
  },
  {
    accessorKey: "period",
    header: "Periode",
    cell: ({ row }) => <div>{format(new Date(row.getValue("period")), "MMMM yyyy", { locale: IndonesianLocale })}</div>,
    filterFn: dateRangeFilter,
  },
  {
    accessorKey: "numerator",
    header: () => <div className="text-right">Numerator</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("numerator"))
      return <div className="text-right font-medium">{amount}</div>
    },
  },
  {
    accessorKey: "denominator",
    header: () => <div className="text-right">Denominator</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("denominator"))
      return <div className="text-right font-medium">{amount}</div>
    },
  },
  {
    accessorKey: "ratio",
    header: () => <div className="text-right">Capaian</div>,
    cell: ({ row }) => <div className="text-right font-semibold">{row.getValue("ratio")}</div>,
  },
]

type IndicatorReportTableProps = {
  indicators: Indicator[]
}

export function IndicatorReportTable({ indicators }: IndicatorReportTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [date, setDate] = React.useState<DateRange | undefined>()

  const table = useReactTable({
    data: indicators,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })
  
  React.useEffect(() => {
    const from = date?.from;
    const to = date?.to;
    table.getColumn("period")?.setFilterValue(from || to ? [from, to] : undefined);
  }, [date, table]);


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder="Cari nama indikator..."
          value={(table.getColumn("indicator")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("indicator")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex-1 min-w-[200px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL y")} -{" "}
                      {format(date.to, "LLL y")}
                    </>
                  ) : (
                    format(date.from, "LLL y")
                  )
                ) : (
                  <span>Pilih rentang periode</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  )
}
