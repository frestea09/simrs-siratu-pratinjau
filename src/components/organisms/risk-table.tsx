
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  Row
} from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, ChevronDown, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Risk, RiskEvaluation, RiskLevel, RiskStatus, useRiskStore } from "@/store/risk-store"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RiskDialog } from "./risk-dialog"
import { Input } from "../ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"


const ActionsCell = ({ row }: { row: Row<Risk> }) => {
    const risk = row.original
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const { removeRisk } = useRiskStore();
    const { toast } = useToast();

    const handleDelete = () => {
        removeRisk(risk.id);
        toast({
            title: "Risiko Dihapus",
            description: `Risiko "${risk.description.substring(0, 30)}..." telah dihapus.`,
        });
    }

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
                    <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>Edit Risiko</DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Aksi ini tidak dapat dibatalkan. Ini akan menghapus data risiko secara permanen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
            <RiskDialog risk={risk} open={isEditOpen} onOpenChange={setIsEditOpen} />
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

const getStatusVariant = (status: RiskStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch(status) {
        case "Open": return "secondary";
        case "In Progress": return "outline";
        case "Closed": return "default";
        default: return "secondary";
    }
}


const columns: ColumnDef<Risk>[] = [
  {
    accessorKey: "ranking",
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Skor Prioritas <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div className="text-center font-bold text-lg">{row.original.ranking.toFixed(2)}</div>,
    size: 50,
  },
  {
    accessorKey: "description",
    header: "Deskripsi Risiko",
    cell: ({ row }) => {
        const risk = row.original;
        return (
            <div>
                <p className="font-semibold">{risk.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    <strong>Penyebab:</strong> {risk.cause}
                </p>
                <p className="text-xs text-muted-foreground">
                    <strong>Unit:</strong> {risk.unit}
                </p>
            </div>
        )
    }
  },
   {
    accessorKey: "riskLevel",
    header: () => <div className="text-center">Level Risiko</div>,
    cell: ({ row }) => {
        const level = row.getValue("riskLevel") as RiskLevel;
        const score = row.original.riskScore;
        const variant = getRiskLevelVariant(level)
        const className = variant === 'outline' ? 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50 hover:bg-yellow-400' : ''
        return (
            <div className="text-center flex flex-col items-center">
                <Badge variant={variant} className={cn("text-sm", className)}>{level}</Badge>
                <span className="text-xs text-muted-foreground">(Skor: {score})</span>
            </div>
        )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 120,
  },
  {
    accessorKey: "residualRiskLevel",
    header: () => <div className="text-center">Level Risiko Sisa</div>,
    cell: ({ row }) => {
        const level = row.getValue("residualRiskLevel") as RiskLevel | undefined;
        if (!level) return <div className="text-center">-</div>
        
        const score = row.original.residualRiskScore;
        const variant = getRiskLevelVariant(level)
        const className = variant === 'outline' ? 'bg-yellow-400/80 text-yellow-900 border-yellow-500/50 hover:bg-yellow-400' : ''
        
        return (
            <div className="text-center flex flex-col items-center">
                <Badge variant={variant} className={cn("text-sm", className)}>{level}</Badge>
                <span className="text-xs text-muted-foreground">(Skor: {score})</span>
            </div>
        )
    },
    size: 120,
  },
  {
    accessorKey: "actionPlan",
    header: "Rencana Aksi & PIC",
    cell: ({ row }) => {
         const risk = row.original;
         return (
            <div>
                <p className="font-semibold">{risk.actionPlan}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    <strong>PIC:</strong> {risk.pic || '-'}
                </p>
            </div>
         )
    }
  },
  {
    accessorKey: "dueDate",
    header: () => <div className="text-center">Batas Waktu</div>,
    cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as string;
        if (!dueDate) return <div className="text-center">-</div>;
        return <div className="text-center">{format(parseISO(dueDate), "dd MMM yyyy", { locale: IndonesianLocale })}</div>;
    },
    size: 120,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
        const status = row.getValue("status") as RiskStatus;
        const variant = getStatusVariant(status);
        const className = variant === 'outline' ? 'bg-blue-400/80 text-blue-900 border-blue-500/50 hover:bg-blue-400' : ''
        return (
            <div className="text-center">
                <Badge variant={variant} className={cn(className)}>{status}</Badge>
            </div>
        )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 120,
  },
  {
    id: "actions",
    cell: ActionsCell,
    size: 50,
  },
]

type RiskTableProps = {
  risks: Risk[]
}

const riskLevelOptions: RiskLevel[] = ["Rendah", "Moderat", "Tinggi", "Ekstrem"];
const statusOptions: RiskStatus[] = ["Open", "In Progress", "Closed"];

export function RiskTable({ risks }: RiskTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: 'ranking', desc: true }
    ]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  const table = useReactTable({
    data: risks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full">
         <div className="flex items-center py-4 gap-2">
            <Input
            placeholder="Cari deskripsi risiko..."
            value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        Level Risiko <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {riskLevelOptions.map(level => (
                        <DropdownMenuCheckboxItem
                            key={level}
                            checked={(table.getColumn("riskLevel")?.getFilterValue() as string[] | undefined)?.includes(level) ?? false}
                             onCheckedChange={(value) => {
                                const currentFilter = (table.getColumn("riskLevel")?.getFilterValue() as string[] | undefined) || [];
                                const newFilter = value ? [...currentFilter, level] : currentFilter.filter(s => s !== level);
                                table.getColumn("riskLevel")?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >{level}</DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {statusOptions.map(status => (
                         <DropdownMenuCheckboxItem
                            key={status}
                            checked={(table.getColumn("status")?.getFilterValue() as string[] | undefined)?.includes(status) ?? false}
                             onCheckedChange={(value) => {
                                const currentFilter = (table.getColumn("status")?.getFilterValue() as string[] | undefined) || [];
                                const newFilter = value ? [...currentFilter, status] : currentFilter.filter(s => s !== status);
                                table.getColumn("status")?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >{status}</DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
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
        <div className="flex-1 text-sm text-muted-foreground">
          Menampilkan {table.getFilteredRowModel().rows.length} dari {risks.length} total risiko.
        </div>
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
