"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Risk } from "@/store/risk-store"
import { RiskForm } from "./risk-form"

type RiskDialogProps = {
  risk?: Risk
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RiskDialog({ risk, open, onOpenChange }: RiskDialogProps) {
  const isEditMode = !!risk;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Risiko' : 'Identifikasi Risiko Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail risiko di bawah ini.' : 'Isi detail risiko yang teridentifikasi. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <RiskForm setOpen={onOpenChange} riskToEdit={risk} />
      </DialogContent>
    </Dialog>
  )
}
