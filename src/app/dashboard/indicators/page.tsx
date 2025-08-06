
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { IndicatorSubmissionDialog } from "@/components/organisms/indicator-submission-dialog"
import { IndicatorSubmissionTable } from "@/components/organisms/indicator-submission-table"
import { useIndicatorStore } from "@/store/indicator-store"

export default function IndicatorsPage() {
  const submittedIndicators = useIndicatorStore((state) => state.submittedIndicators);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Mutu</h2>
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
                            <CardTitle>Status Pengajuan</CardTitle>
                            <CardDescription>
                                Daftar indikator mutu yang telah diajukan beserta status verifikasinya.
                            </CardDescription>
                        </div>
                        <IndicatorSubmissionDialog />
                    </div>
                </CardHeader>
                <CardContent>
                    <IndicatorSubmissionTable indicators={submittedIndicators} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="report" className="space-y-4">
          <IndicatorReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
