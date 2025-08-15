
"use client"

import * as React from "react"
import { IndicatorDashboardTemplate } from "@/components/templates/indicator-dashboard-template"
import { getIndicators } from "@/lib/actions/indicators"
import { getCurrentUser } from "@/lib/actions/auth"
import { Indicator, User } from "@prisma/client"

export default function ImpRsPage({
  indicators,
  currentUser,
}: {
  indicators: Indicator[]
  currentUser: User | null
}) {
  return (
    <IndicatorDashboardTemplate
      category="IMP_RS"
      pageTitle="Indikator Mutu Prioritas RS (IMP-RS)"
      indicators={indicators}
      currentUser={currentUser}
    />
  )
}

    