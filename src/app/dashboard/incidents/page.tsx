
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IncidentReportDialog } from "@/components/organisms/incident-report-dialog"
import { IncidentTable } from "@/components/organisms/incident-table"
import { useIncidentStore } from "@/store/incident-store"
import { ColumnDef } from "@tanstack/react-table"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"

export default function IncidentsPage() {
  const incidents = useIncidentStore((state) => state.incidents)
  const [reportData, setReportData] = React.useState<any[] | null>(null)
  const [reportColumns, setReportColumns] = React.useState<ColumnDef<any>[] | null>(null)

  const handleExport = (data: any[], columns: ColumnDef<any>[]) => {
    setReportData(data);
    setReportColumns(columns);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Insiden Keselamatan</h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Insiden</CardTitle>
              <CardDescription>Daftar insiden keselamatan yang dilaporkan.</CardDescription>
            </div>
            <IncidentReportDialog />
          </div>
        </CardHeader>
        <CardContent>
          <IncidentTable incidents={incidents} onExport={handleExport} />
        </CardContent>
      </Card>
      {reportData && reportColumns && (
          <ReportPreviewDialog
              open={!!reportData}
              onOpenChange={(open) => !open && setReportData(null)}
              data={reportData}
              columns={reportColumns}
              title="Laporan Insiden Keselamatan Pasien"
          />
      )}
    </div>
  )
}
