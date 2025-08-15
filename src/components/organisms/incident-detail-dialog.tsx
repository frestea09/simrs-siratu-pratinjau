
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { Incident, IncidentType, IncidentSeverity } from "@prisma/client"

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-2">
        <h4 className="font-semibold text-primary">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm pl-2">{children}</div>
    </div>
)

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex flex-col">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "-"}</p>
    </div>
)

const FullWidthDetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="md:col-span-2">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium whitespace-pre-wrap">{value || "-"}</p>
    </div>
)

type IncidentDetailDialogProps = {
    incident: Incident | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const incidentTypeMap: Record<IncidentType, string> = {
    KPC: 'Kondisi Potensial Cedera (KPC)',
    KNC: 'Kejadian Nyaris Cedera (KNC)',
    KTC: 'Kejadian Tidak Cedera (KTC)',
    KTD: 'Kejadian Tidak Diharapkan (KTD)',
    Sentinel: 'Kejadian Sentinel',
};

const severityMap: Record<IncidentSeverity, string> = {
    BIRU: "BIRU (Rendah)",
    HIJAU: "HIJAU (Sedang)",
    KUNING: "KUNING (Tinggi)",
    MERAH: "MERAH (Sangat Tinggi)",
};

export const IncidentDetailDialog = ({ incident, open, onOpenChange }: IncidentDetailDialogProps) => {
    if (!incident) return null;

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
                        <DetailItem label="Tanggal Masuk RS" value={incident.entryDate ? new Date(incident.entryDate).toLocaleDateString('id-ID') : '-'} />
                        <DetailItem label="Jam Masuk RS" value={incident.entryTime} />
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Rincian Kejadian">
                         <DetailItem label="Tanggal Insiden" value={new Date(incident.incidentDate).toLocaleDateString('id-ID')} />
                         <DetailItem label="Jam Insiden" value={incident.incidentTime} />
                         <DetailItem label="Jenis Insiden" value={incidentTypeMap[incident.type]} />
                         <DetailItem label="Insiden Mengenai" value={incident.incidentSubject} />
                         <DetailItem label="Lokasi Insiden" value={incident.incidentLocation} />
                         <DetailItem label="Unit Terkait" value={incident.relatedUnit} />
                         <FullWidthDetailItem label="Kronologis Insiden" value={incident.chronology} />
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Tindak Lanjut & Analisis">
                         <FullWidthDetailItem label="Tindakan Segera" value={incident.firstAction} />
                         <DetailItem label="Tindakan Dilakukan Oleh" value={incident.firstActionBy} />
                         <DetailItem label="Akibat Insiden Terhadap Pasien" value={incident.patientImpact} />
                         <DetailItem label="Pernah Terjadi di Unit Lain?" value={incident.hasHappenedBefore ? 'Ya' : 'Tidak'} />
                         <DetailItem label="Grading Risiko" value={severityMap[incident.severity]} />
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
