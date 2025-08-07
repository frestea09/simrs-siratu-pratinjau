
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { useIndicatorStore } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import React from "react"
import { IndicatorInputDialog } from "@/components/organisms/indicator-input-dialog"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"


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

  const hasVerifiedIndicators = React.useMemo(() => {
    const relevantSubmitted = submittedIndicators.filter(i => i.category === 'INM');
    const relevantIndicators = userCanSeeAll || !currentUser?.unit
        ? relevantSubmitted
        : relevantSubmitted.filter(i => i.unit === currentUser.unit);
    
    return relevantIndicators.some(indicator => indicator.status === 'Diverifikasi');
  }, [submittedIndicators, currentUser, userCanSeeAll]);

  const inputDialogButton = (
    <IndicatorInputDialog />
  );


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Nasional Mutu (INM)</h2>
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
                        <p>Tidak ada indikator INM yang siap untuk diinput.</p>
                         <p className="text-xs text-muted-foreground">Ajukan & verifikasi indikator di halaman IPU terlebih dahulu.</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
      </div>
      <IndicatorReport 
        category="INM"
        title="Laporan Indikator Nasional Mutu"
        description="Riwayat data Indikator Nasional Mutu (INM) yang telah diinput."
      />
    </div>
  )
}
