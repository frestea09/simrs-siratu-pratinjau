
"use client"

import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Indicator } from "@/store/indicator-store"

type ReportDetailDialogProps = {
    indicator: Indicator | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ReportDetailDialog({ indicator, open, onOpenChange }: ReportDetailDialogProps) {
    if (!indicator) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Detail Laporan Indikator</DialogTitle>
                    <DialogDescription>
                        {indicator.indicator} - Periode {format(new Date(indicator.period), "MMMM yyyy", { locale: IndonesianLocale })}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Kategori</span>
                        <Badge variant="outline" className="w-fit">{indicator.category}</Badge>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Capaian</span>
                        <span className="col-span-2 text-sm font-semibold">{indicator.ratio}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Standar</span>
                        <span className="col-span-2 text-sm">{`${indicator.standard}${indicator.standardUnit}`}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <Badge variant={indicator.status === 'Memenuhi Standar' ? 'default' : 'destructive'} className="w-fit">{indicator.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground pt-1">Numerator</span>
                        <span className="col-span-2 text-sm">{indicator.numerator}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground pt-1">Denominator</span>
                        <span className="col-span-2 text-sm">{indicator.denominator}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground pt-1">Catatan</span>
                        <p className="col-span-2 text-sm bg-muted/50 p-3 rounded-md">
                            {indicator.notes || "Tidak ada catatan."}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
