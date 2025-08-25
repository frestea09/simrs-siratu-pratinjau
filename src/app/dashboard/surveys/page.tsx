"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PlusCircle } from "lucide-react"
import { SurveyTable } from "@/components/organisms/survey-table"
import { useSurveyStore } from "@/store/survey-store"
import { SurveyDialog } from "@/components/organisms/survey-dialog"
import { format } from "date-fns"

export default function SurveysPage() {
  const surveys = useSurveyStore((state) => state.surveys)
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = React.useState(false)

  const downloadCSV = () => {
    // Basic CSV generation
    const headers = ["ID", "Tanggal Pengisian", "Unit Kerja", "Total Skor", "Rata-rata Dimensi"];
    const csvRows = [headers.join(",")];
    
    surveys.forEach(survey => {
      const avgScore = Object.values(survey.scores).reduce((acc, dim) => acc + dim.score, 0) / Object.keys(survey.scores).length;
      const row = [
        survey.id,
        format(new Date(survey.submissionDate), "yyyy-MM-dd"),
        survey.unit,
        survey.totalScore.toFixed(2),
        avgScore.toFixed(2)
      ].join(",");
      csvRows.push(row);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `laporan_survei_keselamatan_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


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
                Daftar semua hasil survei budaya keselamatan yang telah dikirimkan.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="lg" onClick={downloadCSV} disabled={surveys.length === 0}>
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
          <SurveyTable surveys={surveys} />
        </CardContent>
      </Card>
      <SurveyDialog open={isSurveyDialogOpen} onOpenChange={setIsSurveyDialogOpen} />
    </div>
  );
}
