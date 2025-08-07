
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type RejectionReasonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reason: string) => void
}

export function RejectionReasonDialog({ open, onOpenChange, onSubmit }: RejectionReasonDialogProps) {
  const [reason, setReason] = React.useState("")
  const { toast } = useToast();

  const handleSubmit = () => {
    if (reason.trim().length < 10) {
        toast({
            variant: "destructive",
            title: "Alasan Tidak Cukup",
            description: "Harap berikan alasan penolakan yang jelas (minimal 10 karakter)."
        })
      return
    }
    onSubmit(reason)
    onOpenChange(false)
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alasan Penolakan</DialogTitle>
          <DialogDescription>
            Berikan alasan yang jelas mengapa pengajuan ini ditolak. Alasan ini akan ditampilkan kepada pengaju.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="reason">Alasan Penolakan</Label>
            <Textarea 
              placeholder="Tuliskan alasan penolakan di sini..." 
              id="reason" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit}>Kirim Penolakan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
