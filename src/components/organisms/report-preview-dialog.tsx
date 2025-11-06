
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Download, Copy } from "lucide-react"

import { ReportPreviewDialogProps } from "./report-preview-dialog.interface"
import { printReport } from "./report-preview-dialog.print"
import { copyReport } from "./report-preview-dialog.copy"
import { defaultFilterFns } from "@/lib/default-filter-fns"
import { useToast } from "@/hooks/use-toast"

export function ReportPreviewDialog({
  open,
  onOpenChange,
  data,
  columns,
  title,
  description,
  chartDescription,
  lineChart,
  barChart,
  analysisTable,
  children,
}: ReportPreviewDialogProps) {
  const table = useReactTable({
    data: data || [],
    columns: columns || [],
    filterFns: defaultFilterFns,
    getCoreRowModel: getCoreRowModel(),
  })

  const dialogContentRef = React.useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <div ref={dialogContentRef} className="flex-1 overflow-hidden space-y-6 flex flex-col">
          <DialogHeader>
            {title && (
              <DialogTitle data-dialog-title className="text-2xl">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div
            data-export-scroll
            className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-6"
          >
            {children}
            {analysisTable && (
              <div className="print-page">
                <h3 className="text-lg font-semibold mb-2">Analisis dan Rencana Tindak Lanjut</h3>
                {analysisTable}
              </div>
            )}
            {lineChart && (
              <div className="print-page">
                <h3 className="text-lg font-semibold mb-2">Grafik Garis</h3>
                {chartDescription && <p className="text-sm text-muted-foreground mb-4">{chartDescription}</p>}
                {lineChart}
              </div>
            )}
            {barChart && (
              <div className="print-page">
                <h3 className="text-lg font-semibold mb-2">Grafik Batang</h3>
                {chartDescription && <p className="text-sm text-muted-foreground mb-4">{chartDescription}</p>}
                {barChart}
              </div>
            )}
            {data && data.length > 0 && columns && columns.length > 0 && (
              <div className="print-page">
                <h3 className="text-lg font-semibold mb-2">Data Tabel</h3>
                <div className="rounded border">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
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
                      {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
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
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4 no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await copyReport(dialogContentRef.current)
                toast({
                  title: "Laporan Disalin",
                  description: "Konten laporan siap ditempel ke Word.",
                })
              } catch {
                toast({
                  title: "Gagal Menyalin",
                  description: "Terjadi kesalahan saat menyalin laporan.",
                  variant: "destructive",
                })
              }
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Salin Teks
          </Button>
          <Button onClick={() => printReport(dialogContentRef.current)}>
            <Download className="mr-2 h-4 w-4" />
            Cetak / Unduh PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
