"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Risk } from "@/store/risk-store"
import { Badge } from "@/components/ui/badge"

const ActionsCell = ({ row }: { row: any }) => {
    const risk = row.original
    // const [isEditOpen, setIsEditOpen] = React.useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                    <DropdownMenuItem>Edit Risiko</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {/* <RiskDialog risk={risk} open={isEditOpen} onOpenChange={setIsEditOpen} /> */}
        </>
    )
}

const columns: ColumnDef<Risk>[] = [
  {
    accessorKey: "id",
    header: "No",
    cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Unit Kerja <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
  },
  {
    accessorKey: "source",
    header: "Sumber",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("source")}</Badge>
  },
  {
    accessorKey: "description",
    header: "Deskripsi Risiko",
    cell: ({ row }) => <div className="text-sm">{row.getValue("description")}</div>
  },
  {
    accessorKey: "cause",
    header: "Penyebab",
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("cause")}</div>
  },
   {
    accessorKey: "category",
    header: "Kategori Risiko",
  },
//   {
//     id: "actions",
//     cell: ActionsCell,
//   },
]

type RiskTableProps = {
  risks: Risk[]
}

export function RiskTable({ risks }: RiskTableProps) {
  const [sorting, setSorting] = React.useState<any[]>([])
  
  const table = useReactTable({
    data: risks,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="w-full">
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Belum ada risiko yang diidentifikasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
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
  )
}
