
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
  columns: ColumnDef<TData, any>[]
  title: string
  description?: string
}

export function ReportPreviewDialog<TData>({
  open,
  onOpenChange,
  data,
  columns,
  title,
  description,
}: ReportPreviewDialogProps<TData>) {
  const reportRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    if (printWindow && reportRef.current) {
        printWindow.document.write('<html><head><title>Cetak Laporan</title>');
        // Inject Tailwind CDN for printing styles
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('<style>@media print { @page { size: landscape; margin: 20px; } body { -webkit-print-color-adjust: exact; } .no-print { display: none; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(reportRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { // Timeout to ensure styles are loaded
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Pratinjau Laporan</DialogTitle>
          <DialogDescription>
            Pratinjau laporan sebelum diunduh atau dicetak. Gunakan fungsi "Cetak" dan pilih "Simpan sebagai PDF" untuk mengunduh.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div ref={reportRef} className="p-4 bg-white text-black">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-center">{title}</h1>
              {description && <p className="text-center text-sm">{description}</p>}
               <p className="text-center text-xs text-gray-500 mt-1">RSUD Oto Iskandar Dinata</p>
            </header>
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
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <footer className="mt-6 text-xs text-gray-500">
                <p>Tanggal Cetak: {format(new Date(), "d MMMM yyyy HH:mm")}</p>
            </footer>
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
