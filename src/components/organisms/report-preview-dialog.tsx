"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import * as XLSX from "xlsx"
import { format } from "date-fns"

interface ReportPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  csvData?: string
  onDownload?: () => void
  data?: any[]
  columns?: ColumnDef<any>[]
  title?: string
  description?: string
  chartDescription?: string
  lineChart?: React.ReactNode
  barChart?: React.ReactNode
  analysisTable?: React.ReactNode
  children?: React.ReactNode
}

export function ReportPreviewDialog({
  open,
  onOpenChange,
  csvData,
  onDownload,
  data,
  columns,
  title,
  description,
  chartDescription,
  lineChart,
  barChart,
  analysisTable,
  children
}: ReportPreviewDialogProps) {
  const table = useReactTable({
    data: data || [],
    columns: columns || [],
    getCoreRowModel: getCoreRowModel(),
  })

  const handleDownload = React.useCallback(() => {
    if (csvData && onDownload) {
      onDownload()
      return
    }

    if (!data || !columns) return

    const headers = ["No", ...columns.map((col) => {
      if (typeof col.header === "string") return col.header
      if (col.accessorKey) return String(col.accessorKey)
      if (col.id) return String(col.id)
      return ""
    })]

    const rows = data.map((row, idx) => {
      return [
        idx + 1,
        ...columns.map((col) => {
          const key = col.accessorKey as string
          let value = row[key]
          if (key === "date" && value) {
            try {
              value = format(new Date(value), "yyyy-MM-dd")
            } catch (_) {}
          }
          return value
        }),
      ]
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const severityIndex = columns.findIndex((c) => c.accessorKey === "severity")
    if (severityIndex >= 0) {
      const colorMap: Record<string, { fg: string; font: string; label: string }> = {
        biru: { fg: "3B82F6", font: "FFFFFF", label: "BIRU (Rendah)" },
        hijau: { fg: "22C55E", font: "FFFFFF", label: "HIJAU (Sedang)" },
        kuning: { fg: "EAB308", font: "000000", label: "KUNING (Tinggi)" },
        merah: { fg: "EF4444", font: "FFFFFF", label: "MERAH (Sangat Tinggi)" },
      }
      data.forEach((row, idx) => {
        const sev = row["severity"]
        const map = colorMap[sev]
        if (!map) return
        const cellRef = XLSX.utils.encode_cell({ r: idx + 1, c: severityIndex + 1 }) // +1 for No column
        const cell = worksheet[cellRef]
        if (cell) {
          cell.v = map.label
          cell.s = {
            fill: { fgColor: { rgb: map.fg } },
            font: { color: { rgb: map.font } },
          }
        }
      })
    }

    worksheet["!cols"] = headers.map(() => ({ wch: 20 }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan")
    const fileName = (title ? title.replace(/\s+/g, "_") : "laporan") + ".xlsx"
    XLSX.writeFile(workbook, fileName)
  }, [csvData, onDownload, data, columns, title])

  const showDownload = !!csvData || (data && data.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {(description || chartDescription) && (
            <DialogDescription>{description || chartDescription}</DialogDescription>
          )}
        </DialogHeader>
        {csvData ? (
          <div className="max-h-96 overflow-auto rounded border bg-muted p-4">
            <pre className="whitespace-pre-wrap text-xs">{csvData}</pre>
          </div>
        ) : (
          <div className="space-y-4">
            {lineChart}
            {barChart}
            {analysisTable}
            {table.getRowModel().rows.length > 0 && (
              <div className="max-h-96 overflow-auto rounded border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        <TableHead>No</TableHead>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row, i) => (
                      <TableRow key={row.id}>
                        <TableCell>{i + 1}</TableCell>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {children}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          {showDownload && (
            <Button onClick={handleDownload}>Unduh</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

