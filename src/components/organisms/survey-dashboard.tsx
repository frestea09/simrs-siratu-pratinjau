"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SurveyFilterCard } from "@/components/organisms/survey-filter-card"
import { useSurveyStore } from "@/store/survey-store"
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
} from "recharts"
import { getFilterRange, getFilterDescription, FilterType } from "@/lib/indicator-utils"
import { format } from "date-fns"

export function SurveyDashboard() {
  const surveys = useSurveyStore((state) => state.surveys)
  const [selectedUnit, setSelectedUnit] = React.useState("Semua")
  const [filterType, setFilterType] = React.useState<FilterType>("30d")
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [chartType, setChartType] = React.useState<"line" | "bar">("line")

  const availableUnits = React.useMemo(
    () => Array.from(new Set(surveys.map((s) => s.unit))),
    [surveys]
  )

  const filteredSurveys = React.useMemo(() => {
    const { start, end } = getFilterRange(filterType, selectedDate)
    return surveys.filter((s) => {
      const date = new Date(s.submissionDate)
      return (
        date >= start &&
        date <= end &&
        (selectedUnit === "Semua" || s.unit === selectedUnit)
      )
    })
  }, [surveys, selectedUnit, filterType, selectedDate])

  const chartData = React.useMemo(() => {
    const { start, end } = getFilterRange(filterType, selectedDate)
    const data: Record<string, { period: string; jumlah: number }> = {}
    const formatKey = (date: Date) => {
      if (filterType === "daily")
        return { key: format(date, "yyyy-MM-dd-HH"), label: format(date, "HH:mm") }
      if (["7d", "30d", "this_month"].includes(filterType))
        return { key: format(date, "yyyy-MM-dd"), label: format(date, "dd MMM") }
      if (["3m", "6m", "1y"].includes(filterType))
        return { key: format(date, "yyyy-MM"), label: format(date, "MMM yyyy") }
      if (["yearly"].includes(filterType))
        return { key: format(date, "yyyy"), label: format(date, "yyyy") }
      return { key: format(date, "yyyy-MM-dd"), label: format(date, "dd MMM") }
    }

    surveys.forEach((s) => {
      const date = new Date(s.submissionDate)
      if (isNaN(date.getTime())) return
      if (date < start || date > end) return
      if (selectedUnit !== "Semua" && s.unit !== selectedUnit) return
      const { key, label } = formatKey(date)
      if (!data[key]) {
        data[key] = { period: label, jumlah: 0 }
      }
      data[key].jumlah += 1
    })

    return Object.keys(data)
      .sort()
      .map((k) => data[k])
  }, [surveys, selectedUnit, filterType, selectedDate])

  const lineChart = (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Line type="monotone" dataKey="jumlah" stroke="#8884d8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const barChart = (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Bar dataKey="jumlah" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const noData = (
    <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Tidak ada data untuk periode ini.
    </p>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Survei</CardTitle>
        <CardDescription>{getFilterDescription(filterType, selectedDate)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SurveyFilterCard
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          availableUnits={availableUnits}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          chartType={chartType}
          setChartType={setChartType}
        />
        <div className="text-center text-xl font-semibold">
          Total Respon: {filteredSurveys.length}
        </div>
        {chartData.length > 0 ? (chartType === "line" ? lineChart : barChart) : noData}
      </CardContent>
    </Card>
  )
}

