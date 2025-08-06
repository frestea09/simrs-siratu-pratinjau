
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { ArrowUpDown, Calendar as CalendarIcon, Download } from "lucide-react"
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
import { ReportDetailDialog } from "./report-detail-dialog"
import { ActionsCell } from "./indicator-report-table/actions-cell"

const dateRangeFilter: FilterFn<Indicator> = (row, columnId, value) => {
    const rowDate = new Date(row.original.period);
    const [start, end] = value as [Date, Date];

    const normalizedStart = start ? new Date(start.getFullYear(), start.getMonth(), 1) : null;
    const normalizedEnd = end ? new Date(end.getFullYear(), end.getMonth() + 1, 0) : null;
    
    if (normalizedStart && !normalizedEnd) return rowDate >= normalizedStart;
    if (!normalizedStart && normalizedEnd) return rowDate <= normalizedEnd;
    if (normalizedStart && normalizedEnd) return rowDate >= normalizedStart && rowDate <= normalizedEnd;
    return true;
}

type IndicatorReportTableProps = {
  indicators: Indicator[]
  onExport: (data: Indicator[], columns: ColumnDef<Indicator>[]) => void;
}

export function IndicatorReportTable({ indicators, onExport }: IndicatorReportTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [date, setDate] = React.useState<DateRange | undefined>()
  const [selectedIndicator, setSelectedIndicator] = React.useState<Indicator | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const columns: ColumnDef<Indicator>[] = [
    {
      accessorKey: "indicator",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Indikator <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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
        const unit = row.original.standardUnit;
        return <div className="text-right">{`${standard}${unit}`}</div>;
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
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => <ActionsCell row={row} onDetailClick={() => { setSelectedIndicator(row.original); setIsDetailOpen(true); }} />,
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
    state: { sorting, columnFilters },
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
          onChange={(event) => table.getColumn("indicator")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button id="date" variant={"outline"} className={cn("flex-1 min-w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (date.to ? (<>{format(date.from, "LLL y")} - {format(date.to, "LLL y")}</>) : (format(date.from, "LLL y"))) : (<span>Pilih rentang periode</span>)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} captionLayout="dropdown-buttons" fromYear={2020} toYear={new Date().getFullYear()} />
          </PopoverContent>
        </Popover>
         <Button variant="outline" className="ml-auto" onClick={() => onExport(table.getFilteredRowModel().rows.map(row => row.original), columns.filter(c => c.id !== 'actions'))}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Laporan
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada hasil.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
      </div>
      <ReportDetailDialog indicator={selectedIndicator} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </div>
  )
}
