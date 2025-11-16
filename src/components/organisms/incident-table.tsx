
"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
import { Incident } from "@/store/incident-store"
import { IncidentDetailDialog } from "./incident-detail-dialog"
import { ReportPreviewDialog } from "./report-preview-dialog"
import { IncidentAnalysisTable } from "./incident-analysis-table"
import { SkpReportDialog } from "./skp-report-dialog"
import type { IncidentTableProps } from "./incident-table.interface"
import {
  filterFns,
  getColumns,
  getExportColumns,
} from "./incident-table.utils"

export type IncidentTableHandle = {
  openExport: () => void
  openSkpReport: () => void
}

export const IncidentTable = React.forwardRef<
  IncidentTableHandle,
  IncidentTableProps
>(function IncidentTable(
  { incidents, lineChart, barChart, chartDescription },
  ref
) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isSkpReportOpen, setIsSkpReportOpen] = React.useState(false);


  const handleViewDetails = React.useCallback((incident: Incident) => {
    setSelectedIncident(incident)
    setIsDetailOpen(true)
  }, [])

  const columns = React.useMemo(() => getColumns(handleViewDetails), [handleViewDetails])

  const exportColumns = React.useMemo(
    () => getExportColumns(columns),
    [columns]
  )

  const table = useReactTable({
    data: incidents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns,
    state: {
      sorting,
      columnFilters,
    },
  })
  
  React.useImperativeHandle(ref, () => ({
    openExport: () => setIsPreviewOpen(true),
    openSkpReport: () => setIsSkpReportOpen(true),
  }))


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder="Cari berdasarkan jenis insiden..."
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("type")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Berikutnya
        </Button>
      </div>
       <IncidentDetailDialog 
        incident={selectedIncident}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
       <ReportPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          title="Laporan Insiden Keselamatan"
          description="Laporan ini berisi ringkasan visual dan data tabular dari insiden yang telah difilter."
          lineChart={lineChart}
          barChart={barChart}
          chartDescription={chartDescription}
          data={table.getFilteredRowModel().rows.map((row) => row.original)}
          columns={exportColumns}
          analysisTable={<IncidentAnalysisTable data={table.getFilteredRowModel().rows.map((row) => row.original)} />}
      />
      <SkpReportDialog open={isSkpReportOpen} onOpenChange={setIsSkpReportOpen} />
    </div>
  )
})
