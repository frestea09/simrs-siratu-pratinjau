"use client"

import { ColumnDef, FilterFn } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Incident, IncidentStatus } from "@/store/incident-store"
import { ActionsCell } from "./incident-table/actions-cell"

const noopFilter: FilterFn<Incident> = () => true

export const filterFns = {
  dateRangeFilter: noopFilter,
  categoryFilter: noopFilter,
  statusFilter: noopFilter,
}

export function getColumns(onViewDetails: (incident: Incident) => void): ColumnDef<Incident>[] {
  return [
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
      cell: ({ row }) => <div>{new Date(row.getValue("date")).toLocaleDateString("id-ID")}</div>,
    },
    {
      accessorKey: "type",
      header: "Jenis Insiden",
    },
    {
      accessorKey: "severity",
      header: "Tingkat Risiko",
      cell: ({ row }) => {
        const severity = row.getValue("severity") as Incident["severity"]
        const severityMap: Record<Incident["severity"], string> = {
          biru: "BIRU (Rendah)",
          hijau: "HIJAU (Sedang)",
          kuning: "KUNING (Tinggi)",
          merah: "MERAH (Sangat Tinggi)",
        }
        const colorMap: Record<Incident["severity"], string> = {
          biru: "bg-blue-500 text-white border-blue-500 hover:bg-blue-500/80",
          hijau: "bg-green-500 text-white border-green-500 hover:bg-green-500/80",
          kuning: "bg-yellow-500 text-yellow-900 border-yellow-500 hover:bg-yellow-500/80",
          merah: "bg-red-500 text-white border-red-500 hover:bg-red-500/80",
        }
        return (
          <Badge variant="outline" className={colorMap[severity]}>
            {severityMap[severity]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as IncidentStatus
        const statusClass =
          status === "Investigasi"
            ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30"
            : ""
        return (
          <Badge
            variant={status === "Selesai" ? "default" : "secondary"}
            className={cn("capitalize", statusClass)}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell row={row} onViewDetails={onViewDetails} />,
    },
  ]
}

export function getExportColumns(columns: ColumnDef<Incident>[]): ColumnDef<Incident>[] {
  return columns
    .filter((c) => c.id !== "actions")
    .map((c) => (c.id === "date" ? { ...c, header: "Tanggal Lapor" } : c))
}

