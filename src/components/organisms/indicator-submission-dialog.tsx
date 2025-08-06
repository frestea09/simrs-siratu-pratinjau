
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { IndicatorSubmissionForm } from "./indicator-submission-form"

export function IndicatorSubmissionDialog() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <IndicatorSubmissionForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}
