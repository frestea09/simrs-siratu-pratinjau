
"use client"

import * as React from "react"
import { IndicatorDashboardTemplate } from "@/components/templates/indicator-dashboard-template"
import { getIndicators } from "@/lib/actions/indicators"
import { getCurrentUser } from "@/lib/actions/auth"
import { Indicator, User } from "@prisma/client"

export default function InmPage({
  indicators,
  currentUser,
}: {
  indicators: Indicator[]
  currentUser: User | null
}) {
    return (
        <IndicatorDashboardTemplate
            category="INM"
            pageTitle="Indikator Nasional Mutu (INM)"
            indicators={indicators}
            currentUser={currentUser}
        />
    )
}

    