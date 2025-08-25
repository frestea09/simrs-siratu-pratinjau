
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
  chartDescription?: string
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
  chartDescription,
}: ReportPreviewDialogProps<TData>) {
  const reportRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns: columns || [],
    getCoreRowModel: getCoreRowModel(),
  })
  
  const handlePrint = () => {
    if (!reportRef.current) return;

    const chartContainers = Array.from(
      reportRef.current.querySelectorAll('.recharts-responsive-container')
    ) as HTMLElement[];
    const chartSizes = chartContainers.map((el) => {
      const { width, height } = el.getBoundingClientRect();
      return { width, height };
    });

    const contentToPrint = reportRef.current.cloneNode(true) as HTMLDivElement;
    const serializer = new XMLSerializer();
    contentToPrint
      .querySelectorAll('.recharts-responsive-container')
      .forEach((container, idx) => {
        const { width, height } = chartSizes[idx];
        const svg = container.querySelector('svg');
        if (svg) {
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svg.setAttribute('width', `${width}`);
          svg.setAttribute('height', `${height}`);

          const svgString = serializer.serializeToString(svg);
          const encoded = window.btoa(unescape(encodeURIComponent(svgString)));
          const img = document.createElement('img');
          img.src = `data:image/svg+xml;base64,${encoded}`;
          img.width = width;
          img.height = height;

          container.parentNode?.replaceChild(img, container);
        }
      });

    const printWindow = window.open('', '', 'height=800,width=1200');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Cetak Laporan</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          :root {
            --background: 120 10% 97%;
            --foreground: 240 10% 3.9%;
            --card: 0 0% 100%;
            --card-foreground: 240 10% 3.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 240 10% 3.9%;
            --primary: 124 51% 71%;
            --primary-foreground: 125 45% 15%;
            --secondary: 120 20% 92%;
            --secondary-foreground: 240 10% 3.9%;
            --muted: 120 20% 92%;
            --muted-foreground: 240 3.8% 46.1%;
            --accent: 122 40% 82%;
            --accent-foreground: 125 45% 15%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 0 0% 98%;
            --border: 120 15% 88%;
            --input: 120 15% 88%;
            --ring: 124 51% 71%;
            --chart-1: 124 51% 71%;
            --chart-2: 130 45% 65%;
            --chart-3: 135 40% 60%;
            --chart-4: 120 40% 75%;
            --chart-5: 115 45% 80%;
            --radius: 0.5rem;
            --sidebar-background: 220 10% 15%;
            --sidebar-foreground: 0 0% 98%;
            --sidebar-primary: 124 51% 71%;
            --sidebar-primary-foreground: 125 45% 15%;
            --sidebar-accent: 220 10% 25%;
            --sidebar-accent-foreground: 0 0% 98%;
            --sidebar-border: 220 10% 25%;
            --sidebar-ring: 124 51% 71%;
          }
          body {
            font-family: 'Inter', sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: #000;
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
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; font-size: 11px; }
          th { background-color: #f2f2f2 !important; font-weight: bold; text-align: center; vertical-align: middle; }
          tbody tr:nth-child(even) { background-color: #f9f9f9 !important; }
          h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
          .chart-description { font-size: 0.8rem; color: #6B7280; margin-top: -0.5rem; margin-bottom: 1rem;}
        `);
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body class="bg-white">');
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
            Untuk menyalin ke Word/Google Docs, klik di dalam area laporan di bawah, tekan Ctrl+A (atau Cmd+A) untuk memilih semua, lalu Ctrl+C untuk menyalin.
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
                        {chartDescription && <p className="chart-description">{chartDescription}</p>}
                        {lineChart}
                    </div>
                  )}
                   {barChart && (
                     <div className="print-page">
                        <h3 className="text-lg font-semibold mb-4">Grafik Tren (Batang)</h3>
                        {chartDescription && <p className="chart-description">{chartDescription}</p>}
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
