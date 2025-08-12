
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
import { Indicator } from "@/store/indicator-store"
import { BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, LineChart, Line, Legend, Dot } from "recharts"

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
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
        printWindow.document.write(`
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                @media print { 
                    @page { 
                        size: landscape; 
                        margin: 20px; 
                    } 
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
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
                }
            </style>
        `);
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
      <h1 className="text-2xl font-bold text-center">{title}</h1>
      <p className="text-center text-sm text-gray-600">{pageTitle}</p>
      <p className="text-center text-xs text-gray-500 mt-1">RSUD Oto Iskandar Dinata</p>
    </header>
  )

  const renderFooter = () => (
     <footer className="mt-6 text-xs text-gray-500">
        <p>Tanggal Cetak: {format(new Date(), "d MMMM yyyy HH:mm")}</p>
    </footer>
  )

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
            {lineChart && (
                <div className="print-page">
                    {renderHeader("Grafik Tren (Line Chart)")}
                    <div className="mt-6">{lineChart}</div>
                    {renderFooter()}
                </div>
            )}

            {barChart && (
                <>
                    <div className="print-page-break"></div>
                    <div className="print-page">
                        {renderHeader("Grafik Perbandingan (Bar Chart)")}
                        <div className="mt-6">{barChart}</div>
                        {renderFooter()}
                    </div>
                </>
            )}
           
           {columns && data && (
                <>
                    <div className="print-page-break"></div>
                    <div className="print-page">
                        {renderHeader("Tabel Data Capaian")}
                        <div className="mt-6">{renderDataTable()}</div>
                        {renderFooter()}
                    </div>
                </>
            )}

            {analysisTable && (
                 <>
                    <div className="print-page-break"></div>
                    <div className="print-page">
                        {renderHeader("Tabel Analisis & Tindak Lanjut")}
                        <div className="mt-6">{analysisTable}</div>
                        {renderFooter()}
                    </div>
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
