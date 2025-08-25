"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SurveyResult } from "@/types/survey"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "../ui/progress"

type SurveyTableProps = {
  surveys: SurveyResult[]
  onEdit: (survey: SurveyResult) => void
  onDelete: (id: string) => Promise<void>
}

export function SurveyTable({ surveys, onEdit, onDelete }: SurveyTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "submissionDate", desc: true },
  ])
  const { toast } = useToast()

  const handleDelete = React.useCallback(
    async (survey: SurveyResult) => {
      await onDelete(survey.id)
      toast({
        title: "Survei Dihapus",
        description: `Data survei dari unit ${survey.unit} telah dihapus.`,
        variant: "destructive",
      })
    },
    [onDelete, toast]
  )

  const columns = React.useMemo<ColumnDef<SurveyResult>[]>(
    () => [
      {
        accessorKey: "submissionDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Pengisian
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            {format(new Date(row.getValue("submissionDate")), "dd MMMM yyyy", {
              locale: IndonesianLocale,
            })}
          </div>
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit Kerja",
      },
      {
        accessorKey: "totalScore",
        header: "Skor Rata-rata",
        cell: ({ row }) => (
          <div className="font-semibold text-center">
            {(row.getValue("totalScore") as number).toFixed(2)} / 5.00
          </div>
        ),
      },
      {
        accessorKey: "positivePercentage",
        header: "Respons Positif (%)",
        cell: ({ row }) => {
          const value = row.getValue("positivePercentage") as number
          return (
            <div className="flex items-center gap-2">
              <Progress value={value} className="w-2/3" />
              <span>{value.toFixed(1)}%</span>
            </div>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const survey = row.original
          return (
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Buka menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(survey)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      <span className="text-destructive">Hapus</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Aksi ini tidak dapat dibatalkan. Ini akan menghapus data hasil survei secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(survey)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        },
      },
    ],
    [onEdit, handleDelete]
  )

  const table = useReactTable({
    data: surveys,
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Belum ada hasil survei yang dikirimkan.
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
