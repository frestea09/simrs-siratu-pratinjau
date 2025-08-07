
"use client"

import * as React from "react"
import { Bar, BarChart as BarChartRecharts, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { useIndicatorStore } from "@/store/indicator-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, ThumbsUp, ThumbsDown } from "lucide-react"

export default function IpuPage() {
  const { indicators } = useIndicatorStore()

  const ipuIndicators = React.useMemo(() => indicators.filter(i => i.category === 'IPU'), [indicators])
  
  const totalIndicators = ipuIndicators.length
  const meetingStandard = ipuIndicators.filter(i => i.status === 'Memenuhi Standar').length
  const notMeetingStandard = totalIndicators - meetingStandard

  const chartData = React.useMemo(() => {
    if (ipuIndicators.length === 0) return []
    // Get the most recent 6 months of data for the first indicator
    const firstIndicatorName = ipuIndicators[0].indicator;
    return ipuIndicators
      .filter(i => i.indicator === firstIndicatorName)
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
      .slice(-6)
      .map(i => ({
        month: new Date(i.period).toLocaleString('default', { month: 'short' }),
        value: parseFloat(i.ratio),
        standard: i.standard
      }));
  }, [ipuIndicators])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Prioritas Unit (IPU)</h2>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Indikator IPU</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIndicators}</div>
              <p className="text-xs text-muted-foreground">indikator yang dimonitor</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memenuhi Standar</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetingStandard}</div>
              <p className="text-xs text-muted-foreground">capaian bulan ini</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tidak Memenuhi Standar</CardTitle>
              <ThumbsDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notMeetingStandard}</div>
              <p className="text-xs text-muted-foreground">capaian bulan ini</p>
            </CardContent>
          </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Capaian Indikator Terkini</CardTitle>
            <CardDescription>Menampilkan tren 6 bulan terakhir untuk: {ipuIndicators.length > 0 ? ipuIndicators[0].indicator : 'Belum ada data'}</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                {chartData.length > 0 ? (
                    <BarChartRecharts data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChartRecharts>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Tidak cukup data untuk menampilkan grafik.
                    </div>
                )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="col-span-4 lg:col-span-3">
             <IndicatorReport 
                category="IPU"
                title="Laporan Indikator Prioritas Unit"
                description="Riwayat data Indikator Prioritas Unit (IPU) yang telah diinput."
                showInputButton={true}
            />
        </div>
      </div>
    </div>
  )
}
