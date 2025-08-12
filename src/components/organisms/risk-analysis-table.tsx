
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
import { Risk, RiskLevel } from "@/store/risk-store"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"


const getRiskLevelClass = (level?: RiskLevel) => {
    if (!level) return "";
     switch(level) {
        case "Rendah": return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
        case "Moderat": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
        case "Tinggi": return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
        case "Ekstrem": return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
        default: return "";
    }
}

const columns: ColumnDef<Risk>[] = [
    {
        accessorKey: "riskLevel",
        header: "Level Risiko",
        cell: ({ row }) => {
            const level = row.original.riskLevel;
            return <Badge className={cn("text-xs", getRiskLevelClass(level))}>{level}</Badge>
        },
        size: 100
    },
    {
        accessorKey: "description",
        header: "Risiko & Unit",
        cell: ({ row }) => (
            <div>
                <p className="font-semibold">{row.original.description}</p>
                <p className="text-xs text-muted-foreground">{row.original.unit}</p>
            </div>
        ),
        size: 250
    },
    {
        accessorKey: "actionPlan",
        header: "Rencana Aksi & PIC",
        cell: ({ row }) => (
             <div>
                <p>{row.original.actionPlan}</p>
                <p className="text-xs text-muted-foreground">PIC: {row.original.pic || '-'}</p>
            </div>
        ),
        size: 300
    },
    {
        accessorKey: "dueDate",
        header: "Batas Waktu",
        cell: ({ row }) => row.original.dueDate ? format(parseISO(row.original.dueDate), "dd MMM yyyy", { locale: IndonesianLocale }) : "-",
        size: 120
    },
];


type RiskAnalysisTableProps = {
  data: Risk[]
}

export function RiskAnalysisTable({ data }: RiskAnalysisTableProps) {
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
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id} style={{width: `${header.getSize()}px`}}>
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
                    Tidak ada risiko yang sedang ditangani.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  )
}
