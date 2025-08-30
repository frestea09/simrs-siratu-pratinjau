
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Incident } from "@/store/incident-store"
import { formatChronology, cn } from "@/lib/utils"
import { Badge } from "../ui/badge"

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-2">
        <h4 className="font-semibold text-primary text-lg">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pl-2">{children}</div>
    </div>
)

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-base">{value || "-"}</p>
    </div>
)

const FullWidthDetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="md:col-span-2 flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {typeof value === "string" || value === undefined || value === null ? (
            <p className="font-medium text-base whitespace-pre-wrap leading-relaxed text-justify">{value || "-"}</p>
        ) : (
            value
        )}
    </div>
)

const ChronologyList = ({ text }: { text: string }) => {
    const steps = formatChronology(text)
        .split("\n")
        .filter(Boolean)

    if (steps.length === 0) {
        return <p className="font-medium">-</p>
    }

    return (
        <ol className="list-decimal pl-6 space-y-2 text-base">
            {steps.map((step, index) => (
                <li key={index} className="leading-relaxed">
                    {step}
                </li>
            ))}
        </ol>
    )
}

const SeverityBadge = ({ severity }: { severity: Incident['severity'] }) => {
    const severityMap: Record<Incident['severity'], string> = {
        biru: "BIRU (Rendah)",
        hijau: "HIJAU (Sedang)",
        kuning: "KUNING (Tinggi)",
        merah: "MERAH (Sangat Tinggi)",
    }
    const colorMap: Record<Incident['severity'], string> = {
        biru: "bg-blue-500 text-white border-blue-500 hover:bg-blue-500/80",
        hijau: "bg-green-500 text-white border-green-500 hover:bg-green-500/80",
        kuning: "bg-yellow-500 text-yellow-900 border-yellow-500 hover:bg-yellow-500/80",
        merah: "bg-red-500 text-white border-red-500 hover:bg-red-500/80",
    }
    return <Badge variant="outline" className={cn("text-base", colorMap[severity])}>{severityMap[severity]}</Badge>
}

type IncidentDetailDialogProps = {
    incident: Incident | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const IncidentDetailDialog = ({ incident, open, onOpenChange }: IncidentDetailDialogProps) => {
    if (!incident) return null;

    const displayLocation = incident.incidentLocation === 'Lainnya' 
        ? `Lainnya: ${incident.incidentLocationOther || '(tidak disebutkan)'}` 
        : incident.incidentLocation;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detail Laporan Insiden - {incident.id}</DialogTitle>
                    <DialogDescription>
                        Dilaporkan pada {new Date(incident.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6 py-4">
                    <DetailSection title="Informasi Pasien">
                        <DetailItem label="Nama Pasien" value={incident.patientName} />
                        <DetailItem label="No. Rekam Medis" value={incident.medicalRecordNumber} />
                        <DetailItem label="Ruang Perawatan" value={incident.careRoom} />
                        <DetailItem label="Kelompok Umur" value={incident.ageGroup} />
                        <DetailItem label="Jenis Kelamin" value={incident.gender} />
                        <DetailItem label="Penanggung Biaya" value={incident.payer} />
                        <DetailItem label="Tanggal Masuk RS" value={new Date(incident.entryDate || Date.now()).toLocaleDateString('id-ID')} />
                        <DetailItem label="Jam Masuk RS" value={incident.entryTime} />
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Rincian Kejadian">
                         <DetailItem label="Tanggal Insiden" value={new Date(incident.incidentDate || Date.now()).toLocaleDateString('id-ID')} />
                         <DetailItem label="Jam Insiden" value={incident.incidentTime} />
                         <DetailItem label="Jenis Insiden" value={incident.type} />
                         <DetailItem label="Insiden Mengenai" value={incident.incidentSubject} />
                         <DetailItem label="Lokasi Insiden" value={displayLocation} />
                         <DetailItem label="Unit Terkait" value={incident.relatedUnit} />
                         <FullWidthDetailItem label="Kronologis Insiden" value={<ChronologyList text={incident.chronology || ""} />} />
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Tindak Lanjut & Analisis">
                         <FullWidthDetailItem label="Tindakan Segera" value={incident.firstAction} />
                         <DetailItem label="Tindakan Dilakukan Oleh" value={incident.firstActionBy} />
                         <DetailItem label="Akibat Insiden Terhadap Pasien" value={incident.patientImpact} />
                         <DetailItem label="Pernah Terjadi di Unit Lain?" value={incident.hasHappenedBefore} />
                         <DetailItem label="Grading Risiko" value={<SeverityBadge severity={incident.severity} />} />
                         <FullWidthDetailItem label="Catatan Analisis (oleh Komite)" value={incident.analysisNotes} />
                         <FullWidthDetailItem label="Rencana Tindak Lanjut (oleh Komite)" value={incident.followUpPlan} />
                    </DetailSection>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
