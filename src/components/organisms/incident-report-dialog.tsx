
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
import { PlusCircle } from "lucide-react"
import { IncidentReportForm } from "./incident-report-form"

export function IncidentReportDialog() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Laporkan Insiden Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Laporan Insiden Keselamatan Pasien</DialogTitle>
        </DialogHeader>
        <IncidentReportForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}
