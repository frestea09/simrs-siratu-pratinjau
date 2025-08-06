
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
import { SpmInputForm } from "./spm-input-form"

export function SpmInputDialog() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Data SPM
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Input Data Standar Pelayanan Minimal (SPM)</DialogTitle>
          <DialogDescription>
            Isi detail capaian SPM. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <SpmInputForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}
