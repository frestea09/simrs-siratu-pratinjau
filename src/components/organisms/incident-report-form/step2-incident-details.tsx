
"use client"

import React from "react"
import { Incident } from "@/store/incident-store"
import { FormInputDate } from "@/components/molecules/form-input-date"
import { FormInputTime } from "@/components/molecules/form-input-time"
import { FormInputTextarea } from "@/components/molecules/form-input-textarea"
import { FormInputSelect } from "@/components/molecules/form-input-select"
import { FormInputText } from "@/components/molecules/form-input-text"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { Combobox } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-semibold text-lg text-primary">{children}</h3>
)

type StepProps = {
    data: Partial<Incident>;
    onUpdate: (newData: Partial<Incident>) => void;
};

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));
const incidentTypeOptions = [
    { value: 'KPC', label: 'Kondisi Potensial Cedera (KPC)' }, { value: 'KNC', label: 'Kejadian Nyaris Cedera (KNC)' },
    { value: 'KTC', label: 'Kejadian Tidak Cedera (KTC)' }, { value: 'KTD', label: 'Kejadian Tidak Diharapkan (KTD)' },
    { value: 'Sentinel', label: 'Kejadian Sentinel' }
];
const incidentLocationOptions = [
    { value: 'Ruang Perawatan', label: 'Ruang Perawatan' }, { value: 'Koridor', label: 'Koridor' },
    { value: 'Kamar Mandi / Toilet', label: 'Kamar Mandi / Toilet' }, { value: 'Luar Gedung', label: 'Luar Gedung' },
    { value: 'Lainnya', label: 'Lainnya' },
];

export function Step2IncidentDetails({ data, onUpdate }: StepProps) {
     return (
        <div className="space-y-6">
            <SectionTitle>Rincian Kejadian</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputDate id="incident-date" label="Tanggal Insiden" selected={data.incidentDate ? new Date(data.incidentDate) : undefined} onSelect={date => onUpdate({ incidentDate: date?.toISOString() })} />
                <FormInputTime id="incident-time" label="Jam Insiden" value={data.incidentTime ?? ""} onChange={e => onUpdate({ incidentTime: e.target.value })} />
            </div>
            <FormInputTextarea id="chronology" label="Kronologis Insiden" placeholder="Jelaskan secara singkat bagaimana insiden terjadi." value={data.chronology ?? ""} onChange={e => onUpdate({ chronology: e.target.value })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
            <FormInputSelect id="type" label="Jenis Insiden" placeholder="Pilih jenis insiden" items={incidentTypeOptions} value={data.type ?? ""} onValueChange={val => onUpdate({ type: val })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
            <FormInputText id="incidentSubject" label="Insiden mengenai" placeholder="Contoh: Pasien, Keluarga Pasien, Pengunjung" value={data.incidentSubject ?? ""} onChange={e => onUpdate({ incidentSubject: e.target.value })} />
             <div className="grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-start">
                <Label htmlFor="incidentLocation" className="text-right pt-2">Lokasi Insiden</Label>
                <div className="space-y-2">
                    <Combobox
                        id="incidentLocation"
                        options={incidentLocationOptions}
                        value={data.incidentLocation ?? ""}
                        onSelect={(val) => onUpdate({ incidentLocation: val })}
                        placeholder="Pilih atau ketik lokasi"
                        searchPlaceholder="Cari lokasi..."
                    />
                    {data.incidentLocation === 'Lainnya' && (
                         <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="incidentLocationOther">Lokasi Lainnya (mohon sebutkan)</Label>
                            <Input
                                id="incidentLocationOther"
                                placeholder="Contoh: Area Parkir Belakang"
                                value={data.incidentLocationOther ?? ""}
                                onChange={e => onUpdate({ incidentLocationOther: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            </div>
            <FormInputSelect id="relatedUnit" label="Unit Terkait Insiden" placeholder="Pilih unit" items={unitOptions} value={data.relatedUnit ?? ""} onValueChange={val => onUpdate({ relatedUnit: val })} />
        </div>
    )
}
