
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Download } from "lucide-react"

interface ReportPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

// Simple unique ID generator
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;

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
    getCoreRowModel: getCoreRowModel(),
  })

  const contentRef = React.useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = contentRef.current;
    if (!content) return;
    
    // Assign unique IDs to charts to re-render them for printing
    const charts = content.querySelectorAll('canvas');
    charts.forEach(c => c.setAttribute('data-chart-id', uid()));

    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) {
      alert("Please allow popups for this website");
      return;
    }

    const contentHtml = content.innerHTML;
    
    printWindow.document.write(`<!DOCTYPE html>
      <html>
        <head>
          <title>${title || "Laporan"}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 1.5cm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print-page { break-before: page; }
              .print-page-break { break-after: page; }
              .no-print { display: none; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; }
            th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; }
            th { background-color: #f1f5f9; }
            .print-page { page-break-before: always; padding-top: 2rem; }
            .print-page:first-child { page-break-before: avoid; padding-top: 0; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
            h2 { font-size: 20px; font-weight: bold; margin-bottom: 12px; }
            h3 { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="p-4">
             <h1>${title || "Laporan"}</h1>
             <p>${description || ""}</p>
             <div class="mt-8">
               ${contentHtml}
             </div>
          </div>
        </body>
      </html>`
    );
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500); // Wait for content to render
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          {title && <DialogTitle className="text-2xl">{title}</DialogTitle>}
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div ref={contentRef} className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-6">
            {children}
             {analysisTable}
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

        <div className="flex justify-end gap-2 pt-4 border-t mt-4 no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Cetak / Unduh PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
