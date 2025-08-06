
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Calendar as CalendarIcon, Eye } from "lucide-react"
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
import { Indicator } from "@/store/indicator-store"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog"

const dateRangeFilter: FilterFn<Indicator> = (row, columnId, value, addMeta) => {
    const rowDate = new Date(row.original.period);
    const [start, end] = value as [Date, Date];

    const normalizedStart = start ? new Date(start.getFullYear(), start.getMonth(), 1) : null;
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

const ReportDetailDialog = ({ indicator, open, onOpenChange }: { indicator: Indicator | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
    if (!indicator) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Detail Laporan Indikator</DialogTitle>
                    <DialogDescription>
                        {indicator.indicator} - Periode {format(new Date(indicator.period), "MMMM yyyy", { locale: IndonesianLocale })}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Capaian</span>
                        <span className="col-span-2 text-sm font-semibold">{indicator.ratio}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Standar</span>
                        <span className="col-span-2 text-sm">{`${indicator.standard}${indicator.indicator === "Waktu Tunggu Rawat Jalan" ? ' min' : '%'}`}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <Badge variant={indicator.status === 'Memenuhi Standar' ? 'default' : 'destructive'} className="w-fit">{indicator.status}</Badge>
                    </div>
                     <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground pt-1">Numerator</span>
                        <span className="col-span-2 text-sm">{indicator.numerator}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground pt-1">Denominator</span>
                        <span className="col-span-2 text-sm">{indicator.denominator}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground pt-1">Catatan</span>
                        <p className="col-span-2 text-sm bg-muted/50 p-3 rounded-md">
                            {indicator.notes || "Tidak ada catatan."}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

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
  const [selectedIndicator, setSelectedIndicator] = React.useState<Indicator | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const columns: ColumnDef<Indicator>[] = [
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
      accessorKey: "ratio",
      header: () => <div className="text-right">Capaian</div>,
      cell: ({ row }) => <div className="text-right font-semibold">{row.getValue("ratio")}</div>,
    },
    {
      accessorKey: "standard",
      header: () => <div className="text-right">Standar</div>,
      cell: ({ row }) => {
        const standard = row.original.standard;
        const isTimeBased = row.original.indicator === "Waktu Tunggu Rawat Jalan";
        return <div className="text-right">{`${standard}${isTimeBased ? ' min' : '%'}`}</div>;
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as Indicator['status'];
        return (
          <div className="text-center">
              <Badge variant={status === 'Memenuhi Standar' ? 'default' : 'destructive'}>{status}</Badge>
          </div>
        )
      },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Detail</div>,
        cell: ({ row }) => {
            const indicator = row.original
            return (
                <div className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedIndicator(indicator);
                        setIsDetailOpen(true);
                    }}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
  ]


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
                captionLayout="dropdown-buttons"
                fromYear={2020}
                toYear={new Date().getFullYear()}
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
      <ReportDetailDialog 
        indicator={selectedIndicator}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}

    