
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
  children?: React.ReactNode // Allow custom content
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
  children,
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
          .print-page-break { 
            page-break-after: always; 
            margin-top: 2rem; 
            margin-bottom: 2rem;
          }
          .print-header {
              text-align: center;
              margin-bottom: 1rem;
              padding-top: 1rem;
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
              padding-top: 1rem;
              padding-bottom: 1rem;
          }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 4px; text-align: left; vertical-align: top; font-size: 10px; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: center; vertical-align: middle; }
          h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body class="bg-white">');
        
        const contentToPrint = reportRef.current.cloneNode(true) as HTMLDivElement;
        
        // Remove ResponsiveContainer wrappers for printing to allow charts to render statically
        contentToPrint.querySelectorAll('.recharts-responsive-container').forEach(container => {
          const wrapper = container.firstChild as HTMLElement;
          if (wrapper) {
            wrapper.style.width = '100%';
            wrapper.style.height = '300px'; // fixed height for printing
            container.parentNode?.replaceChild(wrapper, container);
          }
        });

        printWindow.document.write(contentToPrint.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { 
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  }
  
  const renderHeader = (isFirstPage: boolean = false) => (
    <header className="print-header">
       {isFirstPage && (
         <>
          <h1 className="text-2xl font-bold text-center">{title}</h1>
          <p className="text-center text-sm text-gray-600">RSUD Oto Iskandar Dinata</p>
          {description && <p className="text-center text-sm text-gray-500 mt-1">{description}</p>}
         </>
       )}
    </header>
  )

  const renderFooter = () => (
     <footer className="mt-6 text-xs text-gray-500">
        <p>Tanggal Cetak: {format(new Date(), "d MMMM yyyy HH:mm")}</p>
    </footer>
  )

  const renderDefaultTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length || 1} className="h-24 text-center">
                Tidak ada data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full">
        <DialogHeader>
          <DialogTitle>Pratinjau Laporan</DialogTitle>
          <DialogDescription>
            Pratinjau laporan sebelum diunduh atau dicetak. Anda dapat menyalin konten ini dan menempelkannya ke Word atau Google Docs.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] bg-gray-200/50 p-4 rounded-md">
            <div ref={reportRef} className="p-4 bg-white text-black space-y-8">
              {renderHeader(true)}
              {children ? children : (
                <>
                  {lineChart && (
                      <div className="print-page">
                          <h3 className="text-lg font-semibold mb-4">Grafik Tren (Garis)</h3>
                          {lineChart}
                      </div>
                  )}
                  {barChart && (
                      <div className="print-page">
                          <h3 className="text-lg font-semibold mb-4">Grafik Tren (Batang)</h3>
                          {barChart}
                      </div>
                  )}
                   {analysisTable && (
                      <div className="print-page">
                          <h3 className="text-lg font-semibold mb-4">Analisis & Rencana Tindak Lanjut</h3>
                          {analysisTable}
                      </div>
                  )}
                  {columns && data && (
                      <div className="print-page">
                           <h3 className="text-lg font-semibold mb-4">Data Lengkap</h3>
                          {renderDefaultTable()}
                      </div>
                  )}
                </>
              )}
              {renderFooter()}
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
