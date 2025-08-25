"use client"

import * as React from "react"
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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { FilterType } from "@/lib/indicator-utils"

interface SurveyFilterCardProps {
  selectedUnit: string
  setSelectedUnit: (unit: string) => void
  availableUnits: string[]
  filterType: FilterType
  setFilterType: (type: FilterType) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  chartType: "line" | "bar"
  setChartType: (type: "line" | "bar") => void
}

export function SurveyFilterCard({
  selectedUnit,
  setSelectedUnit,
  availableUnits,
  filterType,
  setFilterType,
  selectedDate,
  setSelectedDate,
  chartType,
  setChartType,
}: SurveyFilterCardProps) {
  const renderDateInput = () => {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
    const months = Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: format(new Date(currentYear, i), "MMMM", { locale: IndonesianLocale }),
    }))

    if (filterType === "daily") {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate
                ? format(selectedDate, "PPP", { locale: IndonesianLocale })
                : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              disabled={{ after: new Date() }}
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
            onValueChange={(v) =>
              setSelectedDate(new Date(selectedDate.getFullYear(), parseInt(v)))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedDate.getFullYear().toString()}
            onValueChange={(v) =>
              setSelectedDate(new Date(parseInt(v), selectedDate.getMonth()))
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
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
          onValueChange={(v) =>
            setSelectedDate(new Date(parseInt(v), selectedDate.getMonth()))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
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

  const showCustom = ["daily", "monthly", "yearly"].includes(filterType)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FilterIcon className="mr-2 h-5 w-5 inline-block" />
          Filter & Tampilan Data
        </CardTitle>
        <CardDescription>
          Sesuaikan unit, rentang waktu, dan tampilan grafik.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Unit</SelectItem>
                {availableUnits.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rentang Waktu</Label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                <SelectItem value="3m">3 Bulan Terakhir</SelectItem>
                <SelectItem value="6m">6 Bulan Terakhir</SelectItem>
                <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
                <SelectItem value="daily">Harian (Kustom)</SelectItem>
                <SelectItem value="monthly">Bulanan (Kustom)</SelectItem>
                <SelectItem value="yearly">Tahunan (Kustom)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipe Grafik</Label>
            <div className="flex items-center rounded-md border p-1 w-fit">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChartType("line")}
                className={cn("h-8 w-8", chartType === "line" && "bg-muted")}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChartType("bar")}
                className={cn("h-8 w-8", chartType === "bar" && "bg-muted")}
              >
                <BarChartIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {showCustom && (
          <div className="space-y-2">
            <Label>Pilih Tanggal</Label>
            {renderDateInput()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

