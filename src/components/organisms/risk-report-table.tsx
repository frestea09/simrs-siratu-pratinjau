
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Risk, RiskLevel, RiskEvaluation } from "@/store/risk-store"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { cn } from "@/lib/utils"

const evaluationMap: Record<RiskEvaluation, string> = {
    "Mitigasi": "1. Mitigasi",
    "Transfer": "2. Transfer",
    "Diterima": "3. Diterima",
    "Dihindari": "4. Dihindari",
};

const getRiskLevelClass = (level?: RiskLevel) => {
    switch(level) {
        case "Rendah": return "bg-blue-100 text-blue-800";
        case "Moderat": return "bg-green-100 text-green-800";
        case "Tinggi": return "bg-yellow-100 text-yellow-800";
        case "Ekstrem": return "bg-red-100 text-red-800";
        default: return "";
    }
};

const columns: ColumnDef<Risk>[] = [
    { accessorKey: "no", header: "No", cell: ({ row }) => row.index + 1, size: 20 },
    { accessorKey: "unit", header: "Nama Unit Kerja", size: 100 },
    { accessorKey: "source", header: "Sumber", cell: ({ row }) => row.original.source, size: 80 },
    { accessorKey: "description", header: "Deskripsi Risiko", size: 200 },
    { accessorKey: "cause", header: "Penyebab", size: 200 },
    { accessorKey: "category", header: "Kategori Risiko", size: 100 },
    { accessorKey: "consequence", header: "C", cell: info => info.getValue(), size: 20 },
    { accessorKey: "likelihood", header: "L", cell: info => info.getValue(), size: 20 },
    { accessorKey: "cxl", header: "CxL", cell: info => info.getValue(), size: 30 },
    { accessorKey: "riskLevel", header: () => <div className="text-center font-bold">(CXL)<br/>Description</div>, cell: ({ row }) => <span className={cn("p-1 rounded", getRiskLevelClass(row.original.riskLevel))}>{row.original.riskLevel}</span>, size: 80 },
    { accessorKey: "controllability", header: "CI", cell: info => info.getValue(), size: 20 },
    { accessorKey: "riskScore", header: "Skor Risiko", cell: info => info.getValue(), size: 50 },
    { accessorKey: "manualRanking", header: "Ranking", cell: info => info.getValue() || "-", size: 50 },
    { accessorKey: "evaluation", header: "Evaluasi Risiko", cell: ({ row }) => evaluationMap[row.original.evaluation] || row.original.evaluation, size: 80 },
    { accessorKey: "actionPlan", header: "Risk Response & Action Plan", size: 250 },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => row.original.dueDate ? format(parseISO(row.original.dueDate), "dd MMM yyyy", { locale: IndonesianLocale }) : "-", size: 80 },
    { accessorKey: "pic", header: "PIC", cell: info => info.getValue() || "-", size: 100 },
    { accessorKey: "residualRiskScore", header: "Skor Risiko Sisa", cell: info => info.getValue() || "-", size: 50 },
    { accessorKey: "reportNotes", header: "Laporan Singkat / Monev", cell: info => info.getValue() || "-", size: 200 },
    { accessorKey: "status", header: "Status", cell: info => info.getValue(), size: 50 },
];

type RiskReportTableProps = {
  data: Risk[]
}

export function RiskReportTable({ data }: RiskReportTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader className="bg-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="p-1 h-auto text-center font-bold text-black border whitespace-normal" style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                    ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-1 align-top border">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data untuk ditampilkan.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  )
}
