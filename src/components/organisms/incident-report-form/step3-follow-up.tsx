
"use client"

import React from "react"
import { Separator } from "@/components/ui/separator"
import { Incident } from "@/store/incident-store"
import { FormInputTextarea } from "@/components/molecules/form-input-textarea"
import { FormInputRadio } from "@/components/molecules/form-input-radio"
import { FormInputText } from "@/components/molecules/form-input-text"
import { FormInputCombobox } from "@/components/molecules/form-input-combobox"
import { HOSPITAL_UNITS } from "@/lib/constants"

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-semibold text-lg text-primary">{children}</h3>
)

type StepProps = {
    data: Partial<Incident>;
    onUpdate: (newData: Partial<Incident>) => void;
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

export function Step3FollowUp({ data, onUpdate }: StepProps) {
    return (
        <div className="space-y-6">
            <SectionTitle>Tindak Lanjut & Pelaporan</SectionTitle>
            <FormInputTextarea id="firstAction" label="Tindakan yang dilakukan segera setelah kejadian" placeholder="Jelaskan tindakan pertama yang diberikan" value={data.firstAction} onChange={e => onUpdate({ firstAction: e.target.value })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
            <FormInputRadio id="firstActionBy" label="Tindakan dilakukan oleh" items={firstActionByOptions} value={data.firstActionBy} onValueChange={val => onUpdate({ firstActionBy: val })} />
            <FormInputRadio id="hasHappenedBefore" label="Apakah kejadian sama pernah terjadi di unit lain?" items={hasHappenedOptions} value={data.hasHappenedBefore} onValueChange={val => onUpdate({ hasHappenedBefore: val })} />
             <FormInputRadio id="severity" label="Grading Risiko Kejadian" items={severityOptions} orientation="vertical" value={data.severity} onValueChange={val => onUpdate({ severity: val })} />
            <Separator />
            <SectionTitle>Informasi Pelapor</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputText id="reporterName" label="Nama Pelapor" placeholder="Nama Anda" value={data.reporterName} onChange={e => onUpdate({ reporterName: e.target.value })} />
                <FormInputCombobox id="reporterUnit" label="Unit Kerja Pelapor" placeholder="Pilih unit" searchPlaceholder="Cari unit..." notFoundMessage="Unit tidak ditemukan." items={unitOptions} value={data.reporterUnit} onValueChange={val => onUpdate({ reporterUnit: val })} />
            </div>
        </div>
    )
}
