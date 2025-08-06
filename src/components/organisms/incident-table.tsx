
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, Eye, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Separator } from "../ui/separator"

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-2">
        <h4 className="font-semibold text-primary">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm pl-2">{children}</div>
    </div>
)

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex flex-col">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "-"}</p>
    </div>
)

const IncidentDetailDialog = ({ incident, open, onOpenChange }: { incident: Incident | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
    if (!incident) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detail Laporan Insiden - {incident.id}</DialogTitle>
                    <DialogDescription>
                        Dilaporkan pada {new Date(incident.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6 py-4">
                    <DetailSection title="Informasi Pasien">
                        <DetailItem label="Nama Pasien" value={incident.patientName} />
                        <DetailItem label="No. Rekam Medis" value={incident.medicalRecordNumber} />
                        <DetailItem label="Ruang Perawatan" value={incident.careRoom} />
                        <DetailItem label="Kelompok Umur" value={incident.ageGroup} />
                        <DetailItem label="Jenis Kelamin" value={incident.gender} />
                        <DetailItem label="Penanggung Biaya" value={incident.payer} />
                        <DetailItem label="Tanggal Masuk RS" value={new Date(incident.entryDate || Date.now()).toLocaleDateString('id-ID')} />
                        <DetailItem label="Jam Masuk RS" value={incident.entryTime} />
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Rincian Kejadian">
                         <DetailItem label="Tanggal Insiden" value={new Date(incident.incidentDate || Date.now()).toLocaleDateString('id-ID')} />
                         <DetailItem label="Jam Insiden" value={incident.incidentTime} />
                         <DetailItem label="Jenis Insiden" value={incident.type} />
                         <DetailItem label="Insiden Mengenai" value={incident.incidentSubject} />
                         <DetailItem label="Lokasi Insiden" value={incident.incidentLocation} />
                         <DetailItem label="Unit Terkait" value={incident.relatedUnit} />
                         <div className="md:col-span-2">
                             <DetailItem label="Kronologis Insiden" value={<p className="whitespace-pre-wrap">{incident.chronology}</p>} />
                         </div>
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Tindak Lanjut & Analisis">
                         <div className="md:col-span-2">
                            <DetailItem label="Tindakan Segera" value={<p className="whitespace-pre-wrap">{incident.firstAction}</p>} />
                         </div>
                         <DetailItem label="Tindakan Dilakukan Oleh" value={incident.firstActionBy} />
                         <DetailItem label="Pernah Terjadi di Unit Lain?" value={incident.hasHappenedBefore} />
                         <DetailItem label="Grading Risiko" value={incident.severity} />
                    </DetailSection>
                     <Separator />
                    <DetailSection title="Informasi Pelapor">
                        <DetailItem label="Nama Pelapor" value={incident.reporterName} />
                        <DetailItem label="Unit Kerja Pelapor" value={incident.reporterUnit} />
                    </DetailSection>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
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
      cell: ({ row }) => <div>{row.getValue("type")}</div>,
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
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, rowSelection },
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
       <IncidentDetailDialog 
        incident={selectedIncident}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}

    