
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { IndicatorSubmissionDialog } from "@/components/organisms/indicator-submission-dialog"
import { IndicatorSubmissionTable } from "@/components/organisms/indicator-submission-table"
import { useIndicatorStore, SubmittedIndicator } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import React from "react"

const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

export default function InmPage() {
  const { submittedIndicators } = useIndicatorStore();
  const { currentUser } = useUserStore();

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);

  const filteredSubmittedIndicators = React.useMemo(() => {
    const inmIndicators = submittedIndicators.filter(i => i.category === 'INM');
    if (userCanSeeAll || !currentUser?.unit) {
      return inmIndicators;
    }
    // INM is national, but if a unit-specific one is made, it can be filtered.
    // Generally, INM is viewable by all central roles. PICs might only see their own submissions if any.
    return inmIndicators.filter(indicator => indicator.unit === currentUser.unit);
  }, [submittedIndicators, currentUser, userCanSeeAll]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Nasional Mutu (INM)</h2>
      </div>
      <Tabs defaultValue="report" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submission">Pengajuan Indikator</TabsTrigger>
          <TabsTrigger value="report">Laporan & Input Capaian</TabsTrigger>
        </TabsList>
        <TabsContent value="submission" className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Status Pengajuan INM</CardTitle>
                            <CardDescription>
                                Daftar Indikator Nasional Mutu yang telah diajukan beserta status verifikasinya.
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
            category="INM"
            title="Laporan Indikator Nasional Mutu"
            description="Riwayat data Indikator Nasional Mutu (INM) yang telah diinput."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
