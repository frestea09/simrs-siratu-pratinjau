
"use client"

import React from "react"
import {
  Line,
  LineChart,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  LabelList,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SurveyChartCardProps = {
  chartData: any[]
  description: string
  chartType: 'line' | 'bar'
}

export function SurveyChartCard({
  chartData,
  description,
  chartType,
}: SurveyChartCardProps) {

  const renderChart = () => {
    const ChartComponent = chartType === "line" ? LineChart : BarChart
    const MainChartElement = chartType === "line" ? Line : Bar

    return (
      <ChartComponent data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
        />
        <Legend />
        <MainChartElement
          type="monotone"
          dataKey="Responden"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          radius={[4, 4, 0, 0]}
        >
          <LabelList dataKey="Responden" position="top" />
        </MainChartElement>
      </ChartComponent>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Pengisian Survei</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          {chartData.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Tidak ada data survei untuk rentang waktu ini.
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
