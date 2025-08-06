"use client"

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

type IncidentTableProps = {
  incidents: Incident[]
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "Rendah":
        return "secondary"
      case "Sedang":
        return "outline"
      default:
        return "destructive"
    }
  }

  const getStatusClass = (status: string) => {
    return status === 'Investigasi' ? 'bg-yellow-500/20 text-yellow-700' : ''
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Insiden</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Jenis Insiden</TableHead>
          <TableHead>Tingkat</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>
              <Badge variant={getSeverityVariant(item.severity)}>{item.severity}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.status === 'Selesai' ? 'default' : 'secondary'} className={getStatusClass(item.status)}>
                {item.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
