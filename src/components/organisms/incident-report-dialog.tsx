
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { IncidentReportForm } from "./incident-report-form"
import { Incident } from "@/store/incident-store"

type IncidentReportDialogProps = {
  incident?: Incident
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentReportDialog({ incident, open, onOpenChange }: IncidentReportDialogProps) {
  const isEditMode = !!incident;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Laporan Insiden' : 'Laporan Insiden Keselamatan Pasien'}</DialogTitle>
        </DialogHeader>
        <IncidentReportForm setOpen={onOpenChange} incident={incident} />
      </DialogContent>
    </Dialog>
  )
}
