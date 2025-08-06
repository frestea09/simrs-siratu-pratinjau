"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SpmTable } from "@/components/organisms/spm-table"
import { useSpmStore } from "@/store/spm-store"
import { SpmInputDialog } from "@/components/organisms/spm-input-dialog"

export default function SpmPage() {
  const spmIndicators = useSpmStore((state) => state.spmIndicators)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Standar Pelayanan Minimal (SPM)</h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Capaian SPM</CardTitle>
              <CardDescription>Daftar capaian indikator Standar Pelayanan Minimal.</CardDescription>
            </div>
            <SpmInputDialog />
          </div>
        </CardHeader>
        <CardContent>
          <SpmTable indicators={spmIndicators} />
        </CardContent>
      </Card>
    </div>
  )
}
