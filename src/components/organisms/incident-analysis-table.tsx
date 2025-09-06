
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { FilterFn } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Incident } from "@/store/incident-store"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { ChronologyList, incidentTypeMap } from "./incident-analysis-table.utils"

const columns: ColumnDef<Incident>[] = [
    {
        accessorKey: "id",
        header: "ID Insiden & Jenis",
        cell: ({ row }) => {
            const type = row.original.type;
            return (
                <div>
                    <div className="font-medium">{row.original.id}</div>
                     <Badge variant="outline">{incidentTypeMap[type] || type}</Badge>
                </div>
            )
        },
        size: 150
    },
    {
        accessorKey: "date",
        header: "Tanggal Lapor",
        cell: ({ row }) => {
            const dateValue = row.getValue("date") as string;
            return <div>{format(parseISO(dateValue), "d MMM yyyy", { locale: IndonesianLocale })}</div>
        },
        size: 120
    },
    {
        accessorKey: "chronology",
        header: "Kronologis Insiden",
        cell: ({ row }) => <ChronologyList text={row.getValue("chronology") || ""} />,
        size: 300,
    },
    {
        accessorKey: "analysisNotes",
        header: "Catatan Analisis",
        cell: ({ row }) => <div className="text-sm whitespace-pre-wrap">{row.getValue("analysisNotes") || "-"}</div>,
        size: 250,
    },
    {
        accessorKey: "followUpPlan",
        header: "Rencana Tindak Lanjut",
        cell: ({ row }) => <div className="text-sm whitespace-pre-wrap">{row.getValue("followUpPlan") || "-"}</div>,
        size: 250,
    },
];

const noopFilter: FilterFn<Incident> = () => true
const filterFns = {
  dateRangeFilter: noopFilter,
  categoryFilter: noopFilter,
  statusFilter: noopFilter,
}

import type { IncidentAnalysisTableProps } from "./incident-analysis-table.interface"

export function IncidentAnalysisTable({ data }: IncidentAnalysisTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns,
  })

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead
                      key={header.id}
                      className="font-bold text-black"
                      style={{ width: header.getSize() ? `${header.getSize()}px` : undefined }}
                    >
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
