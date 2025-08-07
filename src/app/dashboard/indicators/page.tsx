
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { IndicatorSubmissionDialog } from "@/components/organisms/indicator-submission-dialog"
import { IndicatorSubmissionTable } from "@/components/organisms/indicator-submission-table"
import { useIndicatorStore } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import React from "react"

const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

export default function IndicatorsPage() {
  const { submittedIndicators } = useIndicatorStore();
  const { currentUser } = useUserStore();

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);

  const filteredSubmittedIndicators = React.useMemo(() => {
    // This page is for IPU, but also the master entry for INM and IMP-RS
    if (userCanSeeAll || !currentUser?.unit) {
      return submittedIndicators;
    }
    // For unit users, they can only see their own unit's submissions
    return submittedIndicators.filter(indicator => indicator.unit === currentUser.unit);
  }, [submittedIndicators, currentUser, userCanSeeAll]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Indikator</h2>
      </div>
      <Tabs defaultValue="report" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submission">Pengajuan Indikator</TabsTrigger>
          <TabsTrigger value="report">Laporan & Input Capaian IPU</TabsTrigger>
        </TabsList>
        <TabsContent value="submission" className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Status Pengajuan Indikator (INM, IMP-RS, IPU, SPM)</CardTitle>
                            <CardDescription>
                                Daftar semua indikator yang telah diajukan beserta status verifikasinya.
                                {currentUser?.unit && !userCanSeeAll && ` (Hanya menampilkan untuk Unit: ${currentUser.unit})`}
                            </CardDescription>
                        </div>
                        <IndicatorSubmissionDialog />
                    </div>
                </CardHeader>
                <CardContent>
                    <IndicatorSubmissionTable indicators={filteredSubmittedIndicators} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="report" className="space-y-4">
          <IndicatorReport 
            category="IPU"
            title="Laporan Indikator Prioritas Unit"
            description="Riwayat data Indikator Prioritas Unit (IPU) yang telah diinput."
            showInputButton={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
