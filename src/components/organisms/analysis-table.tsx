
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
import { Badge } from "@/components/ui/badge"
import { Indicator } from "@/store/indicator-store"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"

const columns: ColumnDef<Indicator>[] = [
    {
        accessorKey: "indicator",
        header: "Indikator",
        cell: ({ row }) => <div className="font-medium">{row.getValue("indicator")}</div>,
    },
    {
        accessorKey: "category",
        header: "Kategori",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
    },
    {
        accessorKey: "period",
        header: "Periode",
        cell: ({ row }) => {
            const dateValue = row.getValue("period") as string;
            return <div>{format(parseISO(dateValue), "d MMM yyyy", { locale: IndonesianLocale })}</div>
        },
    },
    {
        accessorKey: "analysisNotes",
        header: "Catatan Analisis",
        cell: ({ row }) => <div className="text-sm whitespace-pre-wrap">{row.getValue("analysisNotes") || "-"}</div>,
    },
    {
        accessorKey: "followUpPlan",
        header: "Rencana Tindak Lanjut",
        cell: ({ row }) => <div className="text-sm whitespace-pre-wrap">{row.getValue("followUpPlan") || "-"}</div>,
    },
];


type AnalysisTableProps = {
  data: Indicator[]
}

export function AnalysisTable({ data }: AnalysisTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id} className="font-bold text-black">
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
                <TableRow key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-4 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data analisis untuk ditampilkan.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  )
}
