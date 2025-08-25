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
import { Download, PlusCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { SurveyTable } from "@/components/organisms/survey-table"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { SurveyResult, useSurveyStore } from "@/store/survey-store"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function SurveysPage() {
  const surveys = useSurveyStore((state) => state.surveys)
  const router = useRouter()
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [csvData, setCsvData] = React.useState("")
  const [unit, setUnit] = React.useState("all")
  const [range, setRange] = React.useState("7d")

  const filteredSurveys = React.useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    switch (range) {
      case "7d":
        start.setDate(now.getDate() - 6)
        break
      case "40d":
        start.setDate(now.getDate() - 39)
        break
      case "1m":
        start.setMonth(now.getMonth() - 1)
        break
      case "3m":
        start.setMonth(now.getMonth() - 3)
        break
      case "6m":
        start.setMonth(now.getMonth() - 6)
        break
      case "1y":
        start.setFullYear(now.getFullYear() - 1)
        break
    }
    return surveys.filter((s) => {
      if (unit !== "all" && s.unit !== unit) return false
      const date = new Date(s.submissionDate)
      return date >= start && date <= now
    })
  }, [surveys, unit, range])

  const data = React.useMemo(
    () => generateData(filteredSurveys),
    [filteredSurveys]
  )
  const total = filteredSurveys.length
  const lineRef = React.useRef<HTMLDivElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)

  const downloadChart = (
    ref: React.RefObject<HTMLDivElement>,
    filename: string
  ) => {
    const svg = ref.current?.querySelector("svg")
    if (!svg) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateCSV = () => {
    const headers = [
      "ID",
      "Tanggal Pengisian",
      "Unit Kerja",
      "Total Skor",
      "Rata-rata Dimensi",
    ]
    const csvRows = [headers.join(",")]

    surveys.forEach((survey) => {
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
    setCsvData(generateCSV())
    setIsPreviewOpen(true)
  }

  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute(
      "download",
      `laporan_survei_keselamatan_${format(new Date(), "yyyyMMdd")}.csv`
    )
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setIsPreviewOpen(false)
  }

  const handleNewSurvey = () => router.push("/dashboard/surveys/new")
  const handleEditSurvey = (survey: SurveyResult) =>
    router.push(`/dashboard/surveys/${survey.id}/edit`)

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Survei Budaya Keselamatan
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row">
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Unit</SelectItem>
              {HOSPITAL_UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Rentang Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="40d">40 Hari</SelectItem>
              <SelectItem value="1m">1 Bulan</SelectItem>
              <SelectItem value="3m">3 Bulan</SelectItem>
              <SelectItem value="6m">6 Bulan</SelectItem>
              <SelectItem value="1y">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Total Pengisi{unit !== "all" ? ` Unit ${unit}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{total}</p>
          {unit !== "all" && (
            <p className="text-sm text-muted-foreground">
              Total seluruh unit: {surveys.length}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tren Pengisian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Garis</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChart(lineRef, "garis-pengisian.svg")}
                >
                  <Download className="mr-2 h-4 w-4" /> Unduh
                </Button>
              </div>
              <div ref={lineRef} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Batang</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChart(barRef, "batang-pengisian.svg")}
                >
                  <Download className="mr-2 h-4 w-4" /> Unduh
                </Button>
              </div>
              <div ref={barRef} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Hasil Survei</CardTitle>
              <CardDescription>
                Daftar semua hasil survei budaya keselamatan yang telah
                dikirimkan.
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
              <Button size="lg" onClick={handleNewSurvey}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Isi Survei Baru
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SurveyTable surveys={filteredSurveys} onEdit={handleEditSurvey} />
        </CardContent>
      </Card>
      <ReportPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        csvData={csvData}
        onDownload={downloadCSV}
      />
    </div>
  )
}

function generateData(surveys: SurveyResult[]) {
  const counts = new Map<string, number>()
  surveys.forEach((s) => {
    const key = format(new Date(s.submissionDate), "yyyy-MM-dd")
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })
  return Array.from(counts.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([key, count]) => ({
      label: format(new Date(key), "dd MMM"),
      count,
    }))
}
