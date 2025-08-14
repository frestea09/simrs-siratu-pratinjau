
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
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Indicator } from "@/store/indicator-store"
import { Badge } from "../ui/badge"
import { ActionsCell } from "./indicator-report-table/actions-cell"
import { TableFilters } from "./indicator-report-table/table-filters"
import { categoryFilter } from "./indicator-report-table/table-filters"
import { format, parseISO, isValid } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"


type IndicatorReportTableProps = {
  indicators: Indicator[]
  onExport: (data: Indicator[], columns: ColumnDef<Indicator>[]) => void;
  onEdit: (indicator: Indicator) => void;
  showCategoryFilter?: boolean;
}

export function IndicatorReportTable({ indicators, onExport, onEdit, showCategoryFilter = false }: IndicatorReportTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  const columns: ColumnDef<Indicator>[] = React.useMemo(() => [
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
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Periode <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("period") as string;
        const parsedDate = parseISO(dateValue);
        if (!isValid(parsedDate)) {
            return <span>Tanggal Invalid</span>;
        }
        return <div>{format(parsedDate, "d MMMM yyyy", { locale: IndonesianLocale })}</div>
      },
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
  ], [onEdit])

  const table = useReactTable({
    data: indicators,
    columns,
    filterFns: { categoryFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    initialState: {
        columnVisibility: { category: showCategoryFilter }
    }
  })

  const exportableColumns = React.useMemo(() => columns.filter(c => c.id !== 'actions'), [columns]);

  return (
    <div className="w-full">
      <TableFilters
        table={table}
        showCategoryFilter={showCategoryFilter}
        onExport={() => onExport(table.getFilteredRowModel().rows.map(row => row.original), exportableColumns)}
        showDateFilter={false}
      />
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
