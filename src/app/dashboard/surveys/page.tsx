"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PlusCircle } from "lucide-react"
import Link from "next/link"
import { SurveyTable } from "@/components/organisms/survey-table"
import { SurveyDialog } from "@/components/organisms/survey-dialog"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { SurveyResult, useSurveyStore } from "@/store/survey-store"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

export default function SurveysPage() {
  const surveys = useSurveyStore((state) => state.surveys)
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = React.useState(false)
  const [editingSurvey, setEditingSurvey] = React.useState<SurveyResult | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)

  type SurveySummary = {
    unit: string
    count: number
    averageScore: number
  }

  const unitSummary = React.useMemo<SurveySummary[]>(() => {
    const map: Record<string, { count: number; total: number }> = {}
    surveys.forEach((s) => {
      if (!map[s.unit]) map[s.unit] = { count: 0, total: 0 }
      map[s.unit].count += 1
      map[s.unit].total += s.totalScore
    })
    return Object.entries(map).map(([unit, { count, total }]) => ({
      unit,
      count,
      averageScore: total / count,
    }))
  }, [surveys])

  const reportColumns = React.useMemo<ColumnDef<SurveySummary>[]>(
    () => [
      { accessorKey: "unit", header: "Unit" },
      { accessorKey: "count", header: "Jumlah Survei" },
      {
        accessorKey: "averageScore",
        header: "Skor Rata-rata",
        cell: ({ row }) => (row.getValue("averageScore") as number).toFixed(2),
      },
    ],
    []
  )

  const lineChartData = React.useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {}
    surveys.forEach((s) => {
      const date = format(new Date(s.submissionDate), "yyyy-MM-dd")
      if (!map[date]) map[date] = { total: 0, count: 0 }
      map[date].total += s.totalScore
      map[date].count += 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { total, count }]) => ({
        date,
        score: Number((total / count).toFixed(2)),
      }))
  }, [surveys])

  const barChartData = React.useMemo(
    () => unitSummary.map((u) => ({ unit: u.unit, count: u.count })),
    [unitSummary]
  )

  const lineChart =
    lineChartData.length > 0 ? (
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <RechartsTooltip />
            <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : undefined

  const barChart =
    barChartData.length > 0 ? (
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="unit" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : undefined

  const overallAverage = React.useMemo(() => {
    if (surveys.length === 0) return 0
    return surveys.reduce((acc, s) => acc + s.totalScore, 0) / surveys.length
  }, [surveys])

  const analysisTable = (
    <div className="max-w-sm rounded border">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Total Survei</TableCell>
            <TableCell>{surveys.length}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Rata-rata Skor</TableCell>
            <TableCell>{overallAverage.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )

  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingSurvey(null)
    }
    setIsSurveyDialogOpen(open)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Survei Budaya Keselamatan</h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Hasil Survei</CardTitle>
              <CardDescription>
                Tabel dan grafik ringkas untuk membantu semua orang memahami hasil survei.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreview}
                disabled={surveys.length === 0}
              >
                <Download className="mr-2 h-5 w-5" />
                Unduh Laporan
              </Button>
              <Link href="/dashboard/surveys/new">
                <Button size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Isi Survei Baru
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SurveyTable
            surveys={surveys}
            onEdit={(s) => {
              setEditingSurvey(s)
              setIsSurveyDialogOpen(true)
            }}
          />
        </CardContent>
      </Card>
      <ReportPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        data={unitSummary}
        columns={reportColumns}
        title="Ringkasan Hasil Survei"
        description="Bagian ini menunjukkan jumlah survei dan nilai rata-rata di tiap unit. Grafik di bawah memudahkan membaca hasilnya."
        lineChart={lineChart}
        barChart={barChart}
        analysisTable={analysisTable}
        exportAsPdf
      />
      <SurveyDialog
        open={isSurveyDialogOpen}
        onOpenChange={handleDialogChange}
        survey={editingSurvey}
      />
    </div>
  )
}
