
"use client"

import * as React from "react"
import { parseISO } from "date-fns"

import { useUserStore } from "@/store/user-store.tsx"
import { getFilterRange, getFilterDescription } from "@/lib/indicator-utils"
import type { FilterType } from "@/lib/indicator-utils"
import { useIndicatorData } from "@/hooks/use-indicator-data"
import { IndicatorFilterCard } from "@/components/organisms/indicator-filter-card"
import { IndicatorChartCard } from "@/components/organisms/indicator-chart-card"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { IndicatorStatCards } from "@/components/organisms/indicator-stat-cards"
import { Indicator, IndicatorCategory as PrismaIndicatorCategory } from "@prisma/client"
import { getCurrentUser } from "@/lib/actions/auth"

type IndicatorDashboardTemplateProps = {
  category: PrismaIndicatorCategory
  pageTitle: string
  indicators: Indicator[]
}

export function IndicatorDashboardTemplate({ category, pageTitle, indicators }: IndicatorDashboardTemplateProps) {
  const [currentUser, setCurrentUser] = React.useState<any>(null)
  
  React.useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])
  
  const userIsCentral = currentUser && ["Admin", "Director", "QualityImprovementCommittee", "PatientSafetyCommittee", "RiskManagementCommittee"].includes(currentUser.role)

  const categoryIndicators = React.useMemo(() => {
    const filteredByCategory = indicators.filter(i => i.category === category)
    if (userIsCentral) return filteredByCategory
    return filteredByCategory.filter(i => i.unit === currentUser?.unit)
  }, [indicators, currentUser, userIsCentral, category])

  const [selectedUnit, setSelectedUnit] = React.useState<string>("Semua Unit")
  const [selectedIndicator, setSelectedIndicator] = React.useState<string>("Semua Indikator")
  const [filterType, setFilterType] = React.useState<FilterType>("this_month")
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())

  const {
    indicatorsForUnit,
    uniqueIndicatorNames,
    totalIndicators,
    meetingStandard,
    notMeetingStandard,
    chartData,
    filteredIndicatorsForTable,
  } = useIndicatorData({
    allIndicators: categoryIndicators,
    selectedUnit,
    selectedIndicator,
    filterType,
    selectedDate
  })
  
  const getChartDescription = () => {
    const base = selectedIndicator === "Semua Indikator"
        ? `Menampilkan rata-rata capaian semua indikator ${category}.`
        : `Menampilkan tren untuk: ${selectedIndicator}.`
    return `${base} ${getFilterDescription(filterType, selectedDate)}`
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
      </div>

      <IndicatorStatCards
        total={totalIndicators}
        meetingStandard={meetingStandard}
        notMeetingStandard={notMeetingStandard}
        category={category}
      />

      <div className="space-y-4">
        <IndicatorFilterCard
          userIsCentral={userIsCentral}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          uniqueIndicatorNames={uniqueIndicatorNames}
          selectedIndicator={selectedIndicator}
          setSelectedIndicator={setSelectedIndicator}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <IndicatorChartCard
          chartData={chartData}
          description={getChartDescription()}
          filterType={filterType}
          selectedIndicator={selectedIndicator}
        />

        <IndicatorReport
          category={category}
          title={`Laporan ${pageTitle}`}
          description={`Riwayat data ${pageTitle} yang telah diinput.`}
          showInputButton={true}
          chartData={chartData}
          reportDescription={getFilterDescription(filterType, selectedDate)}
          indicators={filteredIndicatorsForTable}
        />
      </div>
    </div>
  )
}
