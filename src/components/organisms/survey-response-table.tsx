"use client"

import { useSurveyStore } from "@/store/survey-store"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function SurveyResponseTable() {
  const { responses } = useSurveyStore()

  const handleDownload = () => {
    if (responses.length === 0) return
    const header = [
      "Waktu",
      "Unit",
      "Lama Bekerja",
      "Jumlah Laporan",
      "Penilaian",
      "Komentar",
    ]
    const rows = responses.map((r) => [
      new Date(r.submittedAt).toLocaleDateString("id-ID"),
      r.unit,
      r.workDuration,
      r.incidentsReported,
      r.safetyRating,
      r.comments ?? "",
    ])
    const csv = [header, ...rows]
      .map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "survei-budaya.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Hasil Survei</h3>
        <Button
          onClick={handleDownload}
          disabled={responses.length === 0}
          className="text-lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Unduh Laporan
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table className="text-lg">
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Lama Bekerja</TableHead>
              <TableHead>Laporan</TableHead>
              <TableHead>Penilaian</TableHead>
              <TableHead>Komentar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Belum ada data.
                </TableCell>
              </TableRow>
            ) : (
              responses.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    {new Date(r.submittedAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell>{r.workDuration}</TableCell>
                  <TableCell>{r.incidentsReported}</TableCell>
                  <TableCell>{r.safetyRating}</TableCell>
                  <TableCell>{r.comments || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
