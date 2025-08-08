
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
  RowData,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Calendar as CalendarIcon, Pencil, Eye, Filter } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
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
import { SubmittedIndicator, useIndicatorStore, IndicatorCategory } from "@/store/indicator-store"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { IndicatorSubmissionDialog } from "./indicator-submission-dialog"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { IndicatorSubmissionDetailDialog } from "./indicator-submission-detail-dialog"
import { RejectionReasonDialog } from "./rejection-reason-dialog"
import { useNotificationStore } from "@/store/notification-store"

declare module '@tanstack/react-table' {
    interface FilterFns {
        dateRangeFilter: FilterFn<RowData>
        categoryFilter: FilterFn<RowData>
    }
}

const getStatusVariant = (status: SubmittedIndicator['status']) => {
    switch (status) {
        case 'Diverifikasi':
            return 'default'
        case 'Menunggu Persetujuan':
            return 'secondary'
        case 'Ditolak':
            return 'destructive'
        default:
            return 'outline'
    }
}

const statusOptions: SubmittedIndicator['status'][] = ['Menunggu Persetujuan', 'Diverifikasi', 'Ditolak'];
const categoryOptions: {value: IndicatorCategory, label: string}[] = [
    { value: 'INM', label: 'INM'},
    { value: 'IMP-RS', label: 'IMP-RS'},
    { value: 'IPU', label: 'IPU'},
    { value: 'SPM', label: 'SPM'},
]

const dateRangeFilter: FilterFn<SubmittedIndicator> = (row, columnId, value, addMeta) => {
    const date = new Date(row.original.submissionDate);
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

const categoryFilter: FilterFn<SubmittedIndicator> = (row, columnId, value) => {
    return value.includes(row.original.category);
}


type IndicatorSubmissionTableProps = {
  indicators: SubmittedIndicator[]
}

export function IndicatorSubmissionTable({ indicators }: IndicatorSubmissionTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ id: false })
  const [rowSelection, setRowSelection] = React.useState({})
  const [date, setDate] = React.useState<DateRange | undefined>()
  const [selectedIndicator, setSelectedIndicator] = React.useState<SubmittedIndicator | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [rejectionDialog, setRejectionDialog] = React.useState<{isOpen: boolean, indicator: SubmittedIndicator | null}>({isOpen: false, indicator: null});

  const { updateSubmittedIndicatorStatus } = useIndicatorStore.getState()
  const { currentUser } = useUserStore();
  const { addLog } = useLogStore();
  const { addNotification } = useNotificationStore();

  const handleStatusChange = (indicator: SubmittedIndicator, status: SubmittedIndicator['status'], reason?: string) => {
      updateSubmittedIndicatorStatus(indicator.id, status, reason)
      addLog({
          user: currentUser?.name || 'System',
          action: 'UPDATE_INDICATOR_STATUS',
          details: `Status indikator "${indicator.name}" (${indicator.id}) diubah menjadi ${status}.`,
      });
      addNotification({
          title: `Pengajuan Indikator ${status}`,
          description: `Pengajuan Anda untuk indikator "${indicator.name}" telah ${status}.`,
          link: '/dashboard/indicators',
          recipientUnit: indicator.unit
      });
  }
  
  const openRejectionDialog = (indicator: SubmittedIndicator) => {
    setRejectionDialog({ isOpen: true, indicator });
  };

  const columns: ColumnDef<SubmittedIndicator>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Indikator
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
      filterFn: 'categoryFilter',
    },
      {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => <div>{row.getValue("unit")}</div>,
    },
    {
      accessorKey: "submissionDate",
      header: "Tgl. Pengajuan",
      cell: ({ row }) => <div>{format(new Date(row.getValue("submissionDate")), "dd MMM yyyy")}</div>,
      filterFn: 'dateRangeFilter',
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.getValue("status"))}>{row.getValue("status")}</Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
          const indicator = row.original as SubmittedIndicator
          const canVerify = currentUser?.role === 'Admin Sistem' || 
                            currentUser?.role === 'Direktur' ||
                            currentUser?.role === 'Sub. Komite Peningkatan Mutu';
      
          return (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        setSelectedIndicator(indicator)
                        setIsDetailOpen(true)
                      }}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                          <IndicatorSubmissionDialog indicator={indicator} trigger={
                              <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                              </button>
                          } />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(indicator.id)}
                      >
                          Salin ID Indikator
                      </DropdownMenuItem>
                      {canVerify && (
                          <>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>Ubah Status</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {statusOptions.map((status) => (
                                      <DropdownMenuItem 
                                        key={status} 
                                        onSelect={() => {
                                          if (status === 'Ditolak') {
                                            openRejectionDialog(indicator);
                                          } else {
                                            handleStatusChange(indicator, status);
                                          }
                                        }}
                                      >
                                        {status}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                              </DropdownMenuSub>
                          </>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>
          )
      }
    },
  ]


  const table = useReactTable({
    data: indicators,
    columns,
    filterFns: {
      dateRangeFilter,
      categoryFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })
  
  React.useEffect(() => {
    const from = date?.from;
    const to = date?.to;
    table.getColumn("submissionDate")?.setFilterValue(from || to ? [from, to] : undefined);
  }, [date, table]);


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder="Cari nama indikator..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter berdasarkan</DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuSub>
                <DropdownMenuSubTrigger>Kategori</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    {categoryOptions.map((cat) => (
                        <DropdownMenuCheckboxItem
                            key={cat.value}
                            className="capitalize"
                            checked={
                                (table.getColumn("category")?.getFilterValue() as string[] | undefined)?.includes(cat.value) ?? false
                            }
                            onCheckedChange={(value) => {
                                const currentFilter = (table.getColumn("category")?.getFilterValue() as string[] | undefined) || [];
                                const newFilter = value ? [...currentFilter, cat.value] : currentFilter.filter(s => s !== cat.value);
                                table.getColumn("category")?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >
                            {cat.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    {statusOptions.map((status) => (
                    <DropdownMenuCheckboxItem
                        key={status}
                        className="capitalize"
                        checked={
                        (table.getColumn("status")?.getFilterValue() as string[] | undefined)?.includes(status) ?? false
                        }
                        onCheckedChange={(value) => {
                        const currentFilter = (table.getColumn("status")?.getFilterValue() as string[] | undefined) || [];
                        const newFilter = value ? [...currentFilter, status] : currentFilter.filter(s => s !== status);
                        table.getColumn("status")?.setFilterValue(newFilter.length ? newFilter : undefined);
                        }}
                    >
                        {status}
                    </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
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
      <IndicatorSubmissionDetailDialog 
        indicator={selectedIndicator}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
      <RejectionReasonDialog
        open={rejectionDialog.isOpen}
        onOpenChange={(isOpen) => setRejectionDialog({ isOpen, indicator: null })}
        onSubmit={(reason) => {
          if (rejectionDialog.indicator) {
            handleStatusChange(rejectionDialog.indicator, 'Ditolak', reason);
          }
        }}
      />
    </div>
  )
}
