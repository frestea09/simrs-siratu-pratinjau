
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Incident } from "@/store/incident-store"

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

type IncidentDetailDialogProps = {
    incident: Incident | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

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
                        <DetailItem label="Tanggal Masuk RS" value={new Date(incident.entryDate || Date.now()).toLocaleDateString('id-ID')} />
                        <DetailItem label="Jam Masuk RS" value={incident.entryTime} />
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Rincian Kejadian">
                         <DetailItem label="Tanggal Insiden" value={new Date(incident.incidentDate || Date.now()).toLocaleDateString('id-ID')} />
                         <DetailItem label="Jam Insiden" value={incident.incidentTime} />
                         <DetailItem label="Jenis Insiden" value={incident.type} />
                         <DetailItem label="Insiden Mengenai" value={incident.incidentSubject} />
                         <DetailItem label="Lokasi Insiden" value={incident.incidentLocation} />
                         <DetailItem label="Unit Terkait" value={incident.relatedUnit} />
                         <div className="md:col-span-2">
                             <DetailItem label="Kronologis Insiden" value={<p className="whitespace-pre-wrap">{incident.chronology}</p>} />
                         </div>
                    </DetailSection>
                    <Separator />
                    <DetailSection title="Tindak Lanjut & Analisis">
                         <div className="md:col-span-2">
                            <DetailItem label="Tindakan Segera" value={<p className="whitespace-pre-wrap">{incident.firstAction}</p>} />
                         </div>
                         <DetailItem label="Tindakan Dilakukan Oleh" value={incident.firstActionBy} />
                         <DetailItem label="Pernah Terjadi di Unit Lain?" value={incident.hasHappenedBefore} />
                         <DetailItem label="Grading Risiko" value={incident.severity} />
                    </DetailSection>
                     <Separator />
                    <DetailSection title="Informasi Pelapor">
                        <DetailItem label="Nama Pelapor" value={incident.reporterName} />
                        <DetailItem label="Unit Kerja Pelapor" value={incident.reporterUnit} />
                    </DetailSection>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
