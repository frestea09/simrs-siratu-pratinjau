
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
  RowData,
} from "@tanstack/react-table"
import { ArrowUpDown, Download, Filter, Calendar as CalendarIcon, X as XIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { DateRange } from "react-day-picker"

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
import { Indicator, IndicatorCategory } from "@/store/indicator-store"
import { Badge } from "../ui/badge"
import { ActionsCell } from "./indicator-report-table/actions-cell"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "../ui/calendar"

declare module '@tanstack/react-table' {
    interface FilterFns {
        dateRangeFilter: FilterFn<RowData>
        categoryFilter: FilterFn<RowData>
    }
}

const dateRangeFilter: FilterFn<Indicator> = (row, columnId, value) => {
    const date = new Date(row.original.period);
    const [start, end] = value as [Date | undefined, Date | undefined];

    // No filter applied
    if (!start && !end) return true;

    // Set time to 00:00:00 for start date for accurate comparison
    const startDate = start ? new Date(start.setHours(0, 0, 0, 0)) : null;
    
    // Set time to 23:59:59 for end date for accurate comparison
    const endDate = end ? new Date(end.setHours(23, 59, 59, 999)) : null;

    if (startDate && !endDate) {
        return date >= startDate;
    }
    if (!startDate && endDate) {
        return date <= endDate;
    }
    if (startDate && endDate) {
        return date >= startDate && date <= endDate;
    }
    return true;
}


const categoryFilter: FilterFn<Indicator> = (row, id, value) => {
    return value.includes(row.original.category);
}

const categoryOptions: {value: IndicatorCategory, label: string}[] = [
    { value: 'INM', label: 'INM'},
    { value: 'IMP-RS', label: 'IMP-RS'},
    { value: 'IMPU', label: 'IMPU'},
    { value: 'SPM', label: 'SPM'},
]


type IndicatorReportTableProps = {
  indicators: Indicator[]
  onExport: (data: Indicator[], columns: ColumnDef<Indicator>[]) => void;
  onEdit: (indicator: Indicator) => void;
  showCategoryFilter?: boolean;
}

export function IndicatorReportTable({ indicators, onExport, onEdit, showCategoryFilter = false }: IndicatorReportTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [date, setDate] = React.useState<DateRange | undefined>()
  
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
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
      filterFn: 'categoryFilter',
    },
    {
      accessorKey: "period",
      header: "Periode",
      cell: ({ row }) => <div>{format(parseISO(row.getValue("period")), "d MMMM yyyy", { locale: IndonesianLocale })}</div>,
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
        cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} />,
    },
  ]

  const table = useReactTable({
    data: indicators,
    columns,
    filterFns: {
        dateRangeFilter,
        categoryFilter
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    initialState: {
        columnVisibility: {
            category: showCategoryFilter
        }
    }
  })

  React.useEffect(() => {
    table.getColumn("period")?.setFilterValue(date ? [date.from, date.to] : undefined);
  }, [date, table]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder="Cari nama indikator..."
          value={(table.getColumn("indicator")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("indicator")?.setFilterValue(event.target.value)}
          className="max-w-xs"
        />
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
                    ) : (<span>Pilih rentang tanggal</span>
                    )}
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
                checked={
                  (table.getColumn("category")?.getFilterValue() as string[] | undefined)?.includes(cat.value) ?? false
                }
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
          Menampilkan {table.getFilteredRowModel().rows.length} dari {indicators.length} total data.
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
      </div>
    </div>
  )
}

    