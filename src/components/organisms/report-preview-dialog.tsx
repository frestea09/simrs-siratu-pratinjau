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

    if (!data) return

    const colorMap: Record<string, { bg: string; color: string }> = {
      biru: { bg: "#3B82F6", color: "#FFFFFF" },
      hijau: { bg: "#22C55E", color: "#FFFFFF" },
      kuning: { bg: "#EAB308", color: "#000000" },
      merah: { bg: "#EF4444", color: "#FFFFFF" },
    }

    const headerHtml = `
      <tr>
        <th rowspan="2">No</th>
        <th rowspan="2">Ruangan</th>
        <th rowspan="2">Tanggal Kejadian</th>
        <th rowspan="2">Identitas Pasien ( Nama & No RM)</th>
        <th rowspan="2">Kronologis</th>
        <th rowspan="2">Tipe Insiden</th>
        <th colspan="4">Kejadian</th>
        <th colspan="4">Risk Grading Matrik</th>
        <th rowspan="2">Tindakan</th>
        <th rowspan="2">Rekomendasi</th>
        <th rowspan="2">Laporan unit</th>
      </tr>
      <tr>
        <th>KPC</th>
        <th>KNC</th>
        <th>KTD</th>
        <th>Sentinel</th>
        <th>Biru</th>
        <th>Hijau</th>
        <th>Kuning</th>
        <th>Merah</th>
      </tr>
    `

    const rowsHtml = data
      .map((row, idx) => {
        const incidentType = (row["type"] || "").toLowerCase()
        const severity = row["severity"]
        const sevCells = ["biru", "hijau", "kuning", "merah"].map((sev) => {
          const map = colorMap[sev]
          const check = severity === sev ? "✓" : ""
          return `<td style="background-color:${map.bg};color:${map.color};text-align:center">${check}</td>`
        })

        const fmtDate = (value: any) => {
          try {
            return value ? format(new Date(value), "yyyy-MM-dd") : ""
          } catch {
            return ""
          }
        }

        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${row["incidentLocation"] ?? row["careRoom"] ?? ""}</td>
            <td>${fmtDate(row["incidentDate"])}</td>
            <td>${[row["patientName"], row["medicalRecordNumber"]].filter(Boolean).join(" / ")}</td>
            <td>${row["chronology"] ?? ""}</td>
            <td>${row["type"] ?? ""}</td>
            <td>${incidentType === "kpc" ? "✓" : ""}</td>
            <td>${incidentType === "knc" ? "✓" : ""}</td>
            <td>${incidentType === "ktd" || incidentType === "ktc" ? "✓" : ""}</td>
            <td>${incidentType === "sentinel" ? "✓" : ""}</td>
            ${sevCells.join("")}
            <td>${row["firstAction"] ?? ""}</td>
            <td>${row["followUpPlan"] ?? ""}</td>
            <td>${row["relatedUnit"] ?? ""}</td>
          </tr>
        `
      })
      .join("")

    const tableHtml = `<table border="1"><thead>${headerHtml}</thead><tbody>${rowsHtml}</tbody></table>`

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
  }, [csvData, onDownload, data, title])

  const showDownload = !!csvData || (data && data.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {(description || chartDescription) && (
            <DialogDescription>{description || chartDescription}</DialogDescription>
          )}
        </DialogHeader>
        {csvData ? (
          <div className="max-h-[60vh] overflow-auto rounded border bg-muted p-4">
            <pre className="whitespace-pre-wrap text-xs">{csvData}</pre>
          </div>
        ) : (
          <div className="space-y-4">
            {lineChart}
            {barChart}
            {analysisTable}
            {table.getRowModel().rows.length > 0 && (
              <div className="max-h-[60vh] overflow-auto rounded border">
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

