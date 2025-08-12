
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useIndicatorStore, IndicatorCategory, SubmittedIndicator, Indicator } from "@/store/indicator-store"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type YearlyReportData = {
  no: number
  indicator: string
  standard: string
  months: (string | null)[]
}

const categoryLabels: Record<IndicatorCategory, string> = {
  INM: "Indikator Nasional Mutu",
  'IMP-RS': "Indikator Mutu Prioritas RS",
  IMPU: "Indikator Mutu Prioritas Unit",
  SPM: "Standar Pelayanan Minimal"
}

const ReportTable = ({ title, data }: { title: string, data: YearlyReportData[] }) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  return (
    <div className="space-y-4">
       <h3 className="text-lg font-semibold flex items-center gap-2">
         <Badge>{title}</Badge>
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No.</TableHead>
            <TableHead>Indikator</TableHead>
            <TableHead>Standar</TableHead>
            {months.map(m => <TableHead key={m} className="text-center">{m}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.no}>
              <TableCell>{row.no}</TableCell>
              <TableCell>{row.indicator}</TableCell>
              <TableCell>{row.standard}</TableCell>
              {row.months.map((monthValue, index) => (
                <TableCell key={index} className="text-center">{monthValue || '-'}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


export default function ReportsPage() {
  const { indicators, submittedIndicators } = useIndicatorStore()
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString())
  const [reportData, setReportData] = React.useState<Record<IndicatorCategory, YearlyReportData[]> | null>(null)
  const [isPreviewOpen, setPreviewOpen] = React.useState(false)

  const availableYears = React.useMemo(() => {
    const years = new Set(indicators.map(i => new Date(i.period).getFullYear().toString()))
    const currentYear = new Date().getFullYear().toString();
    if (!years.has(currentYear)) {
      years.add(currentYear)
    }
    return Array.from(years).sort((a,b) => b.localeCompare(a))
  }, [indicators])

  const generateReport = () => {
    const verifiedIndicators = submittedIndicators.filter(si => si.status === 'Diverifikasi');
    const yearlyIndicators = indicators.filter(i => new Date(i.period).getFullYear().toString() === selectedYear);
    
    const dataByCategory = {} as Record<IndicatorCategory, YearlyReportData[]>;

    Object.keys(categoryLabels).forEach(cat => {
        const categoryKey = cat as IndicatorCategory;
        const categoryIndicators = verifiedIndicators.filter(si => si.category === categoryKey);
        
        dataByCategory[categoryKey] = categoryIndicators.map((si, index) => {
            const monthlyData: (string | null)[] = Array(12).fill(null);

            for(let i = 0; i < 12; i++) {
                // Find achievements for the specific indicator (si.name) for the specific month (i) and year (selectedYear)
                const achievementsForMonth = yearlyIndicators.filter(ind => {
                    const indicatorDate = new Date(ind.period);
                    return ind.indicator === si.name && 
                           indicatorDate.getFullYear() === parseInt(selectedYear) &&
                           indicatorDate.getMonth() === i;
                });
                
                if(achievementsForMonth.length > 0) {
                    // If multiple entries in a month, calculate average
                    const totalRatio = achievementsForMonth.reduce((acc, curr) => acc + parseFloat(curr.ratio), 0);
                    const averageRatio = totalRatio / achievementsForMonth.length;
                    monthlyData[i] = averageRatio.toFixed(1) + (si.standardUnit === '%' ? '%' : '');
                }
            }

            return {
                no: index + 1,
                indicator: si.name,
                standard: `${si.standard}${si.standardUnit}`,
                months: monthlyData
            }
        });
    });

    setReportData(dataByCategory);
    setPreviewOpen(true);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Laporan Tahunan</h2>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Buat Laporan Rekapitulasi Tahunan</CardTitle>
            <CardDescription>
                Pilih tahun untuk membuat laporan rekapitulasi capaian indikator bulanan.
                Hanya indikator dengan status 'Diverifikasi' yang akan disertakan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                     <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tahun..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <Button onClick={generateReport} size="lg">Buat Laporan</Button>
            </div>
          </CardContent>
      </Card>

      {reportData && (
        <ReportPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setPreviewOpen}
          data={[]}
          columns={[]}
          title={`Laporan Rekapitulasi Capaian Mutu Tahun ${selectedYear}`}
        >
            <div className="space-y-8">
                {Object.entries(reportData).map(([category, data]) => 
                    data.length > 0 ? (
                      <ReportTable key={category} title={categoryLabels[category as IndicatorCategory]} data={data} />
                    ) : null
                )}
            </div>
        </ReportPreviewDialog>
      )}

    </div>
  )
}
