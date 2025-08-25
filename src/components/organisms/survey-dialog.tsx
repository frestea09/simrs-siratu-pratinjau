
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SurveyForm } from "./survey-form"
import { SurveyResult } from "@/types/survey"

type SurveyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey?: SurveyResult | null
  onSaved: () => void
}

export function SurveyDialog({ open, onOpenChange, survey, onSaved }: SurveyDialogProps) {
  const isEdit = !!survey;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Survei Budaya Keselamatan Pasien' : 'Survei Budaya Keselamatan Pasien'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui jawaban survei sesuai kebutuhan.' : 'Isi semua pertanyaan sesuai dengan opini Anda. Survei ini bersifat anonim.'}
          </DialogDescription>
        </DialogHeader>
        <SurveyForm setOpen={onOpenChange} survey={survey ?? undefined} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  )
}
