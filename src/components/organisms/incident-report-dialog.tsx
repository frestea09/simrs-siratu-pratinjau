"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { FormInputSelect } from "@/components/molecules/form-input-select"
import { FormInputTextarea } from "@/components/molecules/form-input-textarea"

const incidentTypes = [
  { value: "knc", label: "Kejadian Nyaris Cedera (KNC)" },
  { value: "ktd", label: "Kejadian Tidak Diharapkan (KTD)" },
  { value: "kpc", label: "Kondisi Potensial Cedera (KPC)" },
  { value: "ktc", label: "Kejadian Tidak Cedera (KTC)" },
]

const severityLevels = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
]

export function IncidentReportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Laporkan Insiden Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Laporan Insiden Keselamatan</DialogTitle>
          <DialogDescription>
            Isi detail insiden yang terjadi. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormInputSelect
            id="type"
            label="Jenis Insiden"
            placeholder="Pilih jenis"
            items={incidentTypes}
            containerClassName="grid grid-cols-4 items-center gap-4"
          />
          <FormInputSelect
            id="severity"
            label="Tingkat Keparahan"
            placeholder="Pilih tingkat"
            items={severityLevels}
            containerClassName="grid grid-cols-4 items-center gap-4"
          />
          <FormInputTextarea
            id="description"
            label="Deskripsi"
            placeholder="Deskripsikan insiden secara singkat"
            containerClassName="grid grid-cols-4 items-start gap-4"
          />
          <FormInputTextarea
            id="action"
            label="Tindakan Diambil"
            placeholder="Jelaskan tindakan awal yang sudah dilakukan"
            containerClassName="grid grid-cols-4 items-start gap-4"
          />
        </div>
        <DialogFooter>
          <Button type="submit">Simpan Laporan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
