
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PlusCircle, Users } from "lucide-react"
import { SurveyTable } from "@/components/organisms/survey-table"
import { SurveyDialog } from "@/components/organisms/survey-dialog"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { SurveyResult, useSurveyStore } from "@/store/survey-store"
import { format } from "date-fns"
import { FilterType, getFilterDescription, getFilterRange } from "@/lib/indicator-utils"
import { SurveyFilterCard } from "@/components/organisms/survey-filter-card"
import { SurveyChartCard } from "@/components/organisms/survey-chart-card"
import { HOSPITAL_UNITS } from "@/lib/constants"

const unitOptions = [{ value: "Semua Unit", label: "Semua Unit" }, ...HOSPITAL_UNITS.map(u => ({ value: u, label: u }))]

export default function SurveysPage() {
  const surveys = useSurveyStore((state) => state.surveys)
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = React.useState(false)
  const [editingSurvey, setEditingSurvey] = React.useState<SurveyResult | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [csvData, setCsvData] = React.useState("")
  const [selectedUnit, setSelectedUnit] = React.useState<string>("Semua Unit")
  const [filterType, setFilterType] = React.useState<FilterType>("this_month")
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [chartType, setChartType] = React.useState<"line" | "bar">("line")

  const filteredSurveys = React.useMemo(() => {
    const { start, end } = getFilterRange(filterType, selectedDate)
    return surveys.filter(s => {
      const date = new Date(s.submissionDate)
      const unitMatch = selectedUnit === "Semua Unit" || s.unit === selectedUnit
      const dateMatch = date >= start && date <= end
      return unitMatch && dateMatch
    })
  }, [surveys, selectedUnit, filterType, selectedDate])
  
  const chartData = React.useMemo(() => {
    const getGroupKey = (date: Date) => {
        if (filterType === 'daily') return format(date, 'yyyy-MM-dd HH:00');
        if (['monthly', '7d', '30d', 'this_month'].includes(filterType)) return format(date, 'yyyy-MM-dd');
        if (['yearly', '3m', '6m', '1y'].includes(filterType)) return format(date, 'yyyy-MM');
        return format(date, 'yyyy-MM-dd');
    };

    const groupedData = filteredSurveys.reduce((acc, curr) => {
        const key = getGroupKey(new Date(curr.submissionDate));
        if (!acc[key]) {
            acc[key] = {
                date: new Date(curr.submissionDate),
                Responden: 0,
            };
        }
        acc[key].Responden += 1;
        return acc;
    }, {} as Record<string, { date: Date, Responden: number }>);
    
    return Object.values(groupedData).map(d => ({
        ...d,
        name: ['daily'].includes(filterType) ? format(d.date, 'HH:mm')
            : ['yearly', '3m', '6m', '1y'].includes(filterType) ? format(d.date, 'MMM')
            : format(d.date, 'dd MMM'),
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

  }, [filteredSurveys, filterType]);

  const generateCSV = () => {
    const headers = ["ID", "Tanggal Pengisian", "Unit Kerja", "Total Skor", "Rata-rata Dimensi"]
    const csvRows = [headers.join(",")]

    filteredSurveys.forEach((survey) => {
      const avgScore =
        Object.values(survey.scores).reduce(
          (acc, dim) => acc + dim.score,
          0
        ) / Object.keys(survey.scores).length
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

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingSurvey(null)
    }
    setIsSurveyDialogOpen(open)
  }
  
  const chartDescription = getFilterDescription(filterType, selectedDate);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Survei Budaya Keselamatan
        </h2>
      </div>

       <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responden</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSurveys.length}</div>
            <p className="text-xs text-muted-foreground">
              {chartDescription}
            </p>
          </CardContent>
        </Card>

      <SurveyFilterCard
          unitOptions={unitOptions}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          chartType={chartType}
          setChartType={setChartType}
        />
        
        <SurveyChartCard
          chartData={chartData}
          chartType={chartType}
          description={chartDescription}
        />
        
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
              <Button size="lg" onClick={() => setIsSurveyDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Isi Survei Baru
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
        onDownload={downloadCSV}
      />
    </div>
  )
}
