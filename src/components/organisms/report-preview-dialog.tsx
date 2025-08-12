
"use client"

import React from "react"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "../ui/scroll-area"
import { Printer } from "lucide-react"
import { format } from "date-fns"

type ReportPreviewDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: TData[]
  columns?: ColumnDef<TData, any>[]
  title: string
  description?: string
  lineChart?: React.ReactNode
  barChart?: React.ReactNode
  analysisTable?: React.ReactNode
  children?: React.ReactNode // Allow custom content
}

export function ReportPreviewDialog<TData>({
  open,
  onOpenChange,
  data,
  columns,
  title,
  description,
  lineChart,
  barChart,
  analysisTable,
  children
}: ReportPreviewDialogProps<TData>) {
  const reportRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns: columns || [],
    getCoreRowModel: getCoreRowModel(),
  })
  
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    if (printWindow && reportRef.current) {
        printWindow.document.write('<html><head><title>Cetak Laporan</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          @page { 
            size: landscape; 
            margin: 20px; 
          }
          .no-print { display: none; }
          .print-page-break { page-break-after: always; }
          .print-header {
              text-align: center;
              margin-bottom: 1rem;
          }
          .print-header h1 {
              font-size: 1.5rem;
              font-weight: bold;
          }
            .print-header p {
              font-size: 0.875rem;
              color: #6B7280;
          }
          .print-page {
              break-inside: avoid;
          }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 4px; text-align: left; vertical-align: top; font-size: 10px; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: center; vertical-align: middle; }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body class="bg-white">');
        printWindow.document.write(reportRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { 
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  }

  const renderDataTable = () => (
     <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id} className="font-bold text-black">
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                    </TableHead>
                    )
                })}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-4">
                        {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                        )}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell
                    colSpan={columns?.length || 1}
                    className="h-24 text-center"
                >
                    Tidak ada data.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  )

  const renderHeader = (pageTitle: string) => (
    <header className="print-header">
      <h1 className="text-2xl font-bold text-center">{pageTitle}</h1>
      <p className="text-center text-sm text-gray-600">RSUD Oto Iskandar Dinata</p>
    </header>
  )

  const renderFooter = () => (
     <footer className="mt-6 text-xs text-gray-500">
        <p>Tanggal Cetak: {format(new Date(), "d MMMM yyyy HH:mm")}</p>
    </footer>
  )

  const hasCharts = !!lineChart || !!barChart;
  const hasDataTables = (columns && data.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full">
        <DialogHeader>
          <DialogTitle>Pratinjau Laporan</DialogTitle>
          <DialogDescription>
            {description || "Pratinjau laporan sebelum diunduh atau dicetak. Laporan akan dibagi menjadi beberapa halaman untuk kejelasan."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] bg-gray-200/50 p-4 rounded-md">
          <div ref={reportRef} className="p-4 bg-white text-black space-y-8">
            {children ? (
                 <div className="print-page">
                    {renderHeader(title)}
                    <div className="mt-6">{children}</div>
                    {renderFooter()}
                </div>
            ) : (
                <>
                    {lineChart && (
                        <div className="print-page">
                            {renderHeader("Grafik Tren (Line Chart)")}
                            <div className="mt-6">{lineChart}</div>
                            {renderFooter()}
                        </div>
                    )}

                    {barChart && (
                        <>
                            {(lineChart) && <div className="print-page-break"></div>}
                            <div className="print-page">
                                {renderHeader("Grafik Perbandingan (Bar Chart)")}
                                <div className="mt-6">{barChart}</div>
                                {renderFooter()}
                            </div>
                        </>
                    )}
                
                    {hasDataTables && (
                        <>
                            {hasCharts && <div className="print-page-break"></div>}
                            <div className="print-page">
                                {renderHeader(title)}
                                <div className="mt-6">{renderDataTable()}</div>
                                {renderFooter()}
                            </div>
                        </>
                    )}

                    {analysisTable && (
                        <>
                            {(hasCharts || hasDataTables) && <div className="print-page-break"></div>}
                            <div className="print-page">
                                {renderHeader("Tabel Analisis & Tindak Lanjut")}
                                <div className="mt-6">{analysisTable}</div>
                                {renderFooter()}
                            </div>
                        </>
                    )}
                </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Laporan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
