"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ReportPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  csvData: string
  onDownload: () => void
}

export function ReportPreviewDialog({ open, onOpenChange, csvData, onDownload }: ReportPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pratinjau Laporan</DialogTitle>
          <DialogDescription>Tinjau isi laporan sebelum mengunduh.</DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-auto rounded border bg-muted p-4">
          <pre className="whitespace-pre-wrap text-xs">{csvData}</pre>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
          <Button onClick={onDownload}>Unduh</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
