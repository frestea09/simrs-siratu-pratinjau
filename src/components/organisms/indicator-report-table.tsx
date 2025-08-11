
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
import { ArrowUpDown, Download, Filter } from "lucide-react"
import { format, parseISO } from "date-fns"
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
import { Indicator, IndicatorCategory } from "@/store/indicator-store"
import { Badge } from "../ui/badge"
import { ActionsCell } from "./indicator-report-table/actions-cell"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"

declare module '@tanstack/react-table' {
    interface FilterFns {
        dateRangeFilter: FilterFn<RowData>
        categoryFilter: FilterFn<RowData>
    }
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

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder="Cari nama indikator..."
          value={(table.getColumn("indicator")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("indicator")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
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
          {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
      </div>
    </div>
  )
}
