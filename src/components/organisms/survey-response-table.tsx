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
      "Nama",
      "Jenis Kelamin",
      "Pendidikan",
      "Profesi",
      "Unit",
      "Lama di Unit",
      "Lama di RS",
      "Jam per Minggu",
      "Kontak Pasien",
      "Pujian Manajer",
      "Saran Keselamatan",
      "Tekanan Kerja",
      "Mengabaikan Masalah",
      "Pemahaman Manajer",
      "Jumlah Laporan",
      "Penilaian",
      "Komentar",
    ]
    const rows = responses.map((r) => [
      new Date(r.submittedAt).toLocaleDateString("id-ID"),
      r.name,
      r.gender,
      r.education,
      r.profession,
      r.unit,
      r.unitDuration,
      r.workDuration,
      r.weeklyHours,
      r.directPatientContact,
      r.managerPraise,
      r.managerSuggestions,
      r.managerPressure,
      r.managerIgnore,
      r.managerAware,
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
              <TableHead>Nama</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Pendidikan</TableHead>
              <TableHead>Profesi</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Lama di Unit</TableHead>
              <TableHead>Lama di RS</TableHead>
              <TableHead>Jam/Minggu</TableHead>
              <TableHead>Kontak Pasien</TableHead>
              <TableHead>Pujian Manajer</TableHead>
              <TableHead>Saran</TableHead>
              <TableHead>Tekanan</TableHead>
              <TableHead>Masalah Diabaikan</TableHead>
              <TableHead>Pemahaman</TableHead>
              <TableHead>Laporan</TableHead>
              <TableHead>Penilaian</TableHead>
              <TableHead>Komentar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={19} className="text-center">
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
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.gender}</TableCell>
                  <TableCell>{r.education}</TableCell>
                  <TableCell>{r.profession}</TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell>{r.unitDuration}</TableCell>
                  <TableCell>{r.workDuration}</TableCell>
                  <TableCell>{r.weeklyHours}</TableCell>
                  <TableCell>{r.directPatientContact}</TableCell>
                  <TableCell>{r.managerPraise}</TableCell>
                  <TableCell>{r.managerSuggestions}</TableCell>
                  <TableCell>{r.managerPressure}</TableCell>
                  <TableCell>{r.managerIgnore}</TableCell>
                  <TableCell>{r.managerAware}</TableCell>
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
