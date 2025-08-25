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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function SurveysPage() {
  const surveys = useSurveyStore((state) => state.surveys)
  const router = useRouter()
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [csvData, setCsvData] = React.useState("")
  const [unit, setUnit] = React.useState("all")
  const [range, setRange] = React.useState("7d")
  const [chartType, setChartType] = React.useState("line")
  const data = React.useMemo(() => generateData(range), [range])
  const total = React.useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data]
  )
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
              <SelectItem value="a">Unit A</SelectItem>
              <SelectItem value="b">Unit B</SelectItem>
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

      <Tabs
        value={chartType}
        onValueChange={setChartType}
        className="w-full"
      >
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Tren Pengisian</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total Pengisi: {total}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TabsList>
                <TabsTrigger value="line">Garis</TabsTrigger>
                <TabsTrigger value="bar">Batang</TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadChart(
                    chartType === "line" ? lineRef : barRef,
                    `${chartType}-pengisian.svg`
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" /> Unduh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="line">
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
            </TabsContent>
            <TabsContent value="bar">
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
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
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
          <SurveyTable surveys={surveys} onEdit={handleEditSurvey} />
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

function generateData(range: string) {
  const points: { label: string; count: number }[] = []
  const now = new Date()
  const length = 10
  for (let i = length - 1; i >= 0; i--) {
    const date = new Date(now)
    switch (range) {
      case "7d":
        date.setDate(now.getDate() - i)
        break
      case "40d":
        date.setDate(now.getDate() - i * 4)
        break
      case "1m":
        date.setDate(now.getDate() - i * 3)
        break
      case "3m":
        date.setMonth(now.getMonth() - i)
        break
      case "6m":
        date.setMonth(now.getMonth() - i * 2)
        break
      case "1y":
        date.setMonth(now.getMonth() - i * 3)
        break
    }
    const label = date.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    })
    points.push({ label, count: Math.floor(Math.random() * 20) + 1 })
  }
  return points
}
