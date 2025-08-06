
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
import { IndicatorInputForm } from "./indicator-input-form"
import { Indicator } from "@/store/indicator-store"

type IndicatorInputDialogProps = {
  indicatorToEdit?: Indicator;
  trigger?: React.ReactNode;
}

export function IndicatorInputDialog({ indicatorToEdit, trigger }: IndicatorInputDialogProps) {
  const [open, setOpen] = React.useState(false)
  const isEditMode = !!indicatorToEdit;

  const defaultTrigger = (
      <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Input Data Capaian
      </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Data Capaian' : 'Input Data Capaian Indikator'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail capaian di bawah ini.' : 'Isi detail capaian yang akan disimpan. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <IndicatorInputForm setOpen={setOpen} indicatorToEdit={indicatorToEdit} />
      </DialogContent>
    </Dialog>
  )
}
