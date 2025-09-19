
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
import { Combobox } from "@/components/ui/combobox"
import { Filter, Calendar as CalendarIcon, LineChart as LineChartIcon, BarChart as BarChartIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { HOSPITAL_UNITS, INDICATOR_TEXTS } from "@/lib/constants"
import type { FilterType } from "@/lib/indicator-utils"
import type { IndicatorFilterCardProps } from "./indicator-filter-card.type"

const allUnitsLabel = INDICATOR_TEXTS.defaults.allUnits
const unitOptions = [
  { value: allUnitsLabel, label: allUnitsLabel },
  ...HOSPITAL_UNITS.map(u => ({ value: u, label: u })),
]

export function IndicatorFilterCard({
  userIsCentral,
  selectedUnit,
  setSelectedUnit,
  uniqueIndicatorNames,
  selectedIndicator,
  setSelectedIndicator,
  filterType,
  setFilterType,
  selectedDate,
  setSelectedDate,
  chartType,
  setChartType,
}: IndicatorFilterCardProps) {

  const renderFilterInput = () => {
    // Component logic from the original page
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
                : <span>{INDICATOR_TEXTS.filterCard.placeholders.date}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus disabled={{ after: new Date() }} month={selectedDate} /></PopoverContent>
        </Popover>
      )
    }
    if (filterType === "monthly") {
      return (
        <div className="flex gap-2">
          <Select value={selectedDate.getMonth().toString()} onValueChange={v => setSelectedDate(new Date(selectedDate.getFullYear(), parseInt(v)))}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedDate.getFullYear().toString()} onValueChange={v => setSelectedDate(new Date(parseInt(v), selectedDate.getMonth()))}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )
    }
    if (filterType === "yearly") {
      return (
        <Select value={selectedDate.getFullYear().toString()} onValueChange={v => setSelectedDate(new Date(parseInt(v), selectedDate.getMonth()))}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
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
          <Filter className="mr-2 h-5 w-5 inline-block" />
          {INDICATOR_TEXTS.filterCard.title}
        </CardTitle>
        <CardDescription>{INDICATOR_TEXTS.filterCard.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>{INDICATOR_TEXTS.filterCard.labels.filter}</Label>
            <div className="space-y-2">
              {userIsCentral && (
                <Combobox
                  options={unitOptions}
                  value={selectedUnit}
                  onSelect={setSelectedUnit}
                  placeholder={INDICATOR_TEXTS.filterCard.placeholders.unit}
                  searchPlaceholder={INDICATOR_TEXTS.filterCard.placeholders.unitSearch}
                />
              )}
              {uniqueIndicatorNames.length > 1 && (
                <Combobox
                  options={uniqueIndicatorNames}
                  value={selectedIndicator}
                  onSelect={setSelectedIndicator}
                  placeholder={INDICATOR_TEXTS.filterCard.placeholders.indicator}
                  searchPlaceholder={INDICATOR_TEXTS.filterCard.placeholders.indicatorSearch}
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{INDICATOR_TEXTS.filterCard.labels.displayRange}</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <Select value={filterType} onValueChange={v => setFilterType(v as FilterType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={INDICATOR_TEXTS.filterCard.placeholders.range} />
                  </SelectTrigger>
                  <SelectContent>
                    {INDICATOR_TEXTS.filterCard.filterTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center rounded-md border p-1 w-fit self-end">
                <Button variant="ghost" size="icon" onClick={() => setChartType("line")} className={cn("h-8 w-8", chartType === "line" && "bg-muted")}>
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setChartType("bar")} className={cn("h-8 w-8", chartType === "bar" && "bg-muted")}>
                  <BarChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {showCustomFilterInput && (
              <>
                <Label>{INDICATOR_TEXTS.filterCard.labels.custom}</Label>
                <div>{renderFilterInput()}</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
