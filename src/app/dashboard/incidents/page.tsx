"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IncidentReportDialog } from "@/components/organisms/incident-report-dialog"
import { IncidentTable } from "@/components/organisms/incident-table"
import { useIncidentStore } from "@/store/incident-store"
import { ColumnDef } from "@tanstack/react-table"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { useUserStore } from "@/store/user-store.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"
import { format } from "date-fns"

export default function IncidentsPage() {
  const { currentUser } = useUserStore()
  const incidents = useIncidentStore((state) => state.incidents)
  const fetchIncidents = useIncidentStore((state) => state.fetchIncidents)
  const [reportData, setReportData] = React.useState<any[] | null>(null)
  const [reportColumns, setReportColumns] = React.useState<
    ColumnDef<any>[] | null
  >(null)
  const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false)

  React.useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const handleExport = (data: any[], columns: ColumnDef<any>[]) => {
    setReportData(data)
    setReportColumns(columns)
  }

  const dashboardRoles = [
    "Direktur",
    "Admin Sistem",
    "Sub. Komite Peningkatan Mutu",
    "Sub. Komite Keselamatan Pasien",
    "Sub. Komite Manajemen Risiko",
  ]

  const canViewDashboard = dashboardRoles.includes(currentUser?.role || "")

  const canViewIncidents =
    currentUser?.role === "Sub. Komite Keselamatan Pasien" ||
    currentUser?.role === "Admin Sistem"

  const incidentChartData = React.useMemo(() => {
    const counts: Record<string, any> = {}
    incidents.forEach((inc) => {
      const date = new Date(inc.date)
      if (isNaN(date.getTime())) return
      const key = format(date, "yyyy-MM")
      if (!counts[key]) {
        counts[key] = {
          month: format(date, "MMM yyyy"),
          KPC: 0,
          KNC: 0,
          KTC: 0,
          KTD: 0,
          Sentinel: 0,
        }
      }
      counts[key][inc.type] += 1
    })
    return Object.keys(counts)
      .sort()
      .map((key) => counts[key])
  }, [incidents])

  const AddNewButton = () => (
    <Button size="lg" onClick={() => setIsNewDialogOpen(true)}>
      <PlusCircle className="mr-2 h-5 w-5" />
      Laporkan Insiden Baru
    </Button>
  )

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Manajemen Insiden Keselamatan
        </h2>
        {!canViewIncidents && <AddNewButton />}
      </div>

      {canViewDashboard && (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Insiden</CardTitle>
            <CardDescription>
              Jumlah insiden per bulan berdasarkan jenis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="KPC"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="KNC"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="KTC"
                    stroke="#ffc658"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="KTD"
                    stroke="#ff7300"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="Sentinel"
                    stroke="#888888"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {canViewIncidents ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laporan Insiden</CardTitle>
                  <CardDescription>
                    Daftar insiden keselamatan yang dilaporkan.
                  </CardDescription>
                </div>
                <AddNewButton />
              </div>
            </CardHeader>
            <CardContent>
              <IncidentTable incidents={incidents} onExport={handleExport} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pelaporan Insiden</CardTitle>
            <CardDescription>
              Gunakan tombol di pojok kanan atas untuk melaporkan insiden baru
              secara anonim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Akses Terbatas</AlertTitle>
              <AlertDescription>
                Hanya Sub. Komite Keselamatan Pasien yang dapat melihat daftar
                laporan insiden untuk menjaga kerahasiaan data.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
      <IncidentReportDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
      />
    </div>
  )
}
