
"use client"

import React from "react"
import {
  Activity,
  AlertTriangle,
  Users,
  TrendingUp,
  FileClock,
  ThumbsUp,
} from "lucide-react"
import { Bar, BarChart as BarChartRecharts, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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
import { useIndicatorStore } from "@/store/indicator-store"
import { useIncidentStore } from "@/store/incident-store"
import { useUserStore } from "@/store/user-store.ts"
import { useLogStore } from "@/store/log-store"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"

const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

export default function OverviewPage() {
  const { indicators, submittedIndicators } = useIndicatorStore()
  const { incidents } = useIncidentStore()
  const { users, currentUser } = useUserStore()
  const { logs } = useLogStore()

  const userIsCentral = currentUser && centralRoles.includes(currentUser.role);
  const canViewIncidentData = currentUser && (currentUser.role === 'Admin Sistem' || currentUser.role === 'Sub. Komite Keselamatan Pasien');

  // Filter data based on role
  const relevantIndicators = React.useMemo(() => {
    if (userIsCentral || !currentUser?.unit) return indicators;
    return indicators.filter(i => i.unit === currentUser.unit);
  }, [indicators, currentUser, userIsCentral]);

  const relevantSubmissions = React.useMemo(() => {
    if (userIsCentral || !currentUser?.unit) return submittedIndicators;
    return submittedIndicators.filter(s => s.unit === currentUser.unit);
  }, [submittedIndicators, currentUser, userIsCentral]);


  // -- Card Metrics --
  const totalIndicators = relevantIndicators.length
  const meetingStandard = relevantIndicators.filter(i => i.status === 'Memenuhi Standar').length
  const qualityAchievement = totalIndicators > 0 ? ((meetingStandard / totalIndicators) * 100).toFixed(1) : "0.0"

  const pendingSubmissions = relevantSubmissions.filter(s => s.status === 'Menunggu Persetujuan').length
  const totalIncidents = incidents.length
  const totalUsers = users.length

  // -- Chart Data --
  const chartData = React.useMemo(() => {
    const monthlyAverages: { [key: string]: { total: number; count: number } } = {}
    
    const last6Months: string[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last6Months.push(format(d, "yyyy-MM"));
      const monthName = format(d, 'MMM', { locale: IndonesianLocale });
      monthlyAverages[monthName] = { total: 0, count: 0 };
    }

    const indicatorsForChart = relevantIndicators.filter(i => {
      const indicatorMonth = format(new Date(i.period), "yyyy-MM");
      return last6Months.includes(indicatorMonth) && i.standardUnit === '%';
    });
    
    indicatorsForChart.forEach(i => {
      const month = format(new Date(i.period), 'MMM', { locale: IndonesianLocale });
      monthlyAverages[month].total += parseFloat(i.ratio);
      monthlyAverages[month].count += 1;
    });

    return Object.entries(monthlyAverages).map(([month, data]) => ({
      month,
      "Capaian": data.count > 0 ? parseFloat((data.total / data.count).toFixed(1)) : 0,
    }));
  }, [relevantIndicators]);

  // -- Recent Activity --
  const recentActivity = logs.slice(0, 5)
  const getActionVariant = (action: string) => {
    if (action.includes("SUCCESS") || action.includes("ADD") || action.includes("UPDATE")) return "default"
    if (action.includes("FAIL")) return "destructive"
    return "secondary"
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
         {currentUser && !userIsCentral && (
          <Badge variant="outline" className="text-base">Unit: {currentUser.unit}</Badge>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capaian Mutu</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityAchievement}%</div>
            <p className="text-xs text-muted-foreground">
              {meetingStandard} dari {totalIndicators} indikator memenuhi standar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insiden Keselamatan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {canViewIncidentData ? (
              <>
                <div className="text-2xl font-bold">{totalIncidents}</div>
                <p className="text-xs text-muted-foreground">
                  Total insiden yang dilaporkan
                </p>
              </>
            ) : (
               <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Data hanya bisa dilihat komite
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengajuan Indikator</CardTitle>
            <FileClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu persetujuan
            </p>
          </CardContent>
        </Card>
        {currentUser?.role === 'Admin Sistem' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Total pengguna terdaftar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tren Capaian Mutu (6 Bulan Terakhir)</CardTitle>
            <CardDescription>
              {userIsCentral ? "Rata-rata capaian semua indikator (dalam %)." : `Rata-rata capaian indikator untuk unit Anda (dalam %).`}
            </CardDescription>
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
                  unit="%"
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="Capaian" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Capaian" position="top" formatter={(value: number) => `${value}%`} />
                </Bar>
              </BarChartRecharts>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {userIsCentral && (
            <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle>Aktivitas Sistem Terbaru</CardTitle>
                <CardDescription>
                5 aktivitas terakhir yang terekam dalam sistem.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivity.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>
                        <div className="font-medium">{format(new Date(log.timestamp), "HH:mm")}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "dd MMM", { locale: IndonesianLocale })}</div>
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                        <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        )}
      </div>
    </div>
  )
}
