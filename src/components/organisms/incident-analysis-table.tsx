
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
import { Incident } from "@/store/incident-store"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { formatChronology } from "@/lib/utils"

const incidentTypeMap: { [key: string]: string } = {
    'KPC': 'Kondisi Potensial Cedera (KPC)', 'KNC': 'Kejadian Nyaris Cedera (KNC)',
    'KTC': 'Kejadian Tidak Cedera (KTC)', 'KTD': 'Kejadian Tidak Diharapkan (KTD)',
    'Sentinel': 'Kejadian Sentinel',
};

const ChronologyList = ({ text }: { text: string }) => {
    const steps = formatChronology(text)
        .split("\n")
        .filter(Boolean)

    if (steps.length === 0) {
        return <p className="text-sm text-muted-foreground">-</p>
    }

    return (
        <ol className="list-decimal pl-4 space-y-1 text-sm">
            {steps.map((step, index) => (
                <li key={index} className="leading-relaxed">
                    {step}
                </li>
            ))}
        </ol>
    )
}

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


type IncidentAnalysisTableProps = {
  data: Incident[]
}

export function IncidentAnalysisTable({ data }: IncidentAnalysisTableProps) {
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
                    <TableHead key={header.id} className="font-bold text-black" style={{width: header.getSize() ? `${header.getSize()}px` : undefined}}>
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
