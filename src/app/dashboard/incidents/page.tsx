"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IncidentReportDialog } from "@/components/organisms/incident-report-dialog"
import { IncidentTable } from "@/components/organisms/incident-table"
import { useIncidentStore } from "@/store/incident-store"

export default function IncidentsPage() {
  const incidents = useIncidentStore((state) => state.incidents)

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
          <IncidentTable incidents={incidents} />
        </CardContent>
      </Card>
    </div>
  )
}
