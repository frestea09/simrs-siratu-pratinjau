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
      case "Tinggi":
        return "destructive"
      case "Sangat Tinggi":
        return "destructive"
      case "Sedang":
        return "outline"
      case "Rendah":
        return "secondary"
      default:
        return "default"
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
          <TableHead>Tanggal Lapor</TableHead>
          <TableHead>Jenis Insiden</TableHead>
          <TableHead>Tingkat Risiko</TableHead>
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
