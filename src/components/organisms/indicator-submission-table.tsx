
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SubmittedIndicator } from "@/store/indicator-store"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

type IndicatorSubmissionTableProps = {
  indicators: SubmittedIndicator[]
}

export function IndicatorSubmissionTable({ indicators }: IndicatorSubmissionTableProps) {
    const getStatusVariant = (status: SubmittedIndicator['status']) => {
        switch (status) {
            case 'Diverifikasi':
                return 'default'
            case 'Menunggu Persetujuan':
                return 'secondary'
            case 'Ditolak':
                return 'destructive'
            default:
                return 'outline'
        }
    }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nama Indikator</TableHead>
          <TableHead>Frekuensi</TableHead>
          <TableHead>Tgl. Pengajuan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {indicators.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.frequency}</TableCell>
            <TableCell>{item.submissionDate}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
