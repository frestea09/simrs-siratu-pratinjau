
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
import { ArrowUpDown, Download } from "lucide-react"

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
import { Incident, IncidentStatus } from "@/store/incident-store"
import { IncidentDetailDialog } from "./incident-detail-dialog"
import { ActionsCell } from "./incident-table/actions-cell"
import { cn } from "@/lib/utils"

type IncidentTableProps = {
  incidents: Incident[];
  onExport: (data: Incident[], columns: ColumnDef<Incident>[]) => void;
}

export function IncidentTable({ incidents, onExport }: IncidentTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const handleViewDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  }

  const columns: ColumnDef<Incident>[] = React.useMemo(() => [
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
       cell: ({ row }) => {
        const severity = row.getValue("severity") as Incident['severity']
        const severityMap: Record<Incident['severity'], string> = {
            biru: "BIRU (Rendah)",
            hijau: "HIJAU (Sedang)",
            kuning: "KUNING (Tinggi)",
            merah: "MERAH (Sangat Tinggi)",
        }
        const variantMap: Record<Incident['severity'], "default" | "secondary" | "destructive" | "outline"> = {
            biru: "secondary",
            hijau: "default",
            kuning: "outline",
            merah: "destructive"
        }
        return <Badge variant={variantMap[severity]}>{severityMap[severity]}</Badge>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as IncidentStatus;
        const statusClass = status === 'Investigasi' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30' : ''
        return <Badge variant={status === 'Selesai' ? 'default' : 'secondary'} className={cn("capitalize", statusClass)}>{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell row={row} onViewDetails={handleViewDetails} />,
    },
  ], []);

  const table = useReactTable({
    data: incidents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
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
