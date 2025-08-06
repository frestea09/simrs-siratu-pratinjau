
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, Pencil } from "lucide-react"
import { IncidentReportForm } from "./incident-report-form"
import { Incident } from "@/store/incident-store"

type IncidentReportDialogProps = {
  incident?: Incident
}

export function IncidentReportDialog({ incident }: IncidentReportDialogProps) {
  const [open, setOpen] = React.useState(false)

  const isEditMode = !!incident;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
            <Button variant="ghost" size="sm" className="flex gap-2 w-full justify-start p-2 h-auto">
                <Pencil className="h-4 w-4" /> Edit
            </Button>
        ) : (
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Laporkan Insiden Baru
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Laporan Insiden' : 'Laporan Insiden Keselamatan Pasien'}</DialogTitle>
        </DialogHeader>
        <IncidentReportForm setOpen={setOpen} incident={incident} />
      </DialogContent>
    </Dialog>
  )
}
