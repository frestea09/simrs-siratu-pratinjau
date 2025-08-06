
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SpmTable } from "@/components/organisms/spm-table"
import { useSpmStore } from "@/store/spm-store"
import { SpmInputDialog } from "@/components/organisms/spm-input-dialog"
import { ColumnDef } from "@tanstack/react-table"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"

export default function SpmPage() {
  const spmIndicators = useSpmStore((state) => state.spmIndicators)
  const [reportData, setReportData] = React.useState<any[] | null>(null)
  const [reportColumns, setReportColumns] = React.useState<ColumnDef<any>[] | null>(null)

  const handleExport = (data: any[], columns: ColumnDef<any>[]) => {
    setReportData(data);
    setReportColumns(columns);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Standar Pelayanan Minimal (SPM)</h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Capaian SPM</CardTitle>
              <CardDescription>Daftar capaian indikator Standar Pelayanan Minimal.</CardDescription>
            </div>
            <SpmInputDialog />
          </div>
        </CardHeader>
        <CardContent>
          <SpmTable indicators={spmIndicators} onExport={handleExport} />
        </CardContent>
      </Card>
      {reportData && reportColumns && (
          <ReportPreviewDialog
              open={!!reportData}
              onOpenChange={(open) => !open && setReportData(null)}
              data={reportData}
              columns={reportColumns}
              title="Laporan Standar Pelayanan Minimal (SPM)"
          />
      )}
    </div>
  )
}
