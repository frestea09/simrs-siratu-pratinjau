
"use client"

import { format, parseISO } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Indicator } from "@/store/indicator-store"
import { Separator } from "../ui/separator"

type ReportDetailDialogProps = {
    indicator: Indicator | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-2">
        <h4 className="font-semibold text-primary">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm pl-2">{children}</div>
    </div>
)

const DetailItem = ({ label, value }: { label: string, value?: React.ReactNode }) => (
    <div className="flex flex-col">
        <p className="text-muted-foreground">{label}</p>
        <div className="font-medium">{value ?? "-"}</div>
    </div>
)


export function ReportDetailDialog({ indicator, open, onOpenChange }: ReportDetailDialogProps) {
    if (!indicator) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Detail Laporan Indikator</DialogTitle>
                    <DialogDescription>
                        {indicator.indicator} - {format(parseISO(indicator.period), "d MMMM yyyy", { locale: IndonesianLocale })}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-4 py-4">
                    <DetailSection title="Ringkasan Capaian">
                        <DetailItem label="Kategori" value={<Badge variant="outline" className="w-fit">{indicator.category}</Badge>} />
                        <DetailItem label="Status" value={<Badge variant={indicator.status === 'Memenuhi Standar' ? 'default' : 'destructive'} className="w-fit">{indicator.status}</Badge>} />
                         <DetailItem label="Capaian" value={<span className="font-semibold text-lg">{indicator.ratio}{indicator.standardUnit}</span>} />
                        <DetailItem label="Standar" value={`${indicator.standard}${indicator.standardUnit}`} />
                        <DetailItem label="Numerator" value={indicator.numerator} />
                        <DetailItem label="Denominator" value={indicator.denominator} />
                    </DetailSection>
                    
                    <Separator />

                    <div className="space-y-2">
                        <h4 className="font-semibold text-primary">Analisis & Tindak Lanjut</h4>
                         <div className="space-y-3 pl-2">
                             <div className="flex flex-col">
                                <p className="text-muted-foreground">Catatan Analisis</p>
                                <p className="font-medium bg-muted/50 p-3 rounded-md mt-1">
                                    {indicator.analysisNotes || "Tidak ada catatan analisis."}
                                </p>
                            </div>
                             <div className="flex flex-col">
                                <p className="text-muted-foreground">Rencana Tindak Lanjut</p>
                                <p className="font-medium bg-muted/50 p-3 rounded-md mt-1">
                                    {indicator.followUpPlan || "Tidak ada rencana tindak lanjut."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
