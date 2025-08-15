
"use client"

import * as React from "react"
import { IndicatorDashboardTemplate } from "@/components/templates/indicator-dashboard-template"
import { getIndicators } from "@/lib/actions/indicators"
import { getCurrentUser } from "@/lib/actions/auth"
import { Indicator, User } from "@prisma/client"

export default function SpmPage({
  indicators,
  currentUser,
}: {
  indicators: Indicator[]
  currentUser: User | null
}) {
    return (
        <IndicatorDashboardTemplate
            category="SPM"
            pageTitle="Standar Pelayanan Minimal (SPM)"
            indicators={indicators}
            currentUser={currentUser}
        />
    )
}

    