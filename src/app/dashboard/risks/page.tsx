
"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PlusCircle, AlertTriangle, ListTodo, ShieldCheck, Copy } from "lucide-react"
import { useRiskStore, Risk, RiskLevel, RiskStatus } from "@/store/risk-store"
import { RiskDialog } from "@/components/organisms/risk-dialog"
import { RiskTable } from "@/components/organisms/risk-table"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { RiskReportTable } from "@/components/organisms/risk-report-table"
import { RiskAnalysisTable } from "@/components/organisms/risk-analysis-table"
import { copyChartImage } from "@/lib/copy-chart"
import { useToast } from "@/hooks/use-toast"


const COLORS: {[key in RiskLevel]: string} = {
  Ekstrem: "hsl(var(--destructive))",
  Tinggi: "hsl(var(--primary))",
  Moderat: "hsl(var(--chart-4))",
  Rendah: "hsl(var(--chart-5))",
};

const STATUS_COLORS: {[key in RiskStatus]: string} = {
  Open: "hsl(var(--chart-2))",
  'In Progress': "hsl(var(--chart-4))",
  Closed: "hsl(var(--primary))",
};


export default function RisksPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isReportOpen, setIsReportOpen] = React.useState(false)
    const { risks, fetchRisks } = useRiskStore()
    const { toast } = useToast()
    const levelChartRef = React.useRef<HTMLDivElement>(null)
    const statusChartRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        fetchRisks().catch(() => {})
    }, [fetchRisks])

    const summary = React.useMemo(() => {
        const levelCounts: Record<RiskLevel, number> = { Ekstrem: 0, Tinggi: 0, Moderat: 0, Rendah: 0 };
        const statusCounts: Record<RiskStatus, number> = { Open: 0, 'In Progress': 0, Closed: 0 };

        risks.forEach(risk => {
            levelCounts[risk.riskLevel]++;
            statusCounts[risk.status]++;
        });

        return {
            total: risks.length,
            open: statusCounts['Open'],
            extreme: levelCounts['Ekstrem'],
            levelData: Object.entries(levelCounts).map(([name, value]) => ({ name, value })).reverse(),
            statusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
        };
    }, [risks]);
    
    const risksInProgress = React.useMemo(() => {
        return risks.filter(r => r.status === 'Open' || r.status === 'In Progress');
    }, [risks]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Risiko</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Risiko</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{summary.total}</div>
                    <p className="text-xs text-muted-foreground">Total risiko yang teridentifikasi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risiko Terbuka (Open)</CardTitle>
                    <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{summary.open}</div>
                    <p className="text-xs text-muted-foreground">Risiko baru yang butuh evaluasi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risiko Level Ekstrem</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{summary.extreme}</div>
                    <p className="text-xs text-muted-foreground">Risiko yang membutuhkan perhatian segera</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                     <CardHeader className="flex items-center justify-between">
                        <div>
                        <CardTitle>Distribusi Level Risiko</CardTitle>
                        <CardDescription>Jumlah risiko berdasarkan tingkat bahayanya.</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await copyChartImage(levelChartRef.current)
                              toast({ title: "Diagram Disalin", description: "Grafik level risiko tersalin." })
                            } catch {
                              toast({ title: "Gagal Menyalin", description: "Tidak dapat menyalin grafik." })
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div ref={levelChartRef} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.levelData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Bar dataKey="value" name="Jumlah Risiko" barSize={40}>
                                    <LabelList dataKey="value" position="right" />
                                    {summary.levelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as RiskLevel]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                     <CardHeader className="flex items-center justify-between">
                        <div>
                        <CardTitle>Status Penyelesaian</CardTitle>
                        <CardDescription>Proporsi risiko berdasarkan status penanganannya.</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await copyChartImage(statusChartRef.current)
                              toast({ title: "Diagram Disalin", description: "Grafik status tersalin." })
                            } catch {
                              toast({ title: "Gagal Menyalin", description: "Tidak dapat menyalin grafik." })
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div ref={statusChartRef} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie
                                    data={summary.statusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    nameKey="name"
                                    paddingAngle={2}
                                >
                                    {summary.statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={STATUS_COLORS[entry.name as RiskStatus]}
                                        stroke="#fff"
                                    />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="outside"
                                        formatter={(val: number, entry: any) => `${entry?.name ? `${entry.name}: ` : ""}${val}`}
                                    />
                                </Pie>
                                <Tooltip />
                                <Legend formatter={(value) => `${value} (${summary.statusData.find((s) => s.name === value)?.value ?? 0})`} />
                            </PieChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle>Register Risiko</CardTitle>
                        <CardDescription>
                            Kelola dan monitor semua risiko yang telah diidentifikasi di seluruh unit kerja.
                        </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="lg" onClick={() => setIsReportOpen(true)}>
                                <Download className="mr-2 h-5 w-5" />
                                Unduh Laporan
                            </Button>
                            <Button size="lg" onClick={() => setIsDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Identifikasi Risiko Baru
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <RiskTable risks={risks} />
                </CardContent>
            </Card>
            <RiskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <ReportPreviewDialog
                open={isReportOpen}
                onOpenChange={setIsReportOpen}
                title="Laporan Register Risiko"
                description="Laporan ini terdiri dari beberapa bagian: ringkasan visual, daftar risiko aktif yang perlu ditindaklanjuti, dan register risiko lengkap sebagai lampiran."
            >
                <div className="print-page">
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                        <div className="lg:col-span-4">
                            <h3 className="text-lg font-semibold mb-2">Distribusi Level Risiko</h3>
                            <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.levelData} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                    <Bar dataKey="value" name="Jumlah Risiko" barSize={30}>
                                        <LabelList dataKey="value" position="right" />
                                        {summary.levelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as RiskLevel]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            </div>
                            <table className="mt-4 text-sm">
                              <tbody>
                                {summary.levelData.map((d) => (
                                  <tr key={d.name}>
                                    <td className="pr-2">{d.name}</td>
                                    <td>{d.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                        </div>
                        <div className="lg:col-span-3">
                            <h3 className="text-lg font-semibold mb-2">Status Penyelesaian Risiko</h3>
                            <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary.statusData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        nameKey="name"
                                        paddingAngle={2}
                                    >
                                        {summary.statusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={STATUS_COLORS[entry.name as RiskStatus]}
                                            stroke="#fff"
                                        />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="outside"
                                            formatter={(val: number, entry: any) => `${entry?.name ? `${entry.name}: ` : ""}${val}`}
                                        />
                                    </Pie>
                                    <Tooltip />
                                    <Legend formatter={(value) => `${value} (${summary.statusData.find((s) => s.name === value)?.value ?? 0})`} />
                                </PieChart>
                            </ResponsiveContainer>
                            </div>
                            <table className="mt-4 text-sm">
                              <tbody>
                                {summary.statusData.map((d) => (
                                  <tr key={d.name}>
                                    <td className="pr-2">{d.name}</td>
                                    <td>{d.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="print-page-break"></div>

                <div className="print-page">
                    <h3 className="text-lg font-semibold mb-4">Daftar Rencana Aksi & Tindak Lanjut (Risiko Open & In Progress)</h3>
                    <RiskAnalysisTable data={risksInProgress} />
                </div>

                <div className="print-page-break"></div>
                
                <div className="print-page">
                    <h3 className="text-lg font-semibold mb-4">Register Risiko Lengkap</h3>
                    <RiskReportTable data={risks} />
                </div>
            </ReportPreviewDialog>
        </div>
    )
}

    
