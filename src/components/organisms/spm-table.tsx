
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
  FilterFn
} from "@tanstack/react-table"
import { Calendar as CalendarIcon, ArrowUpDown, Download } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

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
import { Badge } from "@/components/ui/badge"
import { SpmIndicator } from "@/store/spm-store"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { ActionsCell } from "./spm-table/actions-cell"

const dateRangeFilter: FilterFn<SpmIndicator> = (row, columnId, value, addMeta) => {
    const date = new Date(row.original.reportingDate);
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

const getStatusBadge = (notes?: string) => {
    return notes && notes.trim() !== ''
        ? <Badge variant="destructive">Ada Catatan</Badge>
        : <Badge variant="default">Tercapai</Badge>;
}

type SpmTableProps = {
  indicators: SpmIndicator[];
  onExport: (data: SpmIndicator[], columns: ColumnDef<SpmIndicator>[]) => void;
}

export function SpmTable({ indicators, onExport }: SpmTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [date, setDate] = React.useState<DateRange | undefined>()

  const columns: ColumnDef<SpmIndicator>[] = [
    {
        accessorKey: "serviceType",
        header: "Jenis Pelayanan",
        cell: ({ row }) => <div className="font-medium">{row.getValue("serviceType")}</div>,
    },
    {
        accessorKey: "indicator",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Indikator <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="pl-4">{row.getValue("indicator")}</div>,
    },
     {
      accessorKey: "reportingDate",
      header: "Tgl. Laporan",
      cell: ({ row }) => <div>{format(new Date(row.getValue("reportingDate")), "dd MMM yyyy")}</div>,
      filterFn: dateRangeFilter,
    },
    {
        accessorKey: "achievement",
        header: "Capaian",
        cell: ({ row }) => <div className="font-semibold">{row.getValue("achievement")}</div>,
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.notes),
    },
    {
        id: "actions",
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => <ActionsCell row={row} />,
    }
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
    table.getColumn("reportingDate")?.setFilterValue(from || to ? [from, to] : undefined);
  }, [date, table]);


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder="Cari berdasarkan nama indikator..."
          value={(table.getColumn("indicator")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("indicator")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button id="date" variant={"outline"} className={cn("flex-1 min-w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Pilih rentang tanggal</span>)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
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
                {headerGroup.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada hasil.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
      </div>
    </div>
  )
}
