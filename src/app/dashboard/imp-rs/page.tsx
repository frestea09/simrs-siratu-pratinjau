
"use client"

import * as React from "react"
import { IndicatorDashboardTemplate } from "@/components/templates/indicator-dashboard-template"
import { INDICATOR_TEXTS } from "@/lib/constants"

export default function ImpRsPage() {
  const category = "IMP-RS" as const
  return (
    <IndicatorDashboardTemplate
      category={category}
      pageTitle={INDICATOR_TEXTS.dashboard.pageTitles[category]}
    />
  )
}
