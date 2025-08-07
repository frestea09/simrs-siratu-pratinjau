
"use client"

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

export default function ImpRsPage() {
  const { submittedIndicators } = useIndicatorStore();
  const { currentUser } = useUserStore();

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);
  
  // For IMP-RS, input is possible as long as there is any indicator of this type.
  // The verification step is skipped.
  const hasIndicatorsToInput = React.useMemo(() => {
    const relevantSubmitted = submittedIndicators.filter(i => i.category === 'IMP-RS');
    const relevantIndicators = userCanSeeAll || !currentUser?.unit
        ? relevantSubmitted
        : relevantSubmitted.filter(i => i.unit === currentUser.unit);
    
    // Any indicator exists is enough to enable the button.
    return relevantIndicators.length > 0;
  }, [submittedIndicators, currentUser, userCanSeeAll]);

  const inputDialogButton = (
    <IndicatorInputDialog />
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Mutu Prioritas RS (IMP-RS)</h2>
        <div className="flex items-center gap-2">
            {hasIndicatorsToInput ? (
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
                    <p>Tidak ada indikator IMP-RS yang siap untuk diinput.</p>
                    <p className="text-xs text-muted-foreground">Ajukan indikator di halaman IPU terlebih dahulu.</p>
                </TooltipContent>
            </Tooltip>
        )}
        </div>
      </div>
       <IndicatorReport 
            category="IMP-RS" 
            title="Laporan Indikator Mutu Prioritas RS"
            description="Riwayat data Indikator Mutu Prioritas Rumah Sakit (IMP-RS) yang telah diinput."
            showInputButton={false}
          />
    </div>
  )
}
