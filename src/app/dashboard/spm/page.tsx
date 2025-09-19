
"use client"

import * as React from "react"
import { IndicatorDashboardTemplate } from "@/components/templates/indicator-dashboard-template"
import { INDICATOR_TEXTS } from "@/lib/constants"

export default function SpmPage() {
  const category = "SPM" as const
  return (
    <IndicatorDashboardTemplate
      category={category}
      pageTitle={INDICATOR_TEXTS.dashboard.pageTitles[category]}
    />
  )
}
