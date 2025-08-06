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

const getStatusBadge = (notes?: string) => {
    if (notes && notes.trim() !== '') {
      return <Badge variant="destructive">Ada Catatan</Badge>
    }
    return <Badge variant="default">Tercapai</Badge>
}

export const columns: ColumnDef<SpmIndicator>[] = [
    {
        accessorKey: "serviceType",
        header: "Jenis Pelayanan",
        cell: ({ row }) => <div className="font-medium">{row.getValue("serviceType")}</div>,
    },
    {
        accessorKey: "indicator",
        header: "Indikator",
        cell: ({ row }) => <div>{row.getValue("indicator")}</div>,
    },
    {
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => <div>{row.getValue("target")}</div>,
    },
    {
        accessorKey: "achievement",
        header: "Capaian",
        cell: ({ row }) => <div className="font-semibold">{row.getValue("achievement")}</div>,
    },
    {
        accessorKey: "notes",
        header: "Keterangan",
        cell: ({ row }) => <div>{row.getValue("notes") || "-"}</div>,
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.notes),
    }
]

type SpmTableProps = {
  indicators: SpmIndicator[]
}

export function SpmTable({ indicators }: SpmTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data: indicators,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari berdasarkan nama indikator..."
          value={(table.getColumn("indicator")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("indicator")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
