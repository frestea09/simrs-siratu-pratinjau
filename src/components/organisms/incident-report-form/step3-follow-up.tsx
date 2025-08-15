
"use client"

import React from "react"
import { Separator } from "@/components/ui/separator"
import { Incident } from "@/store/incident-store"
import { FormInputTextarea } from "@/components/molecules/form-input-textarea"
import { FormInputRadio } from "@/components/molecules/form-input-radio"
import { HOSPITAL_UNITS } from "@/lib/constants"
import type { User } from "@prisma/client"


const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-semibold text-lg text-primary">{children}</h3>
)

type StepProps = {
    data: Partial<Incident>;
    onUpdate: (newData: Partial<Incident>) => void;
    currentUser: User | null;
};

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));
const firstActionByOptions = [
    { value: 'Tim', label: 'Tim' }, { value: 'Dokter', label: 'Dokter' },
    { value: 'Perawat', label: 'Perawat' }, { value: 'Petugas Lainnya', label: 'Petugas Lainnya' },
];
const hasHappenedOptions = [{ value: 'Ya', label: 'Ya' }, { value: 'Tidak', label: 'Tidak' }];
const severityOptions = [
    { value: 'biru', label: 'BIRU (Rendah)' }, { value: 'hijau', label: 'HIJAU (Sedang)' },
    { value: 'kuning', label: 'KUNING (Tinggi)' }, { value: 'merah', label: 'MERAH (Sangat Tinggi)' }
];
const patientImpactOptions = [
    { value: 'Kematian', label: 'Kematian' },
    { value: 'Cedera ireversibel / Cedera Berat', label: 'Cedera ireversibel / Cedera Berat' },
    { value: 'Cedera reversibel / Cedera Sedang', label: 'Cedera reversibel / Cedera Sedang' },
    { value: 'Cedera Ringan', label: 'Cedera Ringan' },
    { value: 'Tidak ada cedera', label: 'Tidak ada cedera' },
];

export function Step3FollowUp({ data, onUpdate, currentUser }: StepProps) {
    const canAnalyze = currentUser?.role === 'ADMIN_SISTEM' || currentUser?.role === 'SUB_KOMITE_KESELAMATAN_PASIEN';

    return (
        <div className="space-y-6">
            <SectionTitle>Tindak Lanjut & Dampak</SectionTitle>
            <FormInputTextarea id="firstAction" label="Tindakan yang dilakukan segera setelah kejadian" placeholder="Jelaskan tindakan pertama yang diberikan" value={data.firstAction} onChange={e => onUpdate({ firstAction: e.target.value })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
            <FormInputRadio id="firstActionBy" label="Tindakan dilakukan oleh" items={firstActionByOptions} value={data.firstActionBy} onValueChange={val => onUpdate({ firstActionBy: val })} />
            <FormInputRadio id="patientImpact" label="Akibat Insiden Terhadap Pasien" items={patientImpactOptions} orientation="vertical" value={data.patientImpact} onValueChange={val => onUpdate({ patientImpact: val })} />
            <Separator />
            <SectionTitle>Analisis & Pelaporan</SectionTitle>
            <FormInputRadio id="hasHappenedBefore" label="Apakah kejadian sama pernah terjadi di unit lain?" items={hasHappenedOptions} value={data.hasHappenedBefore} onValueChange={val => onUpdate({ hasHappenedBefore: val })} />
             <FormInputRadio id="severity" label="Grading Risiko Kejadian" items={severityOptions} orientation="vertical" value={data.severity} onValueChange={val => onUpdate({ severity: val })} />
            
            {canAnalyze && (
                <>
                    <Separator />
                    <SectionTitle>Analisis & Rencana Tindak Lanjut (Diisi oleh Komite)</SectionTitle>
                     <FormInputTextarea id="analysisNotes" label="Catatan Analisis" placeholder="Jelaskan analisis akar masalah dari insiden ini." value={data.analysisNotes} onChange={e => onUpdate({ analysisNotes: e.target.value })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
                    <FormInputTextarea id="followUpPlan" label="Rencana Tindak Lanjut" placeholder="Jelaskan rencana tindak lanjut untuk mencegah kejadian serupa di masa depan." value={data.followUpPlan} onChange={e => onUpdate({ followUpPlan: e.target.value })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
                </>
            )}

            <Separator />
            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p className="font-semibold">Laporan Anda bersifat anonim.</p>
                <p>Identitas pelapor tidak akan dicatat untuk menjaga kerahasiaan dan mendorong pelaporan yang jujur.</p>
            </div>
        </div>
    )
}

    