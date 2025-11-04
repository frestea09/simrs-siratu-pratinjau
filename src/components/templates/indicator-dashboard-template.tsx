

"use client"

import * as React from "react"

import { useIndicatorStore, IndicatorCategory } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import { getFilterDescription } from "@/lib/indicator-utils"
import type { FilterType } from "@/lib/indicator-utils"
import { useIndicatorData } from "@/hooks/use-indicator-data"
import { IndicatorFilterCard } from "@/components/organisms/indicator-filter-card"
import { IndicatorChartCard } from "@/components/organisms/indicator-chart-card"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { IndicatorStatCards } from "@/components/organisms/indicator-stat-cards"
import { centralRoles } from "@/store/central-roles.ts"
import { INDICATOR_TEXTS } from "@/lib/constants"

type IndicatorDashboardTemplateProps = {
  category: IndicatorCategory
  pageTitle: string
}


export function IndicatorDashboardTemplate({ category, pageTitle }: IndicatorDashboardTemplateProps) {
  const { indicators, submittedIndicators, fetchIndicators, fetchSubmittedIndicators } = useIndicatorStore()
  const { currentUser } = useUserStore()
  const userIsCentral = currentUser ? centralRoles.includes(currentUser.role) : false

  React.useEffect(() => {
    if (!indicators.length) {
      fetchIndicators().catch(() => {})
    }
    if (!submittedIndicators.length) {
      fetchSubmittedIndicators().catch(() => {})
    }
  }, [indicators.length, submittedIndicators.length, fetchIndicators, fetchSubmittedIndicators])

  const categoryIndicators = React.useMemo(() => {
    return indicators.filter(i => i.category === category)
    // No unit filtering here, it will be handled by useIndicatorData hook
  }, [indicators, category])

  const allUnitsLabel = INDICATOR_TEXTS.defaults.allUnits
  const allIndicatorsLabel = INDICATOR_TEXTS.defaults.allIndicators

  const [selectedUnit, setSelectedUnit] = React.useState<string>(
    userIsCentral ? allUnitsLabel : currentUser?.unit || allUnitsLabel
  )
  const [selectedIndicator, setSelectedIndicator] = React.useState<string>(allIndicatorsLabel)
  const [filterType, setFilterType] = React.useState<FilterType>("this_month")
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [chartType, setChartType] = React.useState<"line" | "bar">("line")

  // If user is not central, force their unit
  React.useEffect(() => {
    if (!userIsCentral && currentUser?.unit) {
      setSelectedUnit(currentUser.unit);
    }
  }, [userIsCentral, currentUser]);


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
    const base =
      selectedIndicator === allIndicatorsLabel
        ? INDICATOR_TEXTS.dashboard.chartDescriptions.all(category)
        : INDICATOR_TEXTS.dashboard.chartDescriptions.specific(selectedIndicator)
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
          chartType={chartType}
          setChartType={setChartType}
        />

        <IndicatorChartCard
          chartData={chartData}
          description={getChartDescription()}
          filterType={filterType}
          selectedIndicator={selectedIndicator}
          chartType={chartType}
        />

        <IndicatorReport
          category={category}
          title={INDICATOR_TEXTS.dashboard.report.title(pageTitle)}
          description={INDICATOR_TEXTS.dashboard.report.description(pageTitle)}
          showInputButton={true}
          chartData={chartData}
          reportDescription={getFilterDescription(filterType, selectedDate)}
          indicators={filteredIndicatorsForTable}
        />
      </div>
    </div>
  )
}
