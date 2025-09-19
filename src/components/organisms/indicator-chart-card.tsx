
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
  Dot,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { INDICATOR_TEXTS } from "@/lib/constants"

type IndicatorChartCardProps = {
  chartData: any[]
  description: string
  filterType: string
  selectedIndicator: string
  chartType: 'line' | 'bar'
}

export function IndicatorChartCard({
  chartData,
  description,
  filterType,
  selectedIndicator,
  chartType,
}: IndicatorChartCardProps) {

  const ChartTooltipContent = (props: any) => {
    const { active, payload } = props
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = data.date
      const formattedDate = ["yearly", "1y", "6m", "3m"].includes(filterType)
        ? format(date, "MMMM yyyy", { locale: IndonesianLocale })
        : format(date, "d MMMM yyyy, HH:mm", { locale: IndonesianLocale })

      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-bold text-foreground">{formattedDate}</p>
          <p className="text-sm text-primary">{`${INDICATOR_TEXTS.chartCard.tooltip.capaian}: ${data.Capaian}${data.unit}`}</p>
          {data.Standar && (
            <p className="text-sm text-destructive">{`${INDICATOR_TEXTS.chartCard.tooltip.standar}: ${data.Standar}${data.unit}`}</p>
          )}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const ChartComponent = chartType === "line" ? LineChart : BarChart
    const MainChartElement =
      (chartType === "line" ? Line : Bar) as React.ElementType

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
          tickFormatter={(value) => `${value}${chartData[0]?.unit || ''}`}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <MainChartElement
          type="monotone"
          dataKey="Capaian"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={<Dot r={4} />}
          {...(chartType === "bar" ? { radius: [4, 4, 0, 0] } : {})}
        >
          <LabelList dataKey="label" position="top" />
        </MainChartElement>
        {chartType === "line" && selectedIndicator !== INDICATOR_TEXTS.defaults.allIndicators && chartData.some(d => d.Standar) && (
          <Line
            type="monotone"
            dataKey="Standar"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
      </ChartComponent>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{INDICATOR_TEXTS.chartCard.title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          {chartData.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {INDICATOR_TEXTS.chartCard.emptyState}
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
