
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Risk, RiskEvaluation, RiskLevel } from "@/store/risk-store"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ActionsCell = ({ row }: { row: any }) => {
    const risk = row.original
    // const [isEditOpen, setIsEditOpen] = React.useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                    <DropdownMenuItem>Edit Risiko</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {/* <RiskDialog risk={risk} open={isEditOpen} onOpenChange={setIsEditOpen} /> */}
        </>
    )
}

const getRiskLevelVariant = (level: RiskLevel): "default" | "secondary" | "destructive" | "outline" => {
    switch(level) {
        case "Rendah": return "secondary"; // Blue
        case "Moderat": return "default"; // Green
        case "Tinggi": return "outline"; // Yellow
        case "Ekstrem": return "destructive"; // Red
        default: return "secondary";
    }
}

const getEvaluationVariant = (evaluation: RiskEvaluation): "default" | "secondary" | "destructive" | "outline" => {
    switch(evaluation) {
        case "Mitigasi": return "default";
        case "Transfer": return "secondary";
        case "Diterima": return "outline";
        case "Dihindari": return "destructive";
        default: return "secondary";
    }
}


const columns: ColumnDef<Risk>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    size: 100,
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Unit Kerja <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
  },
  {
    accessorKey: "description",
    header: "Deskripsi Risiko",
    cell: ({ row }) => <div className="text-sm">{row.getValue("description")}</div>
  },
   {
    accessorKey: "riskScore",
    header: () => <div className="text-center">Skor Risiko</div>,
    cell: ({ row }) => <div className="text-center font-bold">{row.getValue("riskScore")}</div>,
    size: 50,
  },
  {
    accessorKey: "riskLevel",
    header: () => <div className="text-center">Level Risiko</div>,
    cell: ({ row }) => {
        const level = row.getValue("riskLevel") as RiskLevel;
        const variant = getRiskLevelVariant(level)
        const className = variant === 'outline' ? 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50 hover:bg-yellow-400' : ''
        return (
            <div className="text-center">
                <Badge variant={variant} className={cn(className)}>{level}</Badge>
            </div>
        )
    },
    size: 100,
  },
  {
    accessorKey: "evaluation",
    header: () => <div className="text-center">Evaluasi Risiko</div>,
    cell: ({ row }) => {
        const evaluation = row.getValue("evaluation") as RiskEvaluation;
        return (
            <div className="text-center">
                <Badge variant={getEvaluationVariant(evaluation)}>{evaluation}</Badge>
            </div>
        )
    },
    size: 100,
  },
  {
    accessorKey: "ranking",
    header: ({ column }) => (
        <div className="text-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Ranking <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
    ),
    cell: ({ row }) => <div className="text-center font-bold text-lg text-primary">{row.getValue("ranking")}</div>,
    size: 50,
  },
//   {
//     id: "actions",
//     cell: ActionsCell,
//   },
]

type RiskTableProps = {
  risks: Risk[]
}

export function RiskTable({ risks }: RiskTableProps) {
  const [sorting, setSorting] = React.useState<any[]>([
      { id: 'ranking', desc: true }
  ])
  
  const table = useReactTable({
    data: risks,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}>
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Belum ada risiko yang diidentifikasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}
