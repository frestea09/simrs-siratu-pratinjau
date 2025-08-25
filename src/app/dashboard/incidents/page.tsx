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
import { IncidentFilterCard } from "@/components/organisms/incident-filter-card"
import { useIncidentStore } from "@/store/incident-store"
import { useUserStore } from "@/store/user-store.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"
import { format } from "date-fns"
import { getFilterRange, getFilterDescription, FilterType } from "@/lib/indicator-utils"

export default function IncidentsPage() {
  const { currentUser } = useUserStore()
  const incidents = useIncidentStore((state) => state.incidents)
  const fetchIncidents = useIncidentStore((state) => state.fetchIncidents)
  const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>("Semua")
  const [filterType, setFilterType] = React.useState<FilterType>("this_month")
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [chartType, setChartType] = React.useState<"line" | "bar">("line")
  const [selectedRiskType, setSelectedRiskType] = React.useState<string>("Semua")
  const [selectedRiskLevel, setSelectedRiskLevel] = React.useState<string>("Semua")

  React.useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

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
    const { start, end } = getFilterRange(filterType, selectedDate)
    const data: Record<string, any> = {}
    const formatKey = (date: Date) => {
      if (filterType === "daily")
        return { key: format(date, "yyyy-MM-dd-HH"), label: format(date, "HH:mm") }
      if (["7d", "30d", "this_month"].includes(filterType))
        return { key: format(date, "yyyy-MM-dd"), label: format(date, "dd MMM") }
      if (["3m", "6m", "1y"].includes(filterType))
        return { key: format(date, "yyyy-MM"), label: format(date, "MMM yyyy") }
      if (["3y", "yearly"].includes(filterType))
        return { key: format(date, "yyyy"), label: format(date, "yyyy") }
      return { key: format(date, "yyyy-MM-dd"), label: format(date, "dd MMM") }
    }

    incidents.forEach((inc) => {
      const date = new Date(inc.date)
      if (isNaN(date.getTime())) return
      if (date < start || date > end) return
      if (selectedType !== "Semua" && inc.type !== selectedType) return
      if (selectedRiskType !== "Semua" && inc.patientImpact !== selectedRiskType)
        return
      if (selectedRiskLevel !== "Semua" && inc.severity !== selectedRiskLevel)
        return
      const { key, label } = formatKey(date)
      if (!data[key]) {
        data[key] = {
          period: label,
          KPC: 0,
          KNC: 0,
          KTC: 0,
          KTD: 0,
          Sentinel: 0,
        }
      }
      data[key][inc.type] += 1
    })
    return Object.keys(data)
      .sort()
      .map((key) => data[key])
  }, [incidents, filterType, selectedDate, selectedType, selectedRiskType, selectedRiskLevel])

  const filteredIncidents = React.useMemo(() => {
    const { start, end } = getFilterRange(filterType, selectedDate)
    return incidents.filter((inc) => {
      const date = new Date(inc.date)
      return (
        date >= start &&
        date <= end &&
        (selectedType === "Semua" || inc.type === selectedType) &&
        (selectedRiskType === "Semua" || inc.patientImpact === selectedRiskType) &&
        (selectedRiskLevel === "Semua" || inc.severity === selectedRiskLevel)
      )
    })
  }, [incidents, filterType, selectedDate, selectedType, selectedRiskType, selectedRiskLevel])

  const filteredForCounts = React.useMemo(() => {
    const { start, end } = getFilterRange(filterType, selectedDate)
    return incidents.filter((inc) => {
      const date = new Date(inc.date)
      return (
        date >= start &&
        date <= end &&
        (selectedRiskType === "Semua" || inc.patientImpact === selectedRiskType) &&
        (selectedRiskLevel === "Semua" || inc.severity === selectedRiskLevel)
      )
    })
  }, [incidents, filterType, selectedDate, selectedRiskType, selectedRiskLevel])

  const incidentTypeCounts = React.useMemo(() => {
    const counts = { KPC: 0, KNC: 0, KTC: 0, KTD: 0, Sentinel: 0 }
    filteredForCounts.forEach((inc) => {
      counts[inc.type as keyof typeof counts] += 1
    })
    return counts
  }, [filteredForCounts])

  const colorMap: Record<string, string> = {
    KPC: "#8884d8",
    KNC: "#82ca9d",
    KTC: "#ffc658",
    KTD: "#ff7300",
    Sentinel: "#888888",
  }

  const typesToShow = selectedType === "Semua" ? Object.keys(colorMap) : [selectedType]

  const chartKey = React.useMemo(() => `${chartType}-${typesToShow.join('-')}`, [chartType, typesToShow]);

  const lineChart = (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%" key={chartKey}>
        <LineChart data={incidentChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Legend />
          {typesToShow.map((t) => (
            <Line key={t} type="monotone" dataKey={t} stroke={colorMap[t]} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const barChart = (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%" key={chartKey}>
        <BarChart data={incidentChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Legend />
          {typesToShow.map((t) => (
            <Bar key={t} dataKey={t} fill={colorMap[t]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const noDataMessage = (
    <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Tidak ada data untuk periode ini.
    </p>
  )

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
        <>
          <IncidentFilterCard
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedRiskType={selectedRiskType}
            setSelectedRiskType={setSelectedRiskType}
            selectedRiskLevel={selectedRiskLevel}
            setSelectedRiskLevel={setSelectedRiskLevel}
            filterType={filterType}
            setFilterType={setFilterType}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            chartType={chartType}
            setChartType={setChartType}
          />
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Jumlah Insiden</CardTitle>
              <CardDescription>
                {getFilterDescription(filterType, selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(incidentTypeCounts).map(([type, count]) => (
                  <div
                    key={type}
                    className="bg-muted/50 rounded-lg p-4 text-center"
                  >
                    <p className="text-sm font-medium">{type}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Insiden</CardTitle>
              <CardDescription>
                {getFilterDescription(filterType, selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 350 }}>
                {incidentChartData.length > 0
                  ? (chartType === "line" ? lineChart : barChart)
                  : noDataMessage}
              </div>
            </CardContent>
          </Card>
        </>
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
              <IncidentTable
                incidents={filteredIncidents}
                lineChart={incidentChartData.length > 0 ? lineChart : noDataMessage}
                barChart={incidentChartData.length > 0 ? barChart : noDataMessage}
                chartDescription={
                  incidentChartData.length > 0
                    ? getFilterDescription(filterType, selectedDate)
                    : undefined
                }
              />
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
