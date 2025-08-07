
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useIndicatorStore, IndicatorCategory, SubmittedIndicator } from "@/store/indicator-store"
import { Download, Table as TableIcon } from "lucide-react"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type YearlyReportData = {
  no: number
  indicator: string
  description: string;
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
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

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
    
    const uniqueIndicators = submittedIndicators.filter(si => si.status === 'Diverifikasi');

    CATEGORIES.forEach(category => {
        const categoryIndicators = uniqueIndicators.filter(si => si.category === category);

        yearlyData[category] = categoryIndicators.map((masterIndicator, index) => {
            const monthlyAchievements: { [key: string]: string } = {};

            MONTHS.forEach((_, monthIndex) => {
                const periodString = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
                
                const achievement = indicators.find(i => 
                    i.indicator === masterIndicator.name && 
                    i.period === periodString
                );
                
                monthlyAchievements[monthIndex.toString()] = achievement ? achievement.ratio : '-';
            });

            return {
                no: index + 1,
                indicator: masterIndicator.name,
                description: masterIndicator.description,
                standard: `${masterIndicator.standard}${masterIndicator.standardUnit}`,
                months: monthlyAchievements
            };
        });
    });

    setReportData(yearlyData);
    setPreviewOpen(true);
  };

  const ReportTable = ({ data, title }: { data: YearlyReportData[], title: string }) => {
    if (!data || data.length === 0) return null;
    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100 text-gray-800">
                            <TableHead className="w-[50px] font-bold">No</TableHead>
                            <TableHead className="min-w-[200px] font-bold">Indikator</TableHead>
                            <TableHead className="min-w-[300px] font-bold">Deskripsi</TableHead>
                            <TableHead className="font-bold">Standar</TableHead>
                            {MONTHS.map((month, index) => <TableHead key={index} className="text-center font-bold">{month}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(row => (
                            <TableRow key={row.no}>
                                <TableCell className="font-medium">{row.no}</TableCell>
                                <TableCell>{row.indicator}</TableCell>
                                <TableCell className="text-sm text-gray-600">{row.description}</TableCell>
                                <TableCell>{row.standard}</TableCell>
                                {MONTHS.map((_, index) => <TableCell key={index} className="text-center">{row.months[index.toString()]}</TableCell>)}
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
        <h2 className="text-3xl font-bold tracking-tight">Laporan Tahunan</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generator Laporan Tahunan</CardTitle>
          <CardDescription>Pilih tahun untuk membuat rekapitulasi capaian bulanan semua indikator mutu yang terverifikasi.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="grid gap-2 w-full sm:w-auto">
            <Label htmlFor="year">Pilih Tahun Laporan</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year" className="w-full sm:w-[180px] h-11 text-base">
                    <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map(year => <SelectItem key={year} value={year} className="text-base">{year}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <Button onClick={generateReport} className="w-full sm:w-auto mt-auto" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Buat Laporan
          </Button>
        </CardContent>
      </Card>
      
      {reportData && (
         <ReportPreviewDialog
            open={isPreviewOpen}
            onOpenChange={setPreviewOpen}
            data={[]} // Data is handled by children
            title={`Pencapaian Indikator Mutu Tahun ${selectedYear}`}
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
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Halaman ini berfungsi sebagai pusat untuk menghasilkan laporan gabungan dari semua data indikator yang telah diinput dan diverifikasi.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Pilih tahun yang diinginkan untuk melihat rekapitulasi data tahunan.</li>
                    <li>Laporan akan mengelompokkan indikator berdasarkan kategorinya (INM, IMP-RS, IPU, SPM).</li>
                    <li>Hanya indikator dengan status **"Diverifikasi"** yang akan masuk ke dalam laporan.</li>
                    <li>Gunakan tombol **"Cetak Laporan"** pada jendela pratinjau untuk mencetak langsung atau menyimpan laporan sebagai file PDF.</li>
                </ul>
            </CardContent>
       </Card>
    </div>
  );
}
