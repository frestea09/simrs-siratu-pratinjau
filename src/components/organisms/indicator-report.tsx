
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
import { useUserStore } from "@/store/user-store.tsx"

const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

export function IndicatorReport() {
    const { indicators, submittedIndicators } = useIndicatorStore()
    const { currentUser } = useUserStore();
    const [reportData, setReportData] = React.useState<any[] | null>(null)
    const [reportColumns, setReportColumns] = React.useState<ColumnDef<any>[] | null>(null)

    const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);
    
    const filteredIndicators = React.useMemo(() => {
        if (userCanSeeAll || !currentUser?.unit) {
            return indicators;
        }
        return indicators.filter(indicator => indicator.unit === currentUser.unit);
    }, [indicators, currentUser, userCanSeeAll]);

    const hasVerifiedIndicators = React.useMemo(() => {
        const relevantIndicators = userCanSeeAll || !currentUser?.unit
            ? submittedIndicators
            : submittedIndicators.filter(i => i.unit === currentUser.unit);
        
        return relevantIndicators.some(indicator => indicator.status === 'Diverifikasi');
    }, [submittedIndicators, currentUser, userCanSeeAll]);
    
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
                                {currentUser?.unit && !userCanSeeAll && ` (Unit: ${currentUser.unit})`}
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
                                        <p>Tidak ada indikator yang diverifikasi untuk unit Anda.</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <IndicatorReportTable indicators={filteredIndicators} onExport={handleExport}/>
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
