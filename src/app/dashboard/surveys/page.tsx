"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, PlusCircle } from "lucide-react"
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
  Legend,
} from "recharts"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { copyElementAsImage } from "@/lib/copy-element-as-image"
import { useToast } from "@/hooks/use-toast"

export default function SurveysPage() {
  const { surveys, fetchSurveys } = useSurveyStore()
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = React.useState(false)
  const [editingSurvey, setEditingSurvey] = React.useState<SurveyResult | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const { toast } = useToast()
  const scoreTrendCardRef = React.useRef<HTMLDivElement>(null)
  const respondentCardRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  const handleCopy = React.useCallback(
    async (
      cardRef: React.MutableRefObject<HTMLDivElement | null>,
      successDescription: string,
    ) => {
      if (!cardRef.current) {
        return
      }

      try {
        await copyElementAsImage(cardRef.current)
        toast({
          title: "Bagian Disalin",
          description: successDescription,
        })
      } catch (error) {
        toast({
          title: "Gagal Menyalin",
          description: "Tidak dapat menyalin gambar. Silakan coba lagi.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleCopyScoreTrend = React.useCallback(() => {
    void handleCopy(
      scoreTrendCardRef,
      "Grafik tren skor rata-rata siap ditempel ke dokumen.",
    )
  }, [handleCopy])

  const handleCopyRespondent = React.useCallback(() => {
    void handleCopy(
      respondentCardRef,
      "Grafik jumlah responden per unit siap ditempel ke dokumen.",
    )
  }, [handleCopy])

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
        date: format(new Date(date), "dd MMM"),
        "Skor Rata-rata": Number((total / count).toFixed(2)),
      }))
  }, [surveys])

  const barChartData = React.useMemo(
    () => unitSummary.map((u) => ({ unit: u.unit, "Jumlah Responden": u.count })),
    [unitSummary]
  )

  const lineChart =
    lineChartData.length > 0 ? (
      <div data-export-chart style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <RechartsTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Skor Rata-rata"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Belum ada data untuk menampilkan grafik tren skor.
      </div>
    )

  const barChart =
    barChartData.length > 0 ? (
      <div data-export-chart style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="unit" angle={-45} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="Jumlah Responden" fill="hsl(var(--chart-1))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
       <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Belum ada data untuk menampilkan grafik jumlah responden.
      </div>
    )

  const overallAverage = React.useMemo(() => {
    if (surveys.length === 0) return 0
    return surveys.reduce((acc, s) => acc + s.totalScore, 0) / surveys.length
  }, [surveys])

  const analysisTable = (
    <div className="max-w-sm rounded border">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Total Survei Diterima</TableCell>
            <TableCell className="text-right">{surveys.length}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Skor Rata-rata Keseluruhan</TableCell>
            <TableCell className="text-right">{overallAverage.toFixed(2)} dari 5.00</TableCell>
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

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card ref={scoreTrendCardRef} className="col-span-full lg:col-span-4">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>Tren Skor Rata-rata</CardTitle>
                  <CardDescription>
                    Grafik ini menunjukkan tren skor rata-rata dari semua survei yang masuk dari waktu ke waktu.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyScoreTrend}
                  data-copy-exclude="true"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Salin Bagian
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lineChart}
            </CardContent>
          </Card>
          <Card ref={respondentCardRef} className="col-span-full lg:col-span-3">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>Jumlah Responden per Unit</CardTitle>
                  <CardDescription>
                    Grafik ini menampilkan jumlah partisipasi survei dari masing-masing unit kerja.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRespondent}
                  data-copy-exclude="true"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Salin Bagian
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {barChart}
            </CardContent>
          </Card>
        </div>


      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hasil Survei Budaya Keselamatan</CardTitle>
              <CardDescription>
                Lihat ringkasan dan hasil dari semua survei yang telah diisi oleh staf.
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
        title="Ringkasan Hasil Survei Budaya Keselamatan Pasien"
        description="Laporan ini berisi ringkasan data, visualisasi tren, dan data tabular dari hasil survei yang telah dikumpulkan."
        lineChart={lineChart}
        barChart={barChart}
        analysisTable={analysisTable}
      />
      <SurveyDialog
        open={isSurveyDialogOpen}
        onOpenChange={handleDialogChange}
        survey={editingSurvey}
      />
    </div>
  )
}
