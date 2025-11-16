
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
  FilterFn,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Indicator } from "@/store/indicator-store"
import { Badge } from "../ui/badge"
import { ActionsCell } from "./indicator-report-table/actions-cell"
import { TableFilters } from "./indicator-report-table/table-filters"
import { categoryFilter } from "./indicator-report-table/table-filters.utils"
import { format, parseISO, isValid } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { INDICATOR_TEXTS } from "@/lib/constants"

type IndicatorReportTableProps = {
  indicators: Indicator[]
  onExport: (data: Indicator[], columns: ColumnDef<Indicator>[]) => void
  onEdit: (indicator: Indicator) => void
  showCategoryFilter?: boolean
}

export function IndicatorReportTable({
  indicators,
  onExport,
  onEdit,
  showCategoryFilter = false,
}: IndicatorReportTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])

  const columns: ColumnDef<Indicator>[] = React.useMemo(
    () => [
      {
        accessorKey: "indicator",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {INDICATOR_TEXTS.reportTable.headers.indicator}{" "}
            <ArrowUpDown data-export-exclude className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("indicator")}</div>
        ),
      },
      {
        accessorKey: "category",
        header: INDICATOR_TEXTS.reportTable.headers.category,
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue("category")}</Badge>
        ),
        filterFn: "categoryFilter",
      },
      {
        accessorKey: "period",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {INDICATOR_TEXTS.reportTable.headers.period}{" "}
            <ArrowUpDown data-export-exclude className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const dateValue = row.getValue("period") as string
          const parsedDate = parseISO(dateValue)
          if (!isValid(parsedDate)) {
            return <span>{INDICATOR_TEXTS.reportTable.invalidDate}</span>
          }
          return (
            <div>
              {format(parsedDate, "d MMMM yyyy", { locale: IndonesianLocale })}
            </div>
          )
        },
      },
      {
        accessorKey: "ratio",
        header: () => <div className="text-right">{INDICATOR_TEXTS.reportTable.headers.ratio}</div>,
        cell: ({ row }) => {
          const ratio = row.getValue("ratio") as string
          const {
            standardUnit,
            calculationMethod,
            numerator,
            denominator,
          } = row.original
          const formulaText =
            calculationMethod === "percentage"
              ? "(Numerator / Denominator) * 100"
              : "Numerator / Denominator"
          const substitutionText =
            calculationMethod === "percentage"
              ? `(${numerator} / ${denominator}) * 100 = ${ratio}${standardUnit}`
              : `${numerator} / ${denominator} = ${ratio}${standardUnit}`

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-right font-semibold cursor-help underline decoration-dashed">
                  {`${ratio}${standardUnit}`}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 p-1">
                  <p className="font-bold text-base">{INDICATOR_TEXTS.reportTable.tooltip.title}</p>
                  <p>
                    <span className="font-semibold">{INDICATOR_TEXTS.reportTable.tooltip.formulaLabel}</span>{" "}
                    {formulaText}
                  </p>
                  <p>
                    <span className="font-semibold">{INDICATOR_TEXTS.reportTable.tooltip.substitutionLabel}</span>{" "}
                    {substitutionText}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        },
      },
      {
        accessorKey: "standard",
        header: () => <div className="text-right">{INDICATOR_TEXTS.reportTable.headers.standard}</div>,
        cell: ({ row }) => {
          const standard = row.original.standard
          const unit = row.original.standardUnit
          return <div className="text-right">{`${standard}${unit}`}</div>
        },
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center">{INDICATOR_TEXTS.reportTable.headers.status}</div>,
        cell: ({ row }) => {
          const status = row.getValue("status") as Indicator["status"]
          return (
            <div className="text-center">
              <Badge
                variant={
                  status === "Memenuhi Standar" ? "default" : "destructive"
                }
              >
                {status}
              </Badge>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center">{INDICATOR_TEXTS.reportTable.headers.actions}</div>,
        cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} />,
      },
    ],
    [onEdit]
  )

  const noopFilter: FilterFn<Indicator> = () => true

  const table = useReactTable({
    data: indicators,
    columns,
    filterFns: { dateRangeFilter: noopFilter, categoryFilter, statusFilter: noopFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    initialState: {
      columnVisibility: { category: showCategoryFilter },
    },
  })

  const exportableColumns = React.useMemo(
    () => columns.filter((c) => c.id !== "actions"),
    [columns]
  )

  return (
    <div className="w-full">
      <TableFilters
        table={table}
        showCategoryFilter={showCategoryFilter}
        onExport={() =>
          onExport(
            table.getFilteredRowModel().rows.map((row) => row.original),
            exportableColumns
          )
        }
        showDateFilter={false}
      />
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {INDICATOR_TEXTS.reportTable.emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {INDICATOR_TEXTS.reportTable.summary(
            table.getFilteredRowModel().rows.length,
            indicators.length
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {INDICATOR_TEXTS.reportTable.pagination.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {INDICATOR_TEXTS.reportTable.pagination.next}
        </Button>
      </div>
    </div>
  )
}
