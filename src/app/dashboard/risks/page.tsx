
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PlusCircle } from "lucide-react"
import { useRiskStore, Risk } from "@/store/risk-store"
import { RiskDialog } from "@/components/organisms/risk-dialog"
import { RiskTable } from "@/components/organisms/risk-table"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { RiskReportTable } from "@/components/organisms/risk-report-table"


export default function RisksPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isReportOpen, setIsReportOpen] = React.useState(false)
    const risks = useRiskStore((state) => state.risks)

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Register Risiko</h2>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle>Daftar Risiko Teridentifikasi</CardTitle>
                        <CardDescription>
                            Kelola semua risiko yang telah diidentifikasi di seluruh unit kerja.
                        </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="lg" onClick={() => setIsReportOpen(true)}>
                                <Download className="mr-2 h-5 w-5" />
                                Unduh Laporan
                            </Button>
                            <Button size="lg" onClick={() => setIsDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Identifikasi Risiko Baru
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <RiskTable risks={risks} />
                </CardContent>
            </Card>
            <RiskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <ReportPreviewDialog
                open={isReportOpen}
                onOpenChange={setIsReportOpen}
                title="Laporan Register Risiko"
                data={risks}
            >
                <RiskReportTable data={risks} />
            </ReportPreviewDialog>
        </div>
    )
}
