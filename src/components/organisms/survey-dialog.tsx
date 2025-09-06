
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SurveyForm } from "./survey-form"
import { SurveyResult } from "@/store/survey-store"
import type { SurveyDialogProps } from "./survey-dialog.type"

export function SurveyDialog({ open, onOpenChange, survey, trigger }: SurveyDialogProps) {
  const isEdit = !!survey
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Survei Budaya Keselamatan Pasien' : 'Survei Budaya Keselamatan Pasien'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui jawaban survei sesuai kebutuhan.' : 'Isi semua pertanyaan sesuai dengan opini Anda. Survei ini bersifat anonim.'}
          </DialogDescription>
        </DialogHeader>
        <SurveyForm
          survey={survey ?? undefined}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
