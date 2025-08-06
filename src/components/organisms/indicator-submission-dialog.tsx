
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
import { IndicatorSubmissionForm } from "./indicator-submission-form"

export function IndicatorSubmissionDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajukan Indikator Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pengajuan Indikator Mutu Baru</DialogTitle>
          <DialogDescription>
            Isi detail indikator yang akan diajukan. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <IndicatorSubmissionForm />
      </DialogContent>
    </Dialog>
  )
}
