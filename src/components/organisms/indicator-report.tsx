
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { useIndicatorStore } from "@/store/indicator-store"
import { IndicatorReportTable } from "./indicator-report-table"
import React from "react"
import { IndicatorInputDialog } from "./indicator-input-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColumnDef } from "@tanstack/react-table"
import { ReportPreviewDialog } from "./report-preview-dialog"

export function IndicatorReport() {
    const indicators = useIndicatorStore((state) => state.indicators)
    const submittedIndicators = useIndicatorStore((state) => state.submittedIndicators)
    const [reportData, setReportData] = React.useState<any[] | null>(null)
    const [reportColumns, setReportColumns] = React.useState<ColumnDef<any>[] | null>(null)

    const hasVerifiedIndicators = submittedIndicators.some(
        (indicator) => indicator.status === 'Diverifikasi'
    );
    
    const handleExport = (data: any[], columns: ColumnDef<any>[]) => {
        setReportData(data);
        setReportColumns(columns);
    };

    const inputDialogButton = (
        <IndicatorInputDialog />
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Laporan Indikator Mutu</CardTitle>
                            <CardDescription>
                                Riwayat data indikator mutu yang telah diinput.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             {hasVerifiedIndicators ? (
                                inputDialogButton
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span tabIndex={0}>
                                            <Button disabled>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Input Data Capaian
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tidak ada indikator yang diverifikasi untuk diinput.</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <IndicatorReportTable indicators={indicators} onExport={handleExport}/>
                </CardContent>
            </Card>
             {reportData && reportColumns && (
                <ReportPreviewDialog
                    open={!!reportData}
                    onOpenChange={(open) => !open && setReportData(null)}
                    data={reportData}
                    columns={reportColumns}
                    title="Laporan Capaian Indikator Mutu"
                />
            )}
        </div>
    )
}
