
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IndicatorInputForm } from "./indicator-input-form"
import { Indicator, IndicatorCategory } from "@/store/indicator-store"

type IndicatorInputDialogProps = {
  indicatorToEdit?: Indicator;
  category: IndicatorCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IndicatorInputDialog({ indicatorToEdit, category, open, onOpenChange }: IndicatorInputDialogProps) {
  const isEditMode = !!indicatorToEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Data Capaian' : 'Input Data Capaian Indikator'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail capaian di bawah ini.' : 'Isi detail capaian yang akan disimpan. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <IndicatorInputForm setOpen={onOpenChange} indicatorToEdit={indicatorToEdit} category={category} />
      </DialogContent>
    </Dialog>
  )
}
