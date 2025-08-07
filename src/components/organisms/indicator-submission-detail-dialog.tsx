
"use client"

import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubmittedIndicator, IndicatorCategory } from "@/store/indicator-store"

type IndicatorSubmissionDetailDialogProps = {
    indicator: SubmittedIndicator | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 items-start gap-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="col-span-2 text-sm font-medium">{value}</div>
    </div>
)

const getStatusVariant = (status?: SubmittedIndicator['status']) => {
    switch (status) {
        case 'Diverifikasi': return 'default'
        case 'Menunggu Persetujuan': return 'secondary'
        case 'Ditolak': return 'destructive'
        default: return 'outline'
    }
}

const categoryLabels: Record<IndicatorCategory, string> = {
    INM: "Indikator Nasional Mutu",
    'IMP-RS': "Indikator Mutu Prioritas RS",
    IPU: "Indikator Prioritas Unit",
    SPM: "Standar Pelayanan Minimal"
}

export function IndicatorSubmissionDetailDialog({ indicator, open, onOpenChange }: IndicatorSubmissionDetailDialogProps) {
    if (!indicator) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detail Pengajuan Indikator</DialogTitle>
                    <DialogDescription>
                        Pengajuan untuk: {indicator.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    <DetailItem label="ID Pengajuan" value={indicator.id} />
                    <DetailItem label="Nama Indikator" value={indicator.name} />
                    <DetailItem label="Kategori" value={<Badge variant="outline">{categoryLabels[indicator.category]}</Badge>} />
                    <DetailItem label="Unit" value={indicator.unit} />
                    <DetailItem label="Frekuensi Lapor" value={indicator.frequency} />
                    <DetailItem 
                        label="Tanggal Pengajuan" 
                        value={format(new Date(indicator.submissionDate), "d MMMM yyyy", { locale: IndonesianLocale })} 
                    />
                    <DetailItem 
                        label="Deskripsi" 
                        value={<p className="bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{indicator.description}</p>}
                    />
                     <DetailItem label="Standar Target" value={`${indicator.standard}${indicator.standardUnit}`} />
                    <DetailItem 
                        label="Status" 
                        value={<Badge variant={getStatusVariant(indicator.status)}>{indicator.status}</Badge>}
                    />
                     {indicator.status === 'Ditolak' && indicator.rejectionReason && (
                        <DetailItem 
                            label="Alasan Penolakan" 
                            value={<p className="bg-destructive/10 text-destructive p-3 rounded-md whitespace-pre-wrap">{indicator.rejectionReason}</p>}
                        />
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
