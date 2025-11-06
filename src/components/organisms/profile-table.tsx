
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
import { id as IndonesianLocale } from "date-fns/locale"

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
import { IndicatorProfile } from "@/store/indicator-store"
import { useTableState } from "@/hooks/use-table-state"
import { ActionsCell } from "./profile-table/actions-cell"
import { Input } from "../ui/input"
import { defaultFilterFns } from "@/lib/default-filter-fns"
import { useUserStore } from "@/store/user-store.tsx"
import { centralRoles } from "@/store/central-roles"

export const getStatusVariant = (status: IndicatorProfile['status']) => {
    switch (status) {
        case 'Disetujui': return 'default'
        case 'Menunggu Persetujuan': return 'secondary'
        case 'Ditolak': return 'destructive'
        case 'Draf': return 'outline'
        default: return 'outline'
    }
}


type ProfileTableProps = {
  profiles: IndicatorProfile[]
}

export function ProfileTable({ profiles }: ProfileTableProps) {
  const { tableState, setTableState } = useTableState({
    sorting: [{ id: "createdAt", desc: true }]
  });
  const { currentUser } = useUserStore()
  const currentUserId = currentUser?.id
  const currentUserIsCentral = currentUser ? centralRoles.includes(currentUser.role) : false

  const columns: ColumnDef<IndicatorProfile>[] = React.useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Judul Profil Indikator <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const profile = row.original
        const hasFullActions = currentUserIsCentral || (!!currentUserId && profile.createdBy === currentUserId)
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue("title")}</span>
            {hasFullActions && (
              <Badge variant="secondary">Aksi Lengkap</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "unit",
      header: "Unit",
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Dibuat",
      cell: ({ row }) => <div>{format(new Date(row.getValue("createdAt")), "dd MMM yyyy", {locale: IndonesianLocale})}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.getValue("status"))}>{row.getValue("status")}</Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => <ActionsCell row={row} />,
    },
  ], [currentUserId, currentUserIsCentral]);

  const table = useReactTable({
    data: profiles,
    columns,
    filterFns: defaultFilterFns,
    onSortingChange: setTableState.setSorting,
    onColumnFiltersChange: setTableState.setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: tableState,
  })

  return (
    <div className="w-full">
        <div className="flex items-center py-4">
            <Input
            placeholder="Cari judul profil..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
      </div>
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada profil indikator.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Menampilkan {table.getFilteredRowModel().rows.length} dari {profiles.length} total profil.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
        </div>
      </div>
    </div>
  )
}
