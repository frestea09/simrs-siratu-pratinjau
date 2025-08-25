"use client"

import React from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SurveyChartCardProps = {
  data: { name: string; value: number }[]
  chartType: "line" | "bar"
}

export function SurveyChartCard({ data, chartType }: SurveyChartCardProps) {
  const chartKey = React.useMemo(() => `${chartType}-${JSON.stringify(data)}`, [chartType, data]);

  const renderChart = () => {
    if (chartType === "line") {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            isAnimationActive={false}
          />
        </LineChart>
      )
    }
    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          isAnimationActive={false}
        />
      </BarChart>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Pengisian Survei</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length > 0 ? (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" key={chartKey}>
                {renderChart()}
              </ResponsiveContainer>
            </div>
            <ul className="grid gap-2 md:grid-cols-2">
              {data.map((item) => (
                <li key={item.name} className="text-sm">
                  <span className="font-medium">{item.name}:</span> {item.value} responden
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Belum ada data survei.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
