
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
import { MoreHorizontal, Eye, ArrowUpDown, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Incident } from "@/store/incident-store"
import { IncidentReportDialog } from "./incident-report-dialog"
import { IncidentDetailDialog } from "./incident-detail-dialog"

type IncidentTableProps = {
  incidents: Incident[];
  onExport: (data: Incident[], columns: ColumnDef<Incident>[]) => void;
}

export function IncidentTable({ incidents, onExport }: IncidentTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "Tinggi": case "Sangat Tinggi": return "destructive"
      case "Sedang": return "outline"
      case "Rendah": return "secondary"
      default: return "default"
    }
  }

  const columns: ColumnDef<Incident>[] = [
    {
      accessorKey: "id",
      header: "ID Insiden",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Tanggal Lapor <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{new Date(row.getValue("date")).toLocaleDateString('id-ID')}</div>,
    },
    {
      accessorKey: "type",
      header: "Jenis Insiden",
    },
    {
      accessorKey: "severity",
      header: "Tingkat Risiko",
      cell: ({ row }) => <Badge variant={getSeverityVariant(row.getValue("severity"))}>{row.getValue("severity")}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusClass = status === 'Investigasi' ? 'bg-yellow-500/20 text-yellow-700' : ''
        return <Badge variant={status === 'Selesai' ? 'default' : 'secondary'} className={statusClass}>{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const incident = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedIncident(incident);
                setIsDetailOpen(true);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <IncidentReportDialog incident={incident} />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(incident.id)}>
                Salin ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: incidents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari berdasarkan jenis insiden..."
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("type")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Berikutnya
        </Button>
      </div>
       <IncidentDetailDialog 
        incident={selectedIncident}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
