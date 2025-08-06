
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Stepper } from "@/components/molecules/stepper"
import { useIncidentStore } from "@/store/incident-store"
import { useToast } from "@/hooks/use-toast"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormInputText } from "../molecules/form-input-text"
import { FormInputRadio } from "../molecules/form-input-radio"
import { FormInputDate } from "../molecules/form-input-date"
import { FormInputSelect } from "../molecules/form-input-select"
import { FormInputTextarea } from "../molecules/form-input-textarea"
import { FormInputTime } from "../molecules/form-input-time"
import { Incident } from "@/store/incident-store"


const steps = [
    { id: '01', name: 'Data Pasien' },
    { id: '02', name: 'Rincian Kejadian' },
    { id: '03', name: 'Tindak Lanjut & Pelaporan' },
]

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-semibold text-lg text-primary">{children}</h3>
)

type IncidentReportFormProps = {
    setOpen: (open: boolean) => void;
}

export function IncidentReportForm({ setOpen }: IncidentReportFormProps) {
    const [currentStep, setCurrentStep] = React.useState(0)
    const { addIncident } = useIncidentStore()
    const { toast } = useToast()
    
    const [formData, setFormData] = React.useState<Partial<Incident>>({});

    const next = () => setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    const prev = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))

    const updateFormData = (newData: Partial<Incident>) => {
        setFormData(prev => ({...prev, ...newData}));
    }


    const handleSave = () => {
        const severityMap: { [key: string]: string } = {
            biru: 'Rendah',
            hijau: 'Sedang',
            kuning: 'Tinggi',
            merah: 'Sangat Tinggi',
        };
        const incidentTypeMap: { [key: string]: string } = {
            'KPC': 'Kondisi Potensial Cedera (KPC)',
            'KNC': 'Kejadian Nyaris Cedera (KNC)',
            'KTC': 'Kejadian Tidak Cedera (KTC)',
            'KTD': 'Kejadian Tidak Diharapkan (KTD)',
            'Sentinel': 'Kejadian Sentinel',
        };
        
        const finalData = { ...formData } as Omit<Incident, 'id' | 'date' | 'status'>;

        // Map values before saving
        finalData.type = incidentTypeMap[finalData.type] || 'N/A';
        finalData.severity = severityMap[finalData.severity] || 'N/A';


        addIncident(finalData);
        
        toast({
            title: "Laporan Berhasil Disimpan",
            description: "Laporan insiden baru telah ditambahkan ke daftar.",
        });
        
        setOpen(false);
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 p-1">
            <Stepper steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />
            <div className="flex-1">
                <div className="max-h-[65vh] overflow-y-auto pr-4 pl-1 space-y-8">
                    {currentStep === 0 && <Step1 data={formData} onUpdate={updateFormData} />}
                    {currentStep === 1 && <Step2 data={formData} onUpdate={updateFormData} />}
                    {currentStep === 2 && <Step3 data={formData} onUpdate={updateFormData} />}
                </div>
                <div className="flex justify-between items-center pt-5 mt-5 border-t">
                    <div>
                        {currentStep > 0 && (
                            <Button variant="outline" onClick={prev}>
                                Kembali
                            </Button>
                        )}
                    </div>
                    <div>
                        {currentStep < steps.length - 1 ? (
                            <Button onClick={next}>Lanjutkan</Button>
                        ) : (
                            <Button onClick={handleSave} size="lg">Simpan Laporan</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Sub-components for each step
type StepProps = {
    data: Partial<Incident>;
    onUpdate: (newData: Partial<Incident>) => void;
};

function Step1({ data, onUpdate }: StepProps) {
    return (
        <div className="space-y-6">
            <SectionTitle>Data Pasien (diisi oleh perawat)</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputText id="patientName" label="Nama Pasien" placeholder="Masukkan nama pasien" value={data.patientName} onChange={e => onUpdate({ patientName: e.target.value })}/>
                <FormInputText id="medicalRecordNumber" label="No. Rekam Medis" placeholder="Masukkan nomor CM" value={data.medicalRecordNumber} onChange={e => onUpdate({ medicalRecordNumber: e.target.value })}/>
                <FormInputRadio id="gender" label="Jenis Kelamin" items={[{ value: 'Perempuan', label: 'Perempuan' }, { value: 'Laki-laki', label: 'Laki-laki' }]} value={data.gender} onValueChange={val => onUpdate({ gender: val })} />
                <FormInputRadio id="age-group" label="Kelompok Umur" items={[
                    { value: '0-1 bulan', label: '0-1 bulan' }, { value: '>1 bln - 1 thn', label: '>1 bln - 1 thn' },
                    { value: '>1 thn - 5 thn', label: '>1 thn - 5 thn' }, { value: '>5 thn - 15 thn', label: '>5 thn - 15 thn' },
                    { value: '>15 thn - 30 thn', label: '>15 thn - 30 thn' }, { value: '>30 thn - 65 thn', label: '>30 thn - 65 thn' },
                    { value: '>65 tahun', label: '>65 tahun' }
                ]} orientation="vertical" value={data.ageGroup} onValueChange={val => onUpdate({ ageGroup: val })}/>
                <FormInputSelect id="payer" label="Penanggung Biaya" placeholder="Pilih penanggung biaya" items={[
                    { value: 'Pribadi / UMUM', label: 'Pribadi / UMUM' },
                    { value: 'BPJS PBI', label: 'BPJS PBI' },
                    { value: 'BPJS NON PBI', label: 'BPJS NON PBI' },
                    { value: 'SKTM', label: 'SKTM' },
                    { value: 'Asuransi Lainnya', label: 'Asuransi Lainnya' }
                ]} value={data.payer} onValueChange={val => onUpdate({ payer: val })} />
            </div>
            <Separator />
            <SectionTitle>Informasi Perawatan</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputDate id="entry-date" label="Tanggal Masuk RS" selected={data.entryDate ? new Date(data.entryDate) : undefined} onSelect={date => onUpdate({ entryDate: date?.toISOString() })}/>
                <FormInputTime id="entry-time" label="Jam Masuk RS" value={data.entryTime} onChange={e => onUpdate({ entryTime: e.target.value })}/>
                <FormInputSelect id="careRoom" label="Ruangan Perawatan" placeholder="Pilih ruangan" items={[
                    { value: 'IGD', label: 'IGD' },
                    { value: 'Poliklinik', label: 'Poliklinik' },
                    { value: 'Rawat Inap', label: 'Rawat Inap' },
                    { value: 'ICU', label: 'ICU' },
                ]} value={data.careRoom} onValueChange={val => onUpdate({ careRoom: val })} />
            </div>
        </div>
    )
}

function Step2({ data, onUpdate }: StepProps) {
     return (
        <div className="space-y-6">
            <SectionTitle>Rincian Kejadian</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputDate id="incident-date" label="Tanggal Insiden" selected={data.incidentDate ? new Date(data.incidentDate) : undefined} onSelect={date => onUpdate({ incidentDate: date?.toISOString() })} />
                <FormInputTime id="incident-time" label="Jam Insiden" value={data.incidentTime} onChange={e => onUpdate({ incidentTime: e.target.value })} />
            </div>
            <FormInputTextarea id="chronology" label="Kronologis Insiden" placeholder="Jelaskan secara singkat bagaimana insiden terjadi." value={data.chronology} onChange={e => onUpdate({ chronology: e.target.value })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
            <FormInputSelect id="type" label="Jenis Insiden" placeholder="Pilih jenis insiden" items={[
                { value: 'KPC', label: 'Kondisi Potensial Cedera (KPC)' },
                { value: 'KNC', label: 'Kejadian Nyaris Cedera (KNC)' },
                { value: 'KTC', label: 'Kejadian Tidak Cedera (KTC)' },
                { value: 'KTD', label: 'Kejadian Tidak Diharapkan (KTD)' },
                { value: 'Sentinel', label: 'Kejadian Sentinel' }
            ]} value={data.type} onValueChange={val => onUpdate({ type: val })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
            <FormInputText id="incidentSubject" label="Insiden mengenai" placeholder="Contoh: Pasien, Keluarga Pasien, Pengunjung" value={data.incidentSubject} onChange={e => onUpdate({ incidentSubject: e.target.value })} />
            <FormInputSelect id="incidentLocation" label="Lokasi Insiden" placeholder="Pilih lokasi insiden" items={[
                { value: 'Ruang Perawatan', label: 'Ruang Perawatan' },
                { value: 'Koridor', label: 'Koridor' },
                { value: 'Kamar Mandi / Toilet', label: 'Kamar Mandi / Toilet' },
                { value: 'Luar Gedung', label: 'Luar Gedung' },
                { value: 'Lainnya', label: 'Lainnya' },
            ]} value={data.incidentLocation} onValueChange={val => onUpdate({ incidentLocation: val })} />
            <FormInputSelect id="relatedUnit" label="Unit Terkait Insiden" placeholder="Pilih unit" items={[
                { value: 'Rawat Jalan', label: 'Rawat Jalan' },
                { value: 'Rawat Inap', label: 'Rawat Inap' },
                { value: 'Farmasi', label: 'Farmasi' },
                { value: 'Laboratorium', label: 'Laboratorium' },
            ]} value={data.relatedUnit} onValueChange={val => onUpdate({ relatedUnit: val })} />
        </div>
    )
}

function Step3({ data, onUpdate }: StepProps) {
    return (
        <div className="space-y-6">
            <SectionTitle>Tindak Lanjut & Pelaporan</SectionTitle>
            <FormInputTextarea id="firstAction" label="Tindakan yang dilakukan segera setelah kejadian" placeholder="Jelaskan tindakan pertama yang diberikan" value={data.firstAction} onChange={e => onUpdate({ firstAction: e.target.value })} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
            <FormInputRadio id="firstActionBy" label="Tindakan dilakukan oleh" items={[
                    { value: 'Tim', label: 'Tim' }, { value: 'Dokter', label: 'Dokter' },
                    { value: 'Perawat', label: 'Perawat' }, { value: 'Petugas Lainnya', label: 'Petugas Lainnya' },
                ]} value={data.firstActionBy} onValueChange={val => onUpdate({ firstActionBy: val })} />
            <FormInputRadio id="hasHappenedBefore" label="Apakah kejadian sama pernah terjadi di unit lain?" items={[{ value: 'Ya', label: 'Ya' }, { value: 'Tidak', label: 'Tidak' }]} value={data.hasHappenedBefore} onValueChange={val => onUpdate({ hasHappenedBefore: val })} />
             <FormInputRadio id="severity" label="Grading Risiko Kejadian" items={[
                    { value: 'biru', label: 'BIRU (Rendah)' }, 
                    { value: 'hijau', label: 'HIJAU (Sedang)' },
                    { value: 'kuning', label: 'KUNING (Tinggi)' }, 
                    { value: 'merah', label: 'MERAH (Sangat Tinggi)' }
                ]} orientation="vertical" value={data.severity} onValueChange={val => onUpdate({ severity: val })} />
            <Separator />
            <SectionTitle>Informasi Pelapor</SectionTitle>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormInputText id="reporterName" label="Nama Pelapor" placeholder="Nama Anda" value={data.reporterName} onChange={e => onUpdate({ reporterName: e.target.value })} />
                <FormInputText id="reporterUnit" label="Unit Kerja Pelapor" placeholder="Unit tempat Anda bekerja" value={data.reporterUnit} onChange={e => onUpdate({ reporterUnit: e.target.value })}/>
            </div>
        </div>
    )
}

    