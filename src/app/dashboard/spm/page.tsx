
"use client"

import * as React from "react"
import { Bar, BarChart as BarChartRecharts, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { useIndicatorStore } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import { IndicatorInputDialog } from "@/components/organisms/indicator-input-dialog"
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { PlusCircle, Target, ThumbsUp, ThumbsDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

export default function SpmPage() {
  const { submittedIndicators, indicators } = useIndicatorStore();
  const { currentUser } = useUserStore();

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);

  const hasIndicatorsToInput = React.useMemo(() => {
    const relevantSubmitted = submittedIndicators.filter(i => i.category === 'SPM');
    const relevantIndicators = userCanSeeAll || !currentUser?.unit
        ? relevantSubmitted
        : relevantSubmitted.filter(i => i.unit === currentUser.unit);
    
    return relevantIndicators.length > 0;
  }, [submittedIndicators, currentUser, userCanSeeAll]);

  const inputDialogButton = (
    <IndicatorInputDialog />
  );

  const spmIndicators = React.useMemo(() => indicators.filter(i => i.category === 'SPM'), [indicators]);
  
  const totalIndicators = spmIndicators.length;
  const meetingStandard = spmIndicators.filter(i => i.status === 'Memenuhi Standar').length;
  const notMeetingStandard = totalIndicators - meetingStandard;

  const chartData = React.useMemo(() => {
    if (spmIndicators.length === 0) return [];
    const firstIndicatorName = spmIndicators[0].indicator;
    return spmIndicators
      .filter(i => i.indicator === firstIndicatorName)
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
      .slice(-6)
      .map(i => ({
        month: new Date(i.period).toLocaleString('default', { month: 'short' }),
        value: parseFloat(i.ratio),
        standard: i.standard
      }));
  }, [spmIndicators]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Standar Pelayanan Minimal (SPM)</h2>
         <div className="flex items-center gap-2">
             {hasIndicatorsToInput ? (
                inputDialogButton
            ) : (
                <UITooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0}>
                            <Button disabled>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Input Data Capaian
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Tidak ada indikator SPM yang siap untuk diinput.</p>
                         <p className="text-xs text-muted-foreground">Ajukan indikator di halaman Manajemen Indikator.</p>
                    </TooltipContent>
                </UITooltip>
            )}
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Indikator SPM</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIndicators}</div>
              <p className="text-xs text-muted-foreground">indikator yang dimonitor</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memenuhi Standar</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetingStandard}</div>
              <p className="text-xs text-muted-foreground">capaian bulan ini</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tidak Memenuhi Standar</CardTitle>
              <ThumbsDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notMeetingStandard}</div>
              <p className="text-xs text-muted-foreground">capaian bulan ini</p>
            </CardContent>
          </Card>
      </div>
      
       <IndicatorReport 
        category="SPM"
        title="Laporan Standar Pelayanan Minimal"
        description="Riwayat data Standar Pelayanan Minimal (SPM) yang telah diinput."
        showInputButton={false}
      />
    </div>
  )
}
