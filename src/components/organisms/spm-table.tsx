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
import { SpmIndicator } from "@/store/spm-store"

type SpmTableProps = {
  indicators: SpmIndicator[]
}

export function SpmTable({ indicators }: SpmTableProps) {

  const getStatusBadge = (notes?: string) => {
    if (notes && notes.trim() !== '') {
      return <Badge variant="destructive">Ada Catatan</Badge>
    }
    return <Badge variant="default">Tercapai</Badge>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Indikator</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Capaian 2024</TableHead>
          <TableHead>Keterangan</TableHead>
          <TableHead className="text-center">Checklist</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {indicators.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.indicator}</TableCell>
            <TableCell>{item.target}</TableCell>
            <TableCell className="font-semibold">{item.achievement}</TableCell>
            <TableCell>{item.notes || "-"}</TableCell>
            <TableCell className="text-center">
              {getStatusBadge(item.notes)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
