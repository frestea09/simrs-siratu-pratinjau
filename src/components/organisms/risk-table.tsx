
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
import { MoreHorizontal, ArrowUpDown, ChevronDown, Trash2, Edit, CheckSquare } from "lucide-react"
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
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [dialogMode, setDialogMode] = React.useState<'edit' | 'update'>('edit');
    const { removeRisk } = useRiskStore();
    const { toast } = useToast();

    const handleDelete = async () => {
        await removeRisk(risk.id);
        toast({
            title: "Risiko Dihapus",
            description: `Risiko "${risk.description.substring(0, 30)}..." telah dihapus.`,
        });
    }

    const openDialog = (mode: 'edit' | 'update') => {
        setDialogMode(mode);
        setIsDialogOpen(true);
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
                     <DropdownMenuItem onSelect={() => openDialog('edit')}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Identifikasi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openDialog('update')}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Update Evaluasi</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <button className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive hover:bg-destructive/10">
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
                                <AlertDialogAction onClick={async () => handleDelete()} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
            <RiskDialog 
                risk={risk} 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
                mode={dialogMode}
             />
        </>
    )
}

const getRiskLevelVariant = (level?: RiskLevel): "default" | "secondary" | "destructive" | "outline" => {
    if (!level) return "secondary";
    switch(level) {
        case "Rendah": return "secondary"; // Blue
        case "Moderat": return "default"; // Green
        case "Tinggi": return "outline"; // Yellow
        case "Ekstrem": return "destructive"; // Red
        default: return "secondary";
    }
}

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

const getStatusClass = (status?: RiskStatus) => {
    if (!status) return "";
     switch(status) {
        case "Open": return "bg-gray-200 text-gray-800";
        case "In Progress": return "bg-blue-200 text-blue-800";
        case "Closed": return "bg-primary/20 text-primary-foreground";
        default: return "";
    }
}


const columns: ColumnDef<Risk>[] = [
  {
    accessorKey: "riskScore",
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Skor <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div className="text-center font-bold text-lg">{row.original.riskScore}</div>,
    sortingFn: 'alphanumeric',
  },
  {
    id: "ranking",
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Ranking <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div className="text-center font-bold text-lg">{row.index + 1}</div>,
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: "description",
    header: "Deskripsi Risiko",
    cell: ({ row }) => {
        const risk = row.original;
        return (
            <div>
                <p className="font-semibold text-base">{risk.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground/80">Penyebab:</span> {risk.cause}
                </p>
                <p className="text-sm text-muted-foreground">
                     <span className="font-semibold text-foreground/80">Unit:</span> {risk.unit}
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
        const className = getRiskLevelClass(level);
        return (
            <div className="text-center flex flex-col items-center justify-center gap-1">
                <Badge variant={getRiskLevelVariant(level)} className={cn("text-base py-1 px-3", className)}>{level}</Badge>
                <span className="text-xs text-muted-foreground">(Skor: {score})</span>
            </div>
        )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 150,
  },
  {
    accessorKey: "residualRiskLevel",
    header: () => <div className="text-center">Level Sisa</div>,
    cell: ({ row }) => {
        const level = row.getValue("residualRiskLevel") as RiskLevel | undefined;
        if (!level) return <div className="text-center text-muted-foreground">-</div>
        
        const score = row.original.residualRiskScore;
        const className = getRiskLevelClass(level);
        
        return (
            <div className="text-center flex flex-col items-center justify-center gap-1">
                <Badge variant={getRiskLevelVariant(level)} className={cn("text-base py-1 px-3", className)}>{level}</Badge>
                <span className="text-xs text-muted-foreground">(Skor: {score})</span>
            </div>
        )
    },
    size: 150,
  },
  {
    accessorKey: "actionPlan",
    header: "Rencana Aksi & PIC",
    cell: ({ row }) => {
         const risk = row.original;
         return (
            <div>
                <p className="font-medium">{risk.actionPlan}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground/80">PIC:</span> {risk.pic || '-'}
                </p>
            </div>
         )
    }
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status & Batas Waktu</div>,
    cell: ({ row }) => {
        const risk = row.original;
        const status = risk.status;
        const dueDate = risk.dueDate;
        
        return (
            <div className="text-center flex flex-col items-center justify-center gap-2">
                <Badge className={cn("text-sm capitalize", getStatusClass(status))}>{status}</Badge>
                {dueDate && <span className="text-xs text-muted-foreground">{format(parseISO(dueDate), "dd MMM yyyy")}</span>}
            </div>
        )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 150,
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
        { id: 'riskScore', desc: true }
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
    initialState: {
        columnVisibility: { riskScore: false }
    }
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
                  className="[&>td]:py-4"
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
