
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

type IncidentFilterCardProps = {
  selectedType: string
  setSelectedType: (type: string) => void
  selectedRiskType: string
  setSelectedRiskType: (type: string) => void
  selectedRiskLevel: string
  setSelectedRiskLevel: (level: string) => void
  filterType: FilterType
  setFilterType: (type: FilterType) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  chartType: "line" | "bar"
  setChartType: (type: "line" | "bar") => void
}

const INCIDENT_TYPES = ["Semua", "KPC", "KNC", "KTC", "KTD", "Sentinel"]
const RISK_TYPES = [
  "Semua",
  "Kematian",
  "Cedera ireversibel / Cedera Berat",
  "Cedera reversibel / Cedera Sedang",
  "Cedera Ringan",
  "Tidak ada cedera",
]
const RISK_LEVELS = ["Semua", "biru", "hijau", "kuning", "merah"]

export function IncidentFilterCard({
  selectedType,
  setSelectedType,
  selectedRiskType,
  setSelectedRiskType,
  selectedRiskLevel,
  setSelectedRiskLevel,
  filterType,
  setFilterType,
  selectedDate,
  setSelectedDate,
  chartType,
  setChartType,
}: IncidentFilterCardProps) {
  const renderFilterInput = () => {
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
              variant={"outline"}
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
          <PopoverContent className="w-auto p-0">
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

  const showCustomFilterInput = ["daily", "monthly", "yearly"].includes(filterType)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FilterIcon className="mr-2 h-5 w-5 inline-block" />
          Filter & Tampilan Data
        </CardTitle>
        <CardDescription>
          Gunakan filter di bawah untuk menampilkan data yang lebih spesifik.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Jenis Insiden</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Jenis Risiko</Label>
            <Select value={selectedRiskType} onValueChange={setSelectedRiskType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih jenis risiko" />
              </SelectTrigger>
              <SelectContent>
                {RISK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tingkat Risiko</Label>
            <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tingkat risiko" />
              </SelectTrigger>
              <SelectContent>
                {RISK_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l === "biru"
                      ? "BIRU (Rendah)"
                      : l === "hijau"
                      ? "HIJAU (Sedang)"
                      : l === "kuning"
                      ? "KUNING (Tinggi)"
                      : l === "merah"
                      ? "MERAH (Sangat Tinggi)"
                      : l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tampilan & Rentang Waktu</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih rentang..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                    <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                    <SelectItem value="3m">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
                    <SelectItem value="3y">3 Tahun Terakhir</SelectItem>
                    <SelectItem value="daily">Harian (Custom)</SelectItem>
                    <SelectItem value="monthly">Bulanan (Custom)</SelectItem>
                    <SelectItem value="yearly">Tahunan (Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center rounded-md border p-1 w-fit self-end">
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
        </div>
        {showCustomFilterInput && (
          <div className="space-y-2">
            <Label>Filter Kustom</Label>
            <div>{renderFilterInput()}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
