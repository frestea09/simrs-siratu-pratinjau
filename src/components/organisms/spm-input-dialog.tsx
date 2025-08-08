
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { SpmInputForm } from "./spm-input-form"
import { SpmIndicator } from "@/store/spm-store"

type SpmInputDialogProps = {
  spmIndicator?: SpmIndicator,
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpmInputDialog({ spmIndicator, open, onOpenChange }: SpmInputDialogProps) {
  const isEditMode = !!spmIndicator;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Data SPM' : 'Input Data Standar Pelayanan Minimal (SPM)'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah data yang diperlukan di bawah ini.' : 'Isi detail capaian SPM. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <SpmInputForm setOpen={onOpenChange} spmIndicator={spmIndicator} />
      </DialogContent>
    </Dialog>
  )
}
