
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
import { SubmittedIndicator } from "@/store/indicator-store"

type IndicatorSubmissionDialogProps = {
  indicator?: SubmittedIndicator;
  trigger?: React.ReactNode;
}

export function IndicatorSubmissionDialog({ indicator, trigger }: IndicatorSubmissionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const isEditMode = !!indicator;

  const defaultTrigger = (
      <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajukan Indikator Baru
      </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Pengajuan Indikator' : 'Pengajuan Indikator Mutu Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail indikator di bawah ini.' : 'Isi detail indikator yang akan diajukan. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <IndicatorSubmissionForm setOpen={setOpen} indicator={indicator} />
      </DialogContent>
    </Dialog>
  )
}
