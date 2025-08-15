"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTableState } from "@/hooks/use-table-state"
import { ActionsCell } from "./indicator-submission-table/actions-cell"
import { TableFilters, dateRangeFilter, categoryFilter, statusFilter, getStatusVariant } from "./indicator-submission-table/table-filters"
import type { IndicatorSubmission, IndicatorCategory, User } from "@prisma/client"


export const statusOptions: IndicatorSubmission['status'][] = ['Menunggu Persetujuan', 'Diverifikasi', 'Ditolak'];
export const categoryOptions: {value: IndicatorCategory, label: string}[] = [
    { value: 'INM', label: 'INM'},
    { value: 'IMP_RS', label: 'IMP-RS'},
    { value: 'IMPU', label: 'IMPU'},
    { value: 'SPM', label: 'SPM'},
]

type IndicatorSubmissionTableProps = {
  indicators: IndicatorSubmission[]
  currentUser: User | null
}

export function IndicatorSubmissionTable({ indicators, currentUser }: IndicatorSubmissionTableProps) {
  const { tableState, setTableState } = useTableState({
    columnVisibility: { id: false },
  });

  const columns: ColumnDef<IndicatorSubmission>[] = React.useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nama Indikator <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
      filterFn: 'categoryFilter',
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => <div>{row.getValue("unit")}</div>,
    },
    {
      accessorKey: "submissionDate",
      header: "Tgl. Pengajuan",
      cell: ({ row }) => <div>{format(new Date(row.getValue("submissionDate")), "dd MMM yyyy")}</div>,
      filterFn: 'dateRangeFilter',
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.getValue("status"))}>{row.getValue("status")}</Badge>
      ),
      filterFn: 'statusFilter',
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => <ActionsCell row={row} currentUser={currentUser} />,
    },
  ], [currentUser]);

  const table = useReactTable({
    data: indicators,
    columns,
    filterFns: { dateRangeFilter, categoryFilter, statusFilter },
    onSortingChange: setTableState.setSorting,
    onColumnFiltersChange: setTableState.setColumnFilters,
    onColumnVisibilityChange: setTableState.setColumnVisibility,
    onRowSelectionChange: setTableState.setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: tableState,
  })

  return (
    <div className="w-full">
      <TableFilters table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
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
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
        </div>
      </div>
    </div>
  )
}