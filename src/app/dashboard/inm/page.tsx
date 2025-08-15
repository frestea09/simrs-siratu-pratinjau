
"use client"

import * as React from "react"
import { IndicatorDashboardTemplate } from "@/components/templates/indicator-dashboard-template"
import { getIndicators } from "@/lib/actions/indicators"
import { Indicator } from "@prisma/client"

export default function InmPage() {
    const [indicators, setIndicators] = React.useState<Indicator[]>([]);

    React.useEffect(() => {
        async function fetchData() {
            const data = await getIndicators("INM");
            setIndicators(data);
        }
        fetchData();
    }, [])

    return (
        <IndicatorDashboardTemplate
        category="INM"
        pageTitle="Indikator Nasional Mutu (INM)"
        indicators={indicators}
        />
    )
}
