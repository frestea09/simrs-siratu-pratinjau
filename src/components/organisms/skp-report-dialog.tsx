

"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { useIndicatorStore } from "@/store/indicator-store"
import { useIncidentStore } from "@/store/incident-store"
import { ReportPreviewDialog } from "./report-preview-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Incident } from "@/store/incident-store"
import { Badge } from "../ui/badge"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"

const SKP_INDICATOR_KEYWORDS = [
    "identifikasi pasien",
    "hand hygiene",
    "penandaan area operasi", "site marking",
    "risiko pasien jatuh",
    "obat yang perlu di waspadai", "high alert"
]

type SkpReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type QuarterlyReportData = {
    no: number;
    indicator: string;
    standard: string;
    months: {
        month1: string | null;
        month2: string | null;
        month3: string | null;
    }
    average: string | null;
    averageValue: number | null;
};

type ChartData = {
    name: string;
    [key: string]: any;
}


const ReportTable = ({ title, data, monthHeaders }: { title: string; data: any[], monthHeaders: string[] }) => {
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
            <TableHead className="text-center">{monthHeaders[0]}</TableHead>
            <TableHead className="text-center">{monthHeaders[1]}</TableHead>
            <TableHead className="text-center">{monthHeaders[2]}</TableHead>
            <TableHead className="text-center">Rata-rata</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.no}>
              <TableCell>{row.no}</TableCell>
              <TableCell>{row.indicator}</TableCell>
              <TableCell>{row.standard}</TableCell>
              <TableCell className="text-center">{row.months.month1 ?? '-'}</TableCell>
              <TableCell className="text-center">{row.months.month2 ?? '-'}</TableCell>
              <TableCell className="text-center">{row.months.month3 ?? '-'}</TableCell>
              <TableCell className="text-center font-bold">{row.average ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const IncidentRecapTable = ({ data }: { data: Incident[] }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <Badge>Rekapitulasi Laporan Insiden</Badge>
        </h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Jenis Insiden</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.entries(
                    data.reduce((acc, inc) => {
                        acc[inc.type] = (acc[inc.type] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>)
                ).map(([type, count]) => (
                    <TableRow key={type}>
                        <TableCell className="font-medium">{type}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                ))}
                 <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{data.length}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
);


export function SkpReportDialog({ open, onOpenChange }: SkpReportDialogProps) {
  const { indicators } = useIndicatorStore()
  const { incidents } = useIncidentStore()

  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = React.useState<string>("1");
  const [reportData, setReportData] = React.useState<{ 
      indicatorData: QuarterlyReportData[], 
      incidentData: Incident[], 
      monthHeaders: string[],
      lineChartData: ChartData[],
      barChartData: ChartData[]
  } | null>(null)
  const [isPreviewOpen, setPreviewOpen] = React.useState(false);


  const availableYears = React.useMemo(() => {
    const years = new Set(indicators.map(i => new Date(i.period).getFullYear().toString()))
    const currentYear = new Date().getFullYear().toString();
    if (!years.has(currentYear)) years.add(currentYear);
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [indicators]);

  const generateReport = () => {
    const year = parseInt(selectedYear);
    const quarter = parseInt(selectedQuarter);
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthHeaders = [monthNames[startMonth], monthNames[startMonth+1], monthNames[startMonth+2]];

    const quarterlyIndicators = indicators.filter(i => {
        const date = new Date(i.period);
        return date.getFullYear() === year && date.getMonth() >= startMonth && date.getMonth() <= endMonth;
    });

    const quarterlyIncidents = incidents.filter(i => {
        const date = new Date(i.date);
        return date.getFullYear() === year && date.getMonth() >= startMonth && date.getMonth() <= endMonth;
    });

    const skpIndicators = quarterlyIndicators.filter(i => 
        SKP_INDICATOR_KEYWORDS.some(keyword => i.indicator.toLowerCase().includes(keyword))
    );

    const indicatorNames = Array.from(new Set(skpIndicators.map(i => i.indicator)));

    const indicatorData: QuarterlyReportData[] = indicatorNames.map((name, index) => {
        const indData = { no: index + 1, indicator: name, standard: "", months: { month1: null, month2: null, month3: null }, average: null, averageValue: null } as QuarterlyReportData;
        
        const relevantIndicators = skpIndicators.filter(i => i.indicator === name);
        if (relevantIndicators.length > 0) {
            indData.standard = `${relevantIndicators[0].standard}${relevantIndicators[0].standardUnit}`;
        }
        
        const monthlyValues: (number | null)[] = [null, null, null];

        for(let i=0; i<3; i++) {
            const month = startMonth + i;
            const monthIndicators = relevantIndicators.filter(ind => new Date(ind.period).getMonth() === month);
            if (monthIndicators.length > 0) {
                const totalRatio = monthIndicators.reduce((acc, curr) => acc + parseFloat(curr.ratio), 0);
                const averageRatio = totalRatio / monthIndicators.length;
                monthlyValues[i] = averageRatio;
                indData.months[`month${i+1}` as keyof typeof indData.months] = averageRatio.toFixed(1) + (relevantIndicators[0].standardUnit || '');
            }
        }
        
        const validMonthlyValues = monthlyValues.filter(v => v !== null) as number[];
        if (validMonthlyValues.length > 0) {
            const total = validMonthlyValues.reduce((acc, v) => acc + v, 0);
            const avg = total / validMonthlyValues.length;
            indData.averageValue = avg;
            indData.average = avg.toFixed(1) + (relevantIndicators[0].standardUnit || '');
        }

        return indData;
    });

    // --- Prepare Chart Data ---
    const lineChartData: ChartData[] = monthHeaders.map((monthName, index) => {
        let total = 0;
        let count = 0;
        indicatorData.forEach(ind => {
            const monthKey = `month${index + 1}` as keyof QuarterlyReportData['months'];
            const monthValueStr = ind.months[monthKey];
            if (monthValueStr) {
                total += parseFloat(monthValueStr);
                count++;
            }
        });
        return {
            name: monthName,
            "Rata-rata Capaian": count > 0 ? parseFloat((total / count).toFixed(1)) : 0,
        };
    });

    const barChartData: ChartData[] = indicatorData
        .filter(d => d.averageValue !== null)
        .map(d => ({
            name: d.indicator.split(' ').slice(0,3).join(' '), // Shorten name for chart label
            "Capaian Triwulan": d.averageValue
        }));


    setReportData({ indicatorData, incidentData: quarterlyIncidents, monthHeaders, lineChartData, barChartData });
    setPreviewOpen(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Laporan SKP Triwulan</DialogTitle>
            <DialogDescription>
              Pilih tahun dan periode triwulan untuk membuat laporan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="year">Tahun</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Pilih tahun..." />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="quarter">Triwulan</Label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger id="quarter">
                  <SelectValue placeholder="Pilih triwulan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Triwulan I (Jan - Mar)</SelectItem>
                  <SelectItem value="2">Triwulan II (Apr - Jun)</SelectItem>
                  <SelectItem value="3">Triwulan III (Jul - Sep)</SelectItem>
                  <SelectItem value="4">Triwulan IV (Okt - Des)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={generateReport}>Buat Laporan</Button>
          </div>
        </DialogContent>
      </Dialog>
      {reportData && (
        <ReportPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setPreviewOpen}
          title={`Laporan SKP Triwulan ${selectedQuarter} Tahun ${selectedYear}`}
          description="Laporan ini merangkum capaian indikator sasaran keselamatan pasien dan rekapitulasi insiden pada periode yang dipilih."
        >
            <div className="space-y-8">
                 {reportData.lineChartData.length > 0 && (
                     <div className="print-page">
                        <h3 className="text-lg font-semibold mb-2">Tren Rata-rata Capaian Indikator SKP</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis unit="%" />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Rata-rata Capaian" stroke="hsl(var(--primary))" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                 {reportData.barChartData.length > 0 && (
                    <div className="print-page">
                        <h3 className="text-lg font-semibold mb-2">Perbandingan Capaian per Indikator SKP</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.barChartData} margin={{bottom: 100}}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                                    <YAxis unit="%" />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar dataKey="Capaian Triwulan" fill="hsl(var(--chart-2))" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                {reportData.indicatorData.length > 0 ? (
                    <div className="print-page">
                        <ReportTable 
                        title="Capaian Indikator Sasaran Keselamatan Pasien" 
                        data={reportData.indicatorData} 
                        monthHeaders={reportData.monthHeaders}
                        />
                    </div>
                ) : <p className="text-muted-foreground text-center">Tidak ada data indikator SKP untuk periode ini.</p>}
                {reportData.incidentData.length > 0 ? (
                    <div className="print-page">
                        <IncidentRecapTable data={reportData.incidentData} />
                    </div>
                ) : <p className="text-muted-foreground text-center">Tidak ada insiden yang dilaporkan pada periode ini.</p>}
            </div>
        </ReportPreviewDialog>
      )}
    </>
  )
}

    
