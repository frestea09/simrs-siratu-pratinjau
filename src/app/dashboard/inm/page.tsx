
"use client"

import * as React from "react"
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
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { useIndicatorStore } from "@/store/indicator-store"
import {
  Target,
  ThumbsUp,
  ThumbsDown,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Calendar as CalendarIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FilterType,
  getFilterRange,
  getFilterDescription,
} from "@/lib/indicator-utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { id as IndonesianLocale } from "date-fns/locale"

type ChartType = "line" | "bar"

export default function InmPage() {
  const { indicators } = useIndicatorStore()

  const inmIndicators = React.useMemo(
    () => indicators.filter(i => i.category === "INM"),
    [indicators]
  )

  const uniqueIndicatorNames = React.useMemo(() => {
    return ["Semua Indikator", ...new Set(inmIndicators.map(i => i.indicator))]
  }, [inmIndicators])

  const [selectedIndicator, setSelectedIndicator] =
    React.useState<string>("Semua Indikator")
  const [chartType, setChartType] = React.useState<ChartType>("line")

  const [filterType, setFilterType] = React.useState<FilterType>("this_month")
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())

  const selectedIndicatorData = React.useMemo(() => {
    return inmIndicators.filter(
      i => selectedIndicator === "Semua Indikator" || i.indicator === i.indicator
    )
  }, [inmIndicators, selectedIndicator])

  const totalIndicators = inmIndicators.length
  const meetingStandard = inmIndicators.filter(
    i => i.status === "Memenuhi Standar"
  ).length
  const notMeetingStandard = totalIndicators - meetingStandard

  const filteredIndicatorsForTable = React.useMemo(() => {
    const { start, end } = getFilterRange(filterType, selectedDate)
    const startDate = new Date(start.setHours(0, 0, 0, 0))
    const endDate = new Date(end.setHours(23, 59, 59, 999))

    return selectedIndicatorData.filter(d => {
      const periodDate = parseISO(d.period)
      return periodDate >= startDate && periodDate <= endDate
    })
  }, [selectedIndicatorData, filterType, selectedDate])

  const chartData = React.useMemo(() => {
    const dataForChart = filteredIndicatorsForTable

    const getGroupKey = (date: Date) => {
      if (filterType === "daily") return format(date, "HH:00") // Group by hour
      if (
        filterType === "monthly" ||
        filterType === "7d" ||
        filterType === "30d"
      )
        return format(date, "yyyy-MM-dd") // Group by day
      if (
        filterType === "yearly" ||
        filterType === "3m" ||
        filterType === "6m" ||
        filterType === "1y"
      )
        return format(date, "yyyy-MM") // Group by month
      return format(date, "yyyy-MM-dd")
    }

    const groupedData = dataForChart.reduce((acc, curr) => {
      const key = getGroupKey(parseISO(curr.period))
      if (!acc[key]) {
        acc[key] = {
          date: parseISO(curr.period),
          Capaian: 0,
          Standar:
            selectedIndicator !== "Semua Indikator" ? curr.standard : undefined,
          count: 0,
        }
      }
      acc[key].Capaian += parseFloat(curr.ratio)
      acc[key].count += 1
      return acc
    }, {} as Record<string, { date: Date; Capaian: number; Standar?: number; count: number }>)

    return Object.values(groupedData)
      .map(d => ({
        ...d,
        Capaian: parseFloat((d.Capaian / d.count).toFixed(1)),
        name:
          filterType === "daily"
            ? format(d.date, "HH:mm")
            : filterType === "yearly" ||
              filterType === "3m" ||
              filterType === "6m" ||
              filterType === "1y"
            ? format(d.date, "MMM", { locale: IndonesianLocale })
            : format(d.date, "dd MMM"),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [filteredIndicatorsForTable, filterType, selectedIndicator])

  const getChartDescription = () => {
    const baseDescription =
      selectedIndicator === "Semua Indikator"
        ? "Menampilkan rata-rata capaian semua indikator INM."
        : `Menampilkan tren untuk: ${selectedIndicator}.`
    return `${baseDescription} ${getFilterDescription(filterType, selectedDate)}`
  }

  const ChartTooltipContent = (props: any) => {
    const { active, payload } = props
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = data.date
      const formattedDate =
        filterType === "yearly"
          ? format(date, "MMMM yyyy", { locale: IndonesianLocale })
          : format(date, "d MMMM yyyy, HH:mm", { locale: IndonesianLocale })

      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-bold text-foreground">{formattedDate}</p>
          <p className="text-sm text-primary">{`Capaian: ${data.Capaian}`}</p>
          {data.Standar && (
            <p className="text-sm text-destructive">{`Standar: ${data.Standar}`}</p>
          )}
        </div>
      )
    }
    return null
  }

  const renderFilterInput = () => {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
    const months = Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: format(new Date(currentYear, i), "MMMM", {
        locale: IndonesianLocale,
      }),
    }))

    if (filterType === "daily") {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP", { locale: IndonesianLocale })
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={date => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )
    }
    if (filterType === "monthly") {
      return (
        <div className="flex gap-2">
          <Select
            value={selectedDate.getMonth().toString()}
            onValueChange={v =>
              setSelectedDate(new Date(selectedDate.getFullYear(), parseInt(v)))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedDate.getFullYear().toString()}
            onValueChange={v =>
              setSelectedDate(new Date(parseInt(v), selectedDate.getMonth()))
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }
    if (filterType === "yearly") {
      return (
        <Select
          value={selectedDate.getFullYear().toString()}
          onValueChange={v =>
            setSelectedDate(new Date(parseInt(v), selectedDate.getMonth()))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    return null
  }

  const showCustomFilterInput = ["daily", "monthly", "yearly"].includes(
    filterType
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Indikator Nasional Mutu (INM)
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Indikator INM
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIndicators}</div>
            <p className="text-xs text-muted-foreground">
              indikator yang dimonitor
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Memenuhi Standar
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingStandard}</div>
            <p className="text-xs text-muted-foreground">capaian bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tidak Memenuhi Standar
            </CardTitle>
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
                <Select
                  value={filterType}
                  onValueChange={v => setFilterType(v as FilterType)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Pilih rentang..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_month">Bulan Ini</SelectItem>
                    <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                    <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                    <SelectItem value="3m">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="6m">6 Bulan Terakhir</SelectItem>
                    <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
                    <SelectItem value="daily">Harian (Custom)</SelectItem>
                    <SelectItem value="monthly">Bulanan (Custom)</SelectItem>
                    <SelectItem value="yearly">Tahunan (Custom)</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomFilterInput && renderFilterInput()}

                {uniqueIndicatorNames.length > 1 && (
                  <Select
                    value={selectedIndicator}
                    onValueChange={setSelectedIndicator}
                  >
                    <SelectTrigger className="w-full sm:w-[300px]">
                      <SelectValue placeholder="Pilih indikator..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueIndicatorNames.map(name => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex items-center rounded-md border p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChartType("line")}
                    className={cn(
                      "h-8 w-8",
                      chartType === "line" && "bg-muted"
                    )}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChartType("bar")}
                    className={cn(
                      "h-8 w-8",
                      chartType === "bar" && "bg-muted"
                    )}
                  >
                    <BarChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              {chartData.length > 0 ? (
                chartType === "line" ? (
                  <LineChart data={chartData}>
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
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Capaian"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      dot={<Dot r={4} />}
                    >
                      <LabelList dataKey="Capaian" position="top" />
                    </Line>
                    {selectedIndicator !== "Semua Indikator" &&
                      chartData.some(d => d.Standar) && (
                        <Line
                          type="monotone"
                          dataKey="Standar"
                          stroke="hsl(var(--destructive))"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      )}
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
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
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="Capaian"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    >
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
          reportDescription={getFilterDescription(filterType, selectedDate)}
          indicators={filteredIndicatorsForTable}
        />
      </div>
    </div>
  )
}
