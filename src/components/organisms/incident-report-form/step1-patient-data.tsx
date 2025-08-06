
"use client"

import React from "react"
import { Separator } from "@/components/ui/separator"
import { Incident } from "@/store/incident-store"
import { FormInputText } from "@/components/molecules/form-input-text"
import { FormInputRadio } from "@/components/molecules/form-input-radio"
import { FormInputSelect } from "@/components/molecules/form-input-select"
import { FormInputDate } from "@/components/molecules/form-input-date"
import { FormInputTime } from "@/components/molecules/form-input-time"
import { HOSPITAL_UNITS } from "@/lib/constants"

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-semibold text-lg text-primary">{children}</h3>
)

type StepProps = {
    data: Partial<Incident>;
    onUpdate: (newData: Partial<Incident>) => void;
};

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));
const genderOptions = [{ value: 'Perempuan', label: 'Perempuan' }, { value: 'Laki-laki', label: 'Laki-laki' }];
const ageGroupOptions = [
    { value: '0-1 bulan', label: '0-1 bulan' }, { value: '>1 bln - 1 thn', label: '>1 bln - 1 thn' },
    { value: '>1 thn - 5 thn', label: '>1 thn - 5 thn' }, { value: '>5 thn - 15 thn', label: '>5 thn - 15 thn' },
    { value: '>15 thn - 30 thn', label: '>15 thn - 30 thn' }, { value: '>30 thn - 65 thn', label: '>30 thn - 65 thn' },
    { value: '>65 tahun', label: '>65 tahun' }
];
const payerOptions = [
    { value: 'Pribadi / UMUM', label: 'Pribadi / UMUM' }, { value: 'BPJS PBI', label: 'BPJS PBI' },
    { value: 'BPJS NON PBI', label: 'BPJS NON PBI' }, { value: 'SKTM', label: 'SKTM' },
    { value: 'Asuransi Lainnya', label: 'Asuransi Lainnya' }
];

export function Step1PatientData({ data, onUpdate }: StepProps) {
    return (
        <div className="space-y-6">
            <SectionTitle>Data Pasien (diisi oleh perawat)</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputText id="patientName" label="Nama Pasien" placeholder="Masukkan nama pasien" value={data.patientName} onChange={e => onUpdate({ patientName: e.target.value })}/>
                <FormInputText id="medicalRecordNumber" label="No. Rekam Medis" placeholder="Masukkan nomor CM" value={data.medicalRecordNumber} onChange={e => onUpdate({ medicalRecordNumber: e.target.value })}/>
                <FormInputRadio id="gender" label="Jenis Kelamin" items={genderOptions} value={data.gender} onValueChange={val => onUpdate({ gender: val })} />
                <FormInputRadio id="age-group" label="Kelompok Umur" items={ageGroupOptions} orientation="vertical" value={data.ageGroup} onValueChange={val => onUpdate({ ageGroup: val })}/>
                <FormInputSelect id="payer" label="Penanggung Biaya" placeholder="Pilih penanggung biaya" items={payerOptions} value={data.payer} onValueChange={val => onUpdate({ payer: val })} />
            </div>
            <Separator />
            <SectionTitle>Informasi Perawatan</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputDate id="entry-date" label="Tanggal Masuk RS" selected={data.entryDate ? new Date(data.entryDate) : undefined} onSelect={date => onUpdate({ entryDate: date?.toISOString() })}/>
                <FormInputTime id="entry-time" label="Jam Masuk RS" value={data.entryTime} onChange={e => onUpdate({ entryTime: e.target.value })}/>
                <FormInputSelect id="careRoom" label="Ruangan Perawatan" placeholder="Pilih ruangan" items={unitOptions} value={data.careRoom} onValueChange={val => onUpdate({ careRoom: val })} />
            </div>
        </div>
    )
}
