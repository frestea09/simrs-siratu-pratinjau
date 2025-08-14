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
import { TimeRange, getStartDate, getTimeRangeDescription } from "@/lib/indicator-utils"

type ChartType = 'line' | 'bar';

export default function InmPage() {
  const { indicators } = useIndicatorStore();

  const inmIndicators = React.useMemo(() => indicators.filter(i => i.category === 'INM'), [indicators]);
  
  const uniqueIndicatorNames = React.useMemo(() => {
    return ["Semua Indikator", ...new Set(inmIndicators.map(i => i.indicator))]
  }, [inmIndicators])

  const [selectedIndicator, setSelectedIndicator] = React.useState<string>("Semua Indikator");
  const [timeRange, setTimeRange] = React.useState<TimeRange>('6m');
  const [chartType, setChartType] = React.useState<ChartType>('line');

  const selectedIndicatorData = React.useMemo(() => {
    return inmIndicators.filter(i => selectedIndicator === 'Semua Indikator' || i.indicator === selectedIndicator);
  }, [inmIndicators, selectedIndicator]);
  
  const totalIndicators = inmIndicators.length;
  const meetingStandard = inmIndicators.filter(i => i.status === 'Memenuhi Standar').length;
  const notMeetingStandard = totalIndicators - meetingStandard;
  
  const filteredIndicatorsForTable = React.useMemo(() => {
    const startDate = getStartDate(timeRange);
    const endDate = new Date();
    return selectedIndicatorData.filter(d => {
        const periodDate = parseISO(d.period);
        return periodDate >= startDate && periodDate <= endDate;
    });
  }, [selectedIndicatorData, timeRange]);

  const chartData = React.useMemo(() => {
    const dataForChart = filteredIndicatorsForTable;

    const getGroupKey = (date: Date) => {
        if (timeRange === '7d' || timeRange === '30d') return format(date, 'yyyy-MM-dd');
        if (timeRange === '3m' || timeRange === '6m' || timeRange === '1y') return format(date, 'yyyy-MM');
        return format(date, 'yyyy-MM-dd');
    };

    const groupedData = dataForChart.reduce((acc, curr) => {
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
      
  }, [filteredIndicatorsForTable, timeRange, selectedIndicator]);


  const getChartDescription = () => {
    const baseDescription = selectedIndicator === 'Semua Indikator' 
        ? 'Menampilkan rata-rata capaian semua indikator INM.' 
        : `Menampilkan tren untuk: ${selectedIndicator}.`;
    return `${baseDescription} ${getTimeRangeDescription(timeRange)}`;
  }

  const ChartTooltipContent = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const date = data.date;
        const formattedDate = (timeRange === '3m' || timeRange === '6m' || timeRange === '1y') ? format(date, 'MMMM yyyy') : format(date, 'd MMMM yyyy');
      
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Nasional Mutu (INM)</h2>
      </div>
       
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Indikator INM</CardTitle>
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
                <div className="flex flex-wrap items-center justify-end gap-2">
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
            <ResponsiveContainer width="100%" height={350}>
              {chartData.length > 0 ? (
                  chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="Capaian" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} dot={<Dot r={4} />}>
                        <LabelList dataKey="Capaian" position="top" />
                      </Line>
                      {selectedIndicator !== 'Semua Indikator' && chartData.some(d => d.Standar) && (
                        <Line type="monotone" dataKey="Standar" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      )}
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="Capaian" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="Capaian" position="top" />
                      </Bar>
                    </BarChart>
                  )
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Tidak cukup data untuk menampilkan grafik.
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <IndicatorReport 
            category="INM"
            title="Laporan Indikator Nasional Mutu"
            description="Riwayat data Indikator Nasional Mutu (INM) yang telah diinput."
            showInputButton={true}
            chartData={chartData}
            reportDescription={getTimeRangeDescription(timeRange)}
            indicators={filteredIndicatorsForTable}
        />
      </div>
    </div>
  )
}
