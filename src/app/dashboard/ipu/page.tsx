
"use client"

import * as React from "react"
import { Line, LineChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LabelList } from "recharts"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { useIndicatorStore } from "@/store/indicator-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, ThumbsUp, ThumbsDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function IpuPage() {
  const { indicators } = useIndicatorStore()

  const ipuIndicators = React.useMemo(() => indicators.filter(i => i.category === 'IPU'), [indicators])
  
  const uniqueIndicatorNames = React.useMemo(() => {
    return ["Semua Indikator", ...new Set(ipuIndicators.map(i => i.indicator))]
  }, [ipuIndicators])

  const [selectedIndicator, setSelectedIndicator] = React.useState<string>("Semua Indikator");

  React.useEffect(() => {
    if (uniqueIndicatorNames.length > 0 && !selectedIndicator) {
      setSelectedIndicator(uniqueIndicatorNames[0]);
    }
  }, [uniqueIndicatorNames, selectedIndicator]);

  const totalIndicators = ipuIndicators.length
  const meetingStandard = ipuIndicators.filter(i => i.status === 'Memenuhi Standar').length
  const notMeetingStandard = totalIndicators - meetingStandard

  const chartData = React.useMemo(() => {
    if (ipuIndicators.length === 0) return []

    if (selectedIndicator === "Semua Indikator") {
      const monthlyAverages: { [key: string]: { total: number, count: number } } = {};
      
      ipuIndicators.forEach(i => {
        // Only average percentage-based indicators for simplicity
        if (i.standardUnit === '%') {
          const month = new Date(i.period).toLocaleString('default', { month: 'short' });
          if (!monthlyAverages[month]) {
            monthlyAverages[month] = { total: 0, count: 0 };
          }
          monthlyAverages[month].total += parseFloat(i.ratio);
          monthlyAverages[month].count += 1;
        }
      });
      
      return Object.entries(monthlyAverages).map(([month, data]) => ({
        month,
        "Rata-rata Capaian": data.count > 0 ? (data.total / data.count) : 0,
      })).slice(-6); // show last 6 months

    } else {
      return ipuIndicators
        .filter(i => i.indicator === selectedIndicator)
        .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
        .slice(-6)
        .map(i => ({
          month: new Date(i.period).toLocaleString('default', { month: 'short' }),
          Capaian: parseFloat(i.ratio),
          Standar: i.standard
        }));
    }
  }, [ipuIndicators, selectedIndicator])
  
  const getChartDescription = () => {
    if (selectedIndicator === 'Semua Indikator') {
        return 'Menampilkan rata-rata capaian semua indikator IPU (hanya unit %)'
    }
    return `Menampilkan tren 6 bulan terakhir untuk: ${selectedIndicator}`
  }

  const renderChart = () => {
    if (chartData.length === 0) {
        return (
             <div className="flex items-center justify-center h-full text-muted-foreground">
                Tidak cukup data untuk menampilkan grafik. Pilih indikator lain atau input data terlebih dahulu.
            </div>
        )
    }

    if (selectedIndicator === 'Semua Indikator') {
        return (
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="Rata-rata Capaian" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Rata-rata Capaian" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} />
                </Bar>
            </BarChart>
        )
    }

    return (
        <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Capaian" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }}>
                <LabelList dataKey="Capaian" position="top" />
            </Line>
            <Line type="monotone" dataKey="Standar" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
    )
  }

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

      <div className="space-y-4">
        <Card>
          <CardHeader>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>Capaian Indikator Terkini</CardTitle>
                    <CardDescription>{getChartDescription()}</CardDescription>
                </div>
                {uniqueIndicatorNames.length > 1 && (
                    <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                        <SelectTrigger className="w-full sm:w-[300px]">
                            <SelectValue placeholder="Pilih indikator..." />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueIndicatorNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
             </div>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                {renderChart()}
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <IndicatorReport 
            category="IPU"
            title="Laporan Indikator Prioritas Unit"
            description="Riwayat data Indikator Prioritas Unit (IPU) yang telah diinput."
            showInputButton={true}
        />
      </div>
    </div>
  )
}
