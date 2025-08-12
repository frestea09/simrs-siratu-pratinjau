
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
  mode?: 'create' | 'edit' | 'update'
}

export function RiskDialog({ risk, open, onOpenChange, mode = 'create' }: RiskDialogProps) {
  const isEditMode = !!risk;

  const titles = {
    create: 'Identifikasi Risiko Baru',
    edit: 'Edit Identifikasi Risiko',
    update: 'Update Evaluasi Risiko'
  }
  
  const descriptions = {
    create: 'Isi detail risiko yang teridentifikasi. Klik simpan jika sudah selesai.',
    edit: 'Ubah detail identifikasi risiko di bawah ini.',
    update: 'Isi hasil evaluasi, risiko sisa, dan status penyelesaian.'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titles[isEditMode ? mode : 'create']}</DialogTitle>
          <DialogDescription>
             {descriptions[isEditMode ? mode : 'create']}
          </DialogDescription>
        </DialogHeader>
        <RiskForm setOpen={onOpenChange} riskToEdit={risk} />
      </DialogContent>
    </Dialog>
  )
}
