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
import {
  Download,
  PlusCircle,
  Users,
  Activity,
  ThumbsUp,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SurveyTable } from "@/components/organisms/survey-table"
import { SurveyDialog } from "@/components/organisms/survey-dialog"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { SurveyResult, useSurveyStore } from "@/store/survey-store"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

export default function SurveysPage() {
  const surveys = useSurveyStore((state) => state.surveys)
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = React.useState(false)
  const [editingSurvey, setEditingSurvey] = React.useState<SurveyResult | null>(
    null
  )
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [csvData, setCsvData] = React.useState("")
  const [filterUnit, setFilterUnit] = React.useState<string>("all")
  const [chartType, setChartType] = React.useState<"line" | "bar">("line")

  const units = React.useMemo(() => {
    return Array.from(new Set(surveys.map((s) => s.unit)))
  }, [surveys])

  const filteredSurveys = React.useMemo(
    () =>
      filterUnit === "all"
        ? surveys
        : surveys.filter((s) => s.unit === filterUnit),
    [surveys, filterUnit]
  )

  const totalRespondents = filteredSurveys.length

  const averageScore = React.useMemo(() => {
    if (filteredSurveys.length === 0) return 0
    return (
      filteredSurveys.reduce((acc, s) => acc + s.totalScore, 0) /
      filteredSurveys.length
    )
  }, [filteredSurveys])

  const averagePositive = React.useMemo(() => {
    if (filteredSurveys.length === 0) return 0
    return (
      filteredSurveys.reduce((acc, s) => acc + s.positivePercentage, 0) /
      filteredSurveys.length
    )
  }, [filteredSurveys])

  const responseCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    filteredSurveys.forEach((s) => {
      counts[s.unit] = (counts[s.unit] || 0) + 1
    })
    return Object.entries(counts).map(([unit, count]) => ({ unit, count }))
  }, [filteredSurveys])

  const generateCSV = (data: SurveyResult[]) => {
    const headers = [
      "ID",
      "Tanggal Pengisian",
      "Unit Kerja",
      "Total Skor",
      "Rata-rata Dimensi",
    ]
    const csvRows = [headers.join(",")]

    data.forEach((survey) => {
      const avgScore =
        Object.values(survey.scores).reduce((acc, dim) => acc + dim.score, 0) /
        Object.keys(survey.scores).length
      const row = [
        survey.id,
        format(new Date(survey.submissionDate), "yyyy-MM-dd"),
        survey.unit,
        survey.totalScore.toFixed(2),
        avgScore.toFixed(2),
      ].join(",")
      csvRows.push(row)
    })

    return csvRows.join("\n")
  }

  const handlePreview = () => {
    setCsvData(generateCSV(filteredSurveys))
    setIsPreviewOpen(true)
  }

  const downloadXLS = () => {
    const rows = csvData.split("\n").map((row) => row.split(","))
    const table = `
      <table border="1">
        ${rows
          .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
          .join("")}
      </table>
    `
    const blob = new Blob([table], {
      type: "application/vnd.ms-excel",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute(
      "download",
      `laporan_survei_keselamatan_${format(new Date(), "yyyyMMdd")}.xls`
    )
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setIsPreviewOpen(false)
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingSurvey(null)
    }
    setIsSurveyDialogOpen(open)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Survei Budaya Keselamatan
        </h2>
      </div>
      <div>
        <h3 className="text-lg font-medium">Ringkasan Survei</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Ikhtisar untuk memahami hasil survei dengan cepat.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jumlah Responden
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRespondents}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Skor Rata-rata
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageScore.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Respons Positif
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averagePositive.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filter & Tampilan Data</CardTitle>
          <CardDescription>
            Gunakan filter di bawah untuk menampilkan data lebih spesifik.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Select value={filterUnit} onValueChange={setFilterUnit}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Unit</SelectItem>
              {units.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <div className="flex w-fit items-center rounded-md border p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChartType("line")}
                className={cn("h-8 w-8", chartType === "line" && "bg-muted")}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChartType("bar")}
                className={cn("h-8 w-8", chartType === "bar" && "bg-muted")}
              >
                <BarChartIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Survei</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {responseCounts.length > 0 ? (
            <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart data={responseCounts}>
                        <XAxis dataKey="unit" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={responseCounts}>
                        <XAxis dataKey="unit" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" isAnimationActive={false} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {responseCounts.map((item) => (
                  <li key={item.unit} className="text-sm">
                    <span className="font-medium">{item.unit}:</span>{" "}
                    {item.count} responden
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Belum ada data survei.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Laporan Hasil Survei</CardTitle>
          <CardDescription>
            Tabel ini menampilkan semua hasil survei untuk ditinjau atau
            diunduh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreview}
                disabled={filteredSurveys.length === 0}
              >
                <Download className="mr-2 h-5 w-5" />
                Unduh Laporan
              </Button>
              <Button size="lg" onClick={() => setIsSurveyDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Isi Survei Baru
              </Button>
            </div>
          </div>
          <SurveyTable
            surveys={filteredSurveys}
            onEdit={(s) => {
              setEditingSurvey(s)
              setIsSurveyDialogOpen(true)
            }}
          />
        </CardContent>
      </Card>
      <SurveyDialog
        open={isSurveyDialogOpen}
        onOpenChange={handleDialogChange}
        survey={editingSurvey}
      />
      <ReportPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        csvData={csvData}
        onDownload={downloadXLS}
      />
    </div>
  )
}
