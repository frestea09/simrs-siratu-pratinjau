
"use client"

import React from "react"
import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { Indicator } from "@/store/indicator-store"
import { FilterType, getFilterRange } from "@/lib/indicator-utils"
import { matchUnit } from "@/lib/indicator-utils"
import { INDICATOR_TEXTS } from "@/lib/constants"

type UseIndicatorDataProps = {
  allIndicators: Indicator[];
  selectedUnit: string;
  selectedIndicator: string;
  filterType: FilterType;
  selectedDate: Date;
}

export function useIndicatorData({ allIndicators, selectedUnit, selectedIndicator, filterType, selectedDate }: UseIndicatorDataProps) {

  const indicatorsForUnit = React.useMemo(() => {
    if (selectedUnit === INDICATOR_TEXTS.defaults.allUnits) return allIndicators
    return allIndicators.filter(i => matchUnit(i.unit, selectedUnit))
  }, [allIndicators, selectedUnit])

  const uniqueIndicatorNames = React.useMemo(() => {
    const names = new Set(indicatorsForUnit.map(i => i.indicator))
    return [
      {
        value: INDICATOR_TEXTS.defaults.allIndicators,
        label: INDICATOR_TEXTS.defaults.allIndicators,
      },
      ...Array.from(names).map(name => ({ value: name, label: name }))
    ]
  }, [indicatorsForUnit])

  const selectedIndicatorData = React.useMemo(() => {
    return indicatorsForUnit.filter(
      i => selectedIndicator === INDICATOR_TEXTS.defaults.allIndicators || i.indicator === selectedIndicator
    )
  }, [indicatorsForUnit, selectedIndicator])

  const { totalIndicators, meetingStandard, notMeetingStandard } = React.useMemo(() => {
    const { start, end } = getFilterRange("this_month", new Date()) // Always use 'this_month' for overview cards
    const currentMonthIndicators = indicatorsForUnit.filter(d => {
      const periodDate = parseISO(d.period);
      return periodDate >= start && periodDate <= end;
    });

    const total = currentMonthIndicators.length
    const meeting = currentMonthIndicators.filter(i => i.status === "Memenuhi Standar").length
    return {
      totalIndicators: total,
      meetingStandard: meeting,
      notMeetingStandard: total - meeting
    }
  }, [indicatorsForUnit])

  const filteredIndicatorsForTable = React.useMemo(() => {
    const { start, end } = getFilterRange(filterType, selectedDate)
    return selectedIndicatorData.filter(d => {
      const periodDate = parseISO(d.period)
      return periodDate >= start && periodDate <= end
    })
  }, [selectedIndicatorData, filterType, selectedDate])

  const chartData = React.useMemo(() => {
    const getGroupKey = (date: Date) => {
      if (filterType === "daily") return format(date, "HH:00")
      if (["monthly", "7d", "30d", "this_month"].includes(filterType)) return format(date, "yyyy-MM-dd")
      if (["yearly", "3m", "6m", "1y", "3y"].includes(filterType)) return format(date, "yyyy-MM")
      return format(date, "yyyy-MM-dd")
    }

    const groupedData = filteredIndicatorsForTable.reduce(
      (acc, curr) => {
        const key = getGroupKey(parseISO(curr.period))
        if (!acc[key]) {
          acc[key] = {
            date: parseISO(curr.period),
            Capaian: 0,
            Standar:
              selectedIndicator !== INDICATOR_TEXTS.defaults.allIndicators
                ? curr.standard
                : undefined,
            count: 0,
            unit: curr.standardUnit,
          }
        }
        acc[key].Capaian += parseFloat(curr.ratio)
        acc[key].count += 1
        return acc
      },
      {} as Record<string, { date: Date; Capaian: number; Standar?: number; count: number, unit: string }>
    )

    return Object.values(groupedData)
      .map(d => {
        const capaian = parseFloat((d.Capaian / d.count).toFixed(1));
        return {
          ...d,
          Capaian: capaian,
          Standar: d.Standar,
          name: ["daily"].includes(filterType)
            ? format(d.date, "HH:mm")
            : ["yearly", "3m", "6m", "1y", "3y"].includes(filterType)
              ? format(d.date, "MMM", { locale: IndonesianLocale })
              : format(d.date, "dd MMM"),
          label: `${capaian}${d.unit}`,
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [filteredIndicatorsForTable, filterType, selectedIndicator])


  return {
    indicatorsForUnit,
    uniqueIndicatorNames,
    selectedIndicatorData,
    totalIndicators,
    meetingStandard,
    notMeetingStandard,
    filteredIndicatorsForTable,
    chartData,
  }
}
