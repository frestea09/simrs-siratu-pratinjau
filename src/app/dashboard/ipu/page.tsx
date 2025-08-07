
"use client"

import { IndicatorReport } from "@/components/organisms/indicator-report"

export default function IpuPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Prioritas Unit (IPU)</h2>
      </div>
      <IndicatorReport 
        category="IPU"
        title="Laporan Indikator Prioritas Unit"
        description="Riwayat data Indikator Prioritas Unit (IPU) yang telah diinput."
        showInputButton={true}
      />
    </div>
  )
}
