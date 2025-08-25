
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SurveyForm } from "./survey-form"

type SurveyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SurveyDialog({ open, onOpenChange }: SurveyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Survei Budaya Keselamatan Pasien</DialogTitle>
          <DialogDescription>
            Isi semua pertanyaan sesuai dengan opini Anda. Survei ini bersifat anonim.
          </DialogDescription>
        </DialogHeader>
        <SurveyForm setOpen={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}
