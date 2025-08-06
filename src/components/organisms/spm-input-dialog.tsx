
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
import { PlusCircle, Pencil } from "lucide-react"
import { SpmInputForm } from "./spm-input-form"
import { SpmIndicator } from "@/store/spm-store"

type SpmInputDialogProps = {
  spmIndicator?: SpmIndicator,
  trigger?: React.ReactNode,
}

export function SpmInputDialog({ spmIndicator, trigger }: SpmInputDialogProps) {
  const [open, setOpen] = React.useState(false)

  const isEditMode = !!spmIndicator;

  const defaultTrigger = (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" />
      Tambah Data SPM
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Data SPM' : 'Input Data Standar Pelayanan Minimal (SPM)'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah data yang diperlukan di bawah ini.' : 'Isi detail capaian SPM. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <SpmInputForm setOpen={setOpen} spmIndicator={spmIndicator} />
      </DialogContent>
    </Dialog>
  )
}
