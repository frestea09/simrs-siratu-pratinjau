
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useIndicatorStore, Indicator, IndicatorCategory } from "@/store/indicator-store"
import { Download, Table as TableIcon } from "lucide-react"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type YearlyReportData = {
  no: number
  indicator: string
  standard: string
  months: { [key: string]: string }
}

const CATEGORIES: IndicatorCategory[] = ['INM', 'IMP-RS', 'IPU', 'SPM'];
const CATEGORY_LABELS: Record<IndicatorCategory, string> = {
  INM: 'Indikator Nasional Mutu (INM)',
  'IMP-RS': 'Indikator Mutu Prioritas RS (IMP-RS)',
  IPU: 'Indikator Prioritas Unit (IPU)',
  SPM: 'Standar Pelayanan Minimal (SPM)',
};
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function ReportsPage() {
  const { indicators, submittedIndicators } = useIndicatorStore()
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString())
  const [reportData, setReportData] = React.useState<Record<IndicatorCategory, YearlyReportData[]>> | null>(null)
  const [isPreviewOpen, setPreviewOpen] = React.useState(false)

  const availableYears = React.useMemo(() => {
    const years = new Set(indicators.map(i => new Date(i.period).getFullYear().toString()))
    if (!years.has(new Date().getFullYear().toString())) {
        years.add(new Date().getFullYear().toString());
    }
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [indicators])

  const generateReport = () => {
    const year = parseInt(selectedYear);
    const yearlyData: Record<IndicatorCategory, YearlyReportData[]> = { INM: [], 'IMP-RS': [], IPU: [], SPM: [] };
    
    // Get all unique indicators for the year
    const uniqueIndicators = submittedIndicators.filter(si => si.status === 'Diverifikasi');

    CATEGORIES.forEach(category => {
        const categoryIndicators = uniqueIndicators.filter(si => si.category === category);

        categoryIndicators.forEach((masterIndicator, index) => {
            const monthlyAchievements: { [key: string]: string } = {};

            MONTHS.forEach((_, monthIndex) => {
                const periodString = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
                
                const achievement = indicators.find(i => 
                    i.indicator === masterIndicator.name && 
                    i.period === periodString
                );
                
                monthlyAchievements[monthIndex.toString()] = achievement ? achievement.ratio : '-';
            });

            yearlyData[category].push({
                no: index + 1,
                indicator: masterIndicator.name,
                standard: `${masterIndicator.standard}${masterIndicator.standardUnit}`,
                months: monthlyAchievements
            });
        });
    });

    setReportData(yearlyData);
    setPreviewOpen(true);
  };

  const ReportTable = ({ data, title }: { data: YearlyReportData[], title: string }) => {
    if (data.length === 0) return null;
    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead className="min-w-[250px]">Indikator Penilaian Mutu</TableHead>
                            <TableHead>Standar</TableHead>
                            {MONTHS.map((month, index) => <TableHead key={index} className="text-center">{month.substring(0,3)}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(row => (
                            <TableRow key={row.no}>
                                <TableCell>{row.no}</TableCell>
                                <TableCell>{row.indicator}</TableCell>
                                <TableCell>{row.standard}</TableCell>
                                {MONTHS.map((_, index) => <TableCell key={index} className="text-center">{row.months[index]}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Laporan</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Laporan Tahunan Capaian Indikator</CardTitle>
          <CardDescription>Pilih tahun untuk melihat rekapitulasi capaian semua indikator mutu.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="grid gap-2 w-full sm:w-auto">
            <Label htmlFor="year">Pilih Tahun</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year" className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <Button onClick={generateReport} className="w-full sm:w-auto mt-auto">
            <Download className="mr-2 h-4 w-4" />
            Buat & Unduh Laporan
          </Button>
        </CardContent>
      </Card>
      
      {reportData && (
         <ReportPreviewDialog
            open={isPreviewOpen}
            onOpenChange={setPreviewOpen}
            data={[]} // Data is handled by children
            title={`Laporan Capaian Indikator Mutu Tahun ${selectedYear}`}
            description="Rekapitulasi capaian bulanan untuk semua indikator mutu yang terverifikasi."
          >
            {CATEGORIES.map(cat => (
                <ReportTable key={cat} data={reportData[cat]} title={CATEGORY_LABELS[cat]} />
            ))}
          </ReportPreviewDialog>
      )}

       <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-6 w-6"/>
                    Tentang Halaman Laporan
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                <p>Halaman ini berfungsi sebagai pusat untuk menghasilkan laporan gabungan dari semua data indikator yang telah diinput.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Pilih tahun yang diinginkan untuk melihat rekapitulasi data tahunan.</li>
                    <li>Laporan akan mengelompokkan indikator berdasarkan kategorinya (INM, IMP-RS, IPU, SPM).</li>
                    <li>Gunakan tombol "Cetak" pada jendela pratinjau untuk mencetak langsung atau menyimpan laporan sebagai file PDF.</li>
                </ul>
            </CardContent>
       </Card>
    </div>
  );
}
