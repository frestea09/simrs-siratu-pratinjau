
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { Indicator, IndicatorCategory, useIndicatorStore } from "@/store/indicator-store"
import { IndicatorReportTable } from "./indicator-report-table"
import React from "react"
import { IndicatorInputDialog } from "./indicator-input-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColumnDef } from "@tanstack/react-table"
import { ReportPreviewDialog } from "./report-preview-dialog"
import { useUserStore } from "@/store/user-store.tsx"
import { CartesianGrid, LabelList, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, LineChart, Line, Legend, Dot, BarChart, Bar } from "recharts"
import { format, parseISO } from "date-fns"
import { AnalysisTable } from "./analysis-table"

const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

type IndicatorReportProps = {
    indicators: Indicator[];
    category: IndicatorCategory;
    title?: string;
    description?: string;
    showInputButton?: boolean;
    chartData?: any[]; // Allow passing chart data
    chartDescription?: string;
    reportDescription?: string;
}

export function IndicatorReport({ indicators, category, title, description, showInputButton = true, chartData, chartDescription, reportDescription }: IndicatorReportProps) {
    const { submittedIndicators } = useIndicatorStore()
    const { currentUser } = useUserStore();
    const [reportTableData, setReportTableData] = React.useState<any[] | null>(null)
    const [reportColumns, setReportColumns] = React.useState<ColumnDef<any>[] | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [isInputOpen, setIsInputOpen] = React.useState(false);
    const [editingIndicator, setEditingIndicator] = React.useState<Indicator | undefined>(undefined);

    const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);
    
    const hasVerifiedIndicators = React.useMemo(() => {
        const relevantSubmitted = submittedIndicators.filter(i => i.category === category && i.status === 'Diverifikasi');
        if (userCanSeeAll || !currentUser?.unit) {
            return relevantSubmitted.length > 0;
        }
        return relevantSubmitted.filter(i => i.unit === currentUser.unit).length > 0;
        
    }, [submittedIndicators, currentUser, userCanSeeAll, category]);
    
    const handleExport = (data: any[], columns: ColumnDef<any>[]) => {
        setReportTableData(data);
        setReportColumns(columns);
        setIsPreviewOpen(true);
    };

    const handleEdit = (indicator: Indicator) => {
        setEditingIndicator(indicator);
        setIsInputOpen(true);
    };

    const handleAddNew = () => {
        setEditingIndicator(undefined);
        setIsInputOpen(true);
    }
    
    const userIndicators = React.useMemo(() => {
        if(userCanSeeAll || !currentUser?.unit) return indicators;
        return indicators.filter(i => i.unit === currentUser.unit);
    }, [indicators, currentUser, userCanSeeAll]);

    const ChartTooltipContent = (props: any) => {
        const { active, payload } = props;
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            // The data object from the chart might not have the 'period' property directly.
            // It has 'date' from the chartData mapping.
            if (!data.date) return null;

            const date = data.date;
            const timeRange = chartData && chartData.length > 30 ? '1y' : '30d'; // A simple heuristic
            const formattedDate = (timeRange === '6m' || timeRange === '1y') ? format(date, 'MMMM yyyy') : format(date, 'd MMMM yyyy');
          
            return (
                <div className="p-2 bg-background border rounded-md shadow-lg">
                    <p className="font-bold text-foreground">{formattedDate}</p>
                    <p className="text-sm text-primary">{`Capaian: ${data.Capaian}`}</p>
                    {data.Standar && <p className="text-sm text-destructive">{`Standar: ${data.Standar}`}</p>}
                </div>
            );
        }
        return null;
    };
    
    const lineChartComponent = chartData && (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="Capaian" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} dot={<Dot r={4} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />}>
                        <LabelList dataKey="Capaian" position="top" className="text-xs" fill="hsl(var(--foreground))" />
                    </Line>
                     {chartData.some(d => d.Standar) && (
                        <Line type="monotone" dataKey="Standar" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                     )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )

    const barChartComponent = chartData && (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Capaian" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="Capaian" position="top" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )


    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{title || `Laporan Indikator ${category}`}</CardTitle>
                            <CardDescription>
                                {description || `Riwayat data indikator ${category} yang telah diinput.`}
                                {currentUser?.unit && !userCanSeeAll && ` (Unit: ${currentUser.unit})`}
                            </CardDescription>
                        </div>
                        {showInputButton && (
                             <div className="flex items-center gap-2">
                                {hasVerifiedIndicators ? (
                                    <Button onClick={handleAddNew}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Input Data Capaian
                                    </Button>
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
                                            <p>Tidak ada indikator {category} yang diverifikasi untuk unit Anda.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <IndicatorReportTable indicators={userIndicators} onExport={handleExport} onEdit={handleEdit}/>
                </CardContent>
            </Card>
            <ReportPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                data={reportTableData || []}
                columns={reportColumns || []}
                title={`Laporan Capaian ${title || `Indikator ${category}`}`}
                description={reportDescription}
                lineChart={lineChartComponent}
                barChart={barChartComponent}
                analysisTable={<AnalysisTable data={reportTableData || []} />}
            />
             <IndicatorInputDialog 
                open={isInputOpen} 
                onOpenChange={setIsInputOpen}
                category={category}
                indicatorToEdit={editingIndicator} 
            />
        </div>
    )
}
