"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
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

    const severityIndex = columns.findIndex((c) => c.accessorKey === "severity")
    const colorMap: Record<string, { bg: string; color: string; label: string }> = {
      biru: { bg: "#3B82F6", color: "#FFFFFF", label: "BIRU (Rendah)" },
      hijau: { bg: "#22C55E", color: "#FFFFFF", label: "HIJAU (Sedang)" },
      kuning: { bg: "#EAB308", color: "#000000", label: "KUNING (Tinggi)" },
      merah: { bg: "#EF4444", color: "#FFFFFF", label: "MERAH (Sangat Tinggi)" },
    }

    let tableHtml = "<table><thead><tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr></thead><tbody>"

    rows.forEach((row, rIdx) => {
      tableHtml += "<tr>"
      row.forEach((cell, cIdx) => {
        let value = cell ?? ""
        let style = ""
        if (severityIndex >= 0 && cIdx === severityIndex + 1) {
          const sev = data[rIdx]["severity"]
          const map = colorMap[sev]
          if (map) {
            value = map.label
            style = ` style="background-color:${map.bg};color:${map.color};"`
          }
        }
        tableHtml += `<td${style}>${value}</td>`
      })
      tableHtml += "</tr>"
    })

    tableHtml += "</tbody></table>"

    const fileName = (title ? title.replace(/\s+/g, "_") : "laporan") + ".xls"
    const html = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body>${tableHtml}</body></html>`
    const blob = new Blob([html], { type: "application/vnd.ms-excel" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

