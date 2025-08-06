
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn
} from "@tanstack/react-table"
import { Calendar as CalendarIcon, ArrowUpDown, Eye, MoreHorizontal, Pencil } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SpmIndicator } from "@/store/spm-store"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { SpmInputDialog } from "./spm-input-dialog"

const SpmDetailDialog = ({ indicator, open, onOpenChange }: { indicator: SpmIndicator | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
    if (!indicator) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detail Laporan SPM</DialogTitle>
                    <DialogDescription>
                        {indicator.serviceType}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-muted-foreground">Indikator</span>
                        <span className="col-span-2 font-medium">{indicator.indicator}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Tanggal Laporan</span>
                        <span className="col-span-2">{format(new Date(indicator.reportingDate), "d MMMM yyyy", { locale: IndonesianLocale })}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Target</span>
                        <span className="col-span-2">{indicator.target}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Capaian</span>
                        <span className="col-span-2 font-semibold">{indicator.achievement}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-muted-foreground">Catatan</span>
                        <p className="col-span-2 bg-muted/50 p-3 rounded-md">
                            {indicator.notes || "Tidak ada catatan."}
                        </p>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Status</span>
                        <div className="col-span-2">{getStatusBadge(indicator.notes)}</div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


const getStatusBadge = (notes?: string) => {
    if (notes && notes.trim() !== '') {
      return <Badge variant="destructive">Ada Catatan</Badge>
    }
    return <Badge variant="default">Tercapai</Badge>
}

const dateRangeFilter: FilterFn<SpmIndicator> = (row, columnId, value, addMeta) => {
    const date = new Date(row.original.reportingDate);
    const [start, end] = value as [Date | undefined, Date | undefined];
    
    if (start && !end) {
        return date >= start;
    }
    if (!start && end) {
        const localEndDate = new Date(end);
        localEndDate.setHours(23, 59, 59, 999);
        return date <= localEndDate;
    }
    if (start && end) {
        const localEndDate = new Date(end);
        localEndDate.setHours(23, 59, 59, 999);
        return date >= start && date <= localEndDate;
    }
    return true;
}


type SpmTableProps = {
  indicators: SpmIndicator[]
}

export function SpmTable({ indicators }: SpmTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [date, setDate] = React.useState<DateRange | undefined>()
  const [selectedSpm, setSelectedSpm] = React.useState<SpmIndicator | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const columns: ColumnDef<SpmIndicator>[] = [
    {
        accessorKey: "serviceType",
        header: "Jenis Pelayanan",
        cell: ({ row }) => <div className="font-medium">{row.getValue("serviceType")}</div>,
    },
    {
        accessorKey: "indicator",
        header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Indikator
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="pl-4">{row.getValue("indicator")}</div>,
    },
     {
      accessorKey: "reportingDate",
      header: "Tgl. Laporan",
      cell: ({ row }) => <div>{format(new Date(row.getValue("reportingDate")), "dd MMM yyyy")}</div>,
      filterFn: dateRangeFilter,
    },
    {
        accessorKey: "achievement",
        header: "Capaian",
        cell: ({ row }) => <div className="font-semibold">{row.getValue("achievement")}</div>,
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.notes),
    },
    {
        id: "actions",
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => {
            const indicator = row.original
            return (
                <div className="text-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => {
                                setSelectedSpm(indicator);
                                setIsDetailOpen(true);
                            }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <SpmInputDialog spmIndicator={indicator} trigger={
                                    <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </button>
                                } />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    }
]


  const table = useReactTable({
    data: indicators,
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

  React.useEffect(() => {
    const from = date?.from;
    const to = date?.to;
    table.getColumn("reportingDate")?.setFilterValue(from || to ? [from, to] : undefined);
  }, [date, table]);


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder="Cari berdasarkan nama indikator..."
          value={(table.getColumn("indicator")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("indicator")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex-1 min-w-[200px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pilih rentang tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
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
      <SpmDetailDialog 
        indicator={selectedSpm}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
