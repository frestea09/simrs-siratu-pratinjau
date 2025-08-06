
"use client"

import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SpmIndicator } from "@/store/spm-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type SpmDetailDialogProps = {
    indicator: SpmIndicator | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const getStatusBadge = (notes?: string) => {
    return notes && notes.trim() !== ''
        ? <Badge variant="destructive">Ada Catatan</Badge>
        : <Badge variant="default">Tercapai</Badge>;
}

export function SpmDetailDialog({ indicator, open, onOpenChange }: SpmDetailDialogProps) {
    if (!indicator) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detail Laporan SPM</DialogTitle>
                    <DialogDescription>{indicator.serviceType}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-muted-foreground">Indikator</span>
                        <span className="col-span-2 font-medium">{indicator.indicator}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Tanggal Laporan</span>
                        <span className="col-span-2">{format(new Date(indicator.reportingDate), "d MMMM yyyy", { locale: IndonesianLocale })}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Target</span>
                        <span className="col-span-2">{indicator.target}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Capaian</span>
                        <span className="col-span-2 font-semibold">{indicator.achievement}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-muted-foreground">Catatan</span>
                        <p className="col-span-2 bg-muted/50 p-3 rounded-md">{indicator.notes || "Tidak ada catatan."}</p>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-muted-foreground">Status</span>
                        <div className="col-span-2">{getStatusBadge(indicator.notes)}</div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
