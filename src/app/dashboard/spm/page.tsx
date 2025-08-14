
"use client"

import * as React from "react"
import { Line, LineChart, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LabelList, Dot } from "recharts"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { useIndicatorStore } from "@/store/indicator-store"
import { Target, ThumbsUp, ThumbsDown, LineChart as LineChartIcon, BarChart as BarChartIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parseISO } from 'date-fns'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TimeRange, getStartDate, timeRangeToLabel } from "@/lib/indicator-utils"

type ChartType = 'line' | 'bar';

const ChartTooltipContent = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const date = data.date;
        // Simple heuristic to determine date format
        const isMonthly = data.name.length === 3;
        const formattedDate = isMonthly ? format(date, 'MMMM yyyy') : format(date, 'd MMMM yyyy');
      
        return (
            <div className="p-2 bg-background border rounded-md shadow-lg">
                <p className="font-bold text-foreground">{formattedDate}</p>
                <p className="text-sm text-primary">{`Capaian: ${data.Capaian}`}</p>
                {data.Standar && <p className="text-sm text-destructive">{`Standar: ${data.Standar}`}</p>}
            </div>
        );
    }
    return null;
};

const CustomChart = ({ chartType, data, unit, selectedIndicator }: { chartType: ChartType, data: any[], unit: string, selectedIndicator: string }) => {
    if (data.length === 0) return null;

    const ChartComponent = chartType === 'line' ? LineChart : BarChart;

    return (
      <>
        <CardTitle className="px-6 pt-4 text-lg">
          Rata-rata Capaian Indikator ({unit})
        </CardTitle>
        <ResponsiveContainer width="100%" height={350}>
            <ChartComponent data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              {chartType === 'line' ? (
                <>
                    <Line 
                        type="monotone" 
                        dataKey="Capaian" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        activeDot={<Dot r={6} fill="hsl(var(--primary))" />}
                        dot={<Dot r={4} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />}
                    >
                        <LabelList dataKey="Capaian" position="top" />
                    </Line>
                    {selectedIndicator !== 'Semua Indikator' && data.some(d => d.Standar) && (
                        <Line type="monotone" dataKey="Standar" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    )}
                </>
              ) : (
                 <Bar dataKey="Capaian" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Capaian" position="top" />
                  </Bar>
              )}
            </ChartComponent>
        </ResponsiveContainer>
      </>
    );
};

export default function SpmPage() {
  const { indicators } = useIndicatorStore();

  const spmIndicators = React.useMemo(() => indicators.filter(i => i.category === 'SPM'), [indicators]);
  
  const uniqueIndicatorNames = React.useMemo(() => {
    return ["Semua Indikator", ...new Set(spmIndicators.map(i => i.indicator))]
  }, [spmIndicators])

  const [selectedIndicator, setSelectedIndicator] = React.useState<string>("Semua Indikator");
  const [timeRange, setTimeRange] = React.useState<TimeRange>('6m');
  const [chartType, setChartType] = React.useState<ChartType>('line');

  const selectedIndicatorData = React.useMemo(() => {
    return spmIndicators.filter(i => selectedIndicator === 'Semua Indikator' || i.indicator === selectedIndicator);
  }, [spmIndicators, selectedIndicator]);
  
  const totalIndicators = spmIndicators.length;
  const meetingStandard = spmIndicators.filter(i => i.status === 'Memenuhi Standar').length;
  const notMeetingStandard = totalIndicators - meetingStandard;
  
  const { chartData, chartDataMinutes } = React.useMemo(() => {
    const startDate = getStartDate(timeRange);
    const filtered = selectedIndicatorData.filter(d => parseISO(d.period) >= startDate);

    const getGroupKey = (date: Date) => {
        if (timeRange === '7d' || timeRange === '30d') return format(date, 'yyyy-MM-dd');
        if (timeRange === '3m' || timeRange === '6m' || timeRange === '1y') return format(date, 'yyyy-MM');
        return format(date, 'yyyy-MM-dd');
    };

    const processData = (unit: '%' | 'menit') => {
      const unitFiltered = filtered.filter(i => i.standardUnit === unit);
      const groupedData = unitFiltered.reduce((acc, curr) => {
          const key = getGroupKey(parseISO(curr.period));
          if (!acc[key]) {
              acc[key] = {
                  date: parseISO(curr.period),
                  Capaian: 0,
                  Standar: selectedIndicator !== 'Semua Indikator' ? curr.standard : undefined,
                  count: 0
              };
          }
          acc[key].Capaian += parseFloat(curr.ratio);
          acc[key].count += 1;
          return acc;
      }, {} as Record<string, { date: Date, Capaian: number, Standar?: number, count: number }>);
      
      return Object.values(groupedData)
        .map(d => ({
            ...d,
            Capaian: parseFloat((d.Capaian / d.count).toFixed(1)),
            name: timeRange === '3m' || timeRange === '6m' || timeRange === '1y' ? format(d.date, 'MMM') : format(d.date, 'dd MMM'),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    return {
      chartData: processData('%'),
      chartDataMinutes: processData('menit')
    };
  }, [selectedIndicatorData, timeRange, selectedIndicator]);
  
  const filteredIndicatorsForTable = React.useMemo(() => {
    const startDate = getStartDate(timeRange);
    return selectedIndicatorData.filter(d => parseISO(d.period) >= startDate);
  }, [selectedIndicatorData, timeRange]);

  const getChartDescription = () => {
    if (selectedIndicator === 'Semua Indikator') {
        return 'Menampilkan rata-rata capaian semua indikator SPM'
    }
    return `Menampilkan tren untuk: ${selectedIndicator}`
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Standar Pelayanan Minimal (SPM)</h2>
      </div>
       
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Indikator SPM</CardTitle>
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
                <div className="flex gap-2">
                     <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Pilih rentang..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">7 Hari</SelectItem>
                            <SelectItem value="30d">30 Hari</SelectItem>
                            <SelectItem value="3m">3 Bulan</SelectItem>
                            <SelectItem value="6m">6 Bulan</SelectItem>
                            <SelectItem value="1y">1 Tahun</SelectItem>
                        </SelectContent>
                    </Select>
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
                    <div className="flex items-center rounded-md border p-1">
                        <Button variant="ghost" size="icon" onClick={() => setChartType('line')} className={cn("h-8 w-8", chartType === 'line' && 'bg-muted')}>
                            <LineChartIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setChartType('bar')} className={cn("h-8 w-8", chartType === 'bar' && 'bg-muted')}>
                            <BarChartIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
             </div>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length === 0 && chartDataMinutes.length === 0 ? (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    Tidak cukup data untuk menampilkan grafik.
                </div>
            ) : (
                <>
                    <CustomChart chartType={chartType} data={chartData} unit="%" selectedIndicator={selectedIndicator} />
                    <CustomChart chartType={chartType} data={chartDataMinutes} unit="Menit" selectedIndicator={selectedIndicator} />
                </>
            )}
          </CardContent>
        </Card>
        
        <IndicatorReport 
            category="SPM"
            title="Laporan Standar Pelayanan Minimal"
            description="Riwayat data Standar Pelayanan Minimal (SPM) yang telah diinput."
            showInputButton={true}
            chartData={chartData.length > 0 ? chartData : chartDataMinutes}
            chartDescription={getChartDescription()}
            reportDescription={`Menampilkan data untuk filter: ${timeRangeToLabel(timeRange)}`}
            indicators={filteredIndicatorsForTable}
        />
      </div>
    </div>
  )
}
