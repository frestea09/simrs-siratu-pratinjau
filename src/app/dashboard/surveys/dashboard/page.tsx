"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSurveyStore } from "@/store/survey-store"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

export default function SurveyDashboardPage() {
  const surveys = useSurveyStore((state) => state.surveys)

  const chartData = React.useMemo(
    () =>
      surveys.map((s) => ({
        unit: s.unit,
        score: Number(s.totalScore.toFixed(2)),
      })),
    [surveys]
  )

  const avgScore = React.useMemo(() => {
    if (chartData.length === 0) return 0
    return chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length
  }, [chartData])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Survei Budaya</h2>
      <Card>
        <CardHeader>
          <CardTitle>Rata-rata Skor Per Unit</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="unit" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Belum ada data survei.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Rata-rata Skor Keseluruhan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{avgScore.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
