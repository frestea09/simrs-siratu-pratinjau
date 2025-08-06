"use client"

import {
  Activity,
  AlertTriangle,
  BarChart,
  ClipboardCheck,
  Download,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { Bar, BarChart as BarChartRecharts, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const chartData = [
  { month: "Jan", value: 86 },
  { month: "Feb", value: 92 },
  { month: "Mar", value: 95 },
  { month: "Apr", value: 91 },
  { month: "Mei", value: 89 },
  { month: "Jun", value: 98 },
]

const recentReports = [
  { id: "LAP-001", title: "Laporan Mutu Bulanan", date: "2023-06-01", status: "Selesai" },
  { id: "IKP-012", title: "Insiden Keselamatan Pasien", date: "2023-06-05", status: "Investigasi" },
  { id: "RM-005", title: "Analisis Risiko Baru", date: "2023-06-10", status: "Mitigasi" },
  { id: "SC-003", title: "Survei Budaya Keselamatan", date: "2023-06-15", status: "Analisis" },
]

export default function OverviewPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Capaian Indikator Mutu
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              +3% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Insiden Keselamatan
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Insiden bulan ini
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budaya Keselamatan</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Positif</div>
            <p className="text-xs text-muted-foreground">
              Hasil survei terakhir
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risiko Aktif</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Memerlukan mitigasi
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Capaian Indikator Mutu Utama</CardTitle>
            <CardDescription>Tingkat Kepatuhan Kebersihan Tangan</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChartRecharts data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChartRecharts>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Laporan Terbaru</CardTitle>
            <CardDescription>
              Laporan mutu dan insiden yang baru dibuat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Judul Laporan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{report.title}</div>
                      <div className="text-sm text-muted-foreground">{report.date}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'Selesai' ? 'default' : 'secondary'}
                        className={
                          report.status === 'Investigasi' ? 'bg-yellow-500/20 text-yellow-700' :
                          report.status === 'Mitigasi' ? 'bg-red-500/20 text-red-700' : ''
                        }
                      >{report.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
