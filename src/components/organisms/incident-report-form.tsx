
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FormInputText } from "@/components/molecules/form-input-text"
import { FormInputRadio } from "@/components/molecules/form-input-radio"
import { FormInputDate } from "@/components/molecules/form-input-date"
import { FormInputTime } from "@/components/molecules/form-input-time"
import { FormInputSelect } from "@/components/molecules/form-input-select"
import { FormInputTextarea } from "@/components/molecules/form-input-textarea"
import { Stepper } from "@/components/molecules/stepper"

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
    
    const next = () => setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    const prev = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))

    return (
        <div className="flex flex-col md:flex-row gap-8 p-1">
            <Stepper steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />
            <div className="flex-1">
                <div className="max-h-[65vh] overflow-y-auto pr-4 pl-1 space-y-8">
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <SectionTitle>Data Pasien (diisi oleh perawat)</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <FormInputText id="name" label="Nama Pasien" placeholder="Masukkan nama pasien" />
                                <FormInputText id="no-cm" label="No. Rekam Medis" placeholder="Masukkan nomor CM" />
                                <FormInputRadio id="gender" label="Jenis Kelamin" items={[{ value: 'P', label: 'Perempuan' }, { value: 'L', label: 'Laki-laki' }]} />
                                <FormInputRadio id="age-group" label="Kelompok Umur" items={[
                                    { value: '1', label: '0-1 bulan' }, { value: '2', label: '>1 bln - 1 thn' },
                                    { value: '3', label: '>1 thn - 5 thn' }, { value: '4', label: '>5 thn - 15 thn' },
                                    { value: '5', label: '>15 thn - 30 thn' }, { value: '6', label: '>30 thn - 65 thn' },
                                    { value: '7', label: '>65 tahun' }
                                ]} orientation="vertical" />
                                <FormInputSelect id="payer" label="Penanggung Biaya" placeholder="Pilih penanggung biaya" items={[
                                    { value: 'umum', label: 'Pribadi / UMUM' },
                                    { value: 'bpjs_pbi', label: 'BPJS PBI' },
                                    { value: 'bpjs_non_pbi', label: 'BPJS NON PBI' },
                                    { value: 'sktm', label: 'SKTM' },
                                    { value: 'asuransi_lain', label: 'Asuransi Lainnya' }
                                ]} />
                            </div>
                            <Separator />
                            <SectionTitle>Informasi Perawatan</SectionTitle>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <FormInputDate id="entry-date" label="Tanggal Masuk RS" />
                                <FormInputTime id="entry-time" label="Jam Masuk RS" />
                                <FormInputSelect id="care-room" label="Ruangan Perawatan" placeholder="Pilih ruangan" items={[
                                    { value: 'igd', label: 'IGD' },
                                    { value: 'poli', label: 'Poliklinik' },
                                    { value: 'ranap', label: 'Rawat Inap' },
                                    { value: 'icu', label: 'ICU' },
                                ]} />
                            </div>
                        </div>
                    )}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <SectionTitle>Rincian Kejadian</SectionTitle>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <FormInputDate id="incident-date" label="Tanggal Insiden" />
                                <FormInputTime id="incident-time" label="Jam Insiden" />
                            </div>
                            <FormInputTextarea id="incident-chronology" label="Kronologis Insiden" placeholder="Jelaskan secara singkat bagaimana insiden terjadi." containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
                            <FormInputSelect id="incident-type" label="Jenis Insiden" placeholder="Pilih jenis insiden" items={[
                                { value: 'KPC', label: 'Kondisi Potensial Cedera (KPC)' },
                                { value: 'KNC', label: 'Kejadian Nyaris Cedera (KNC)' },
                                { value: 'KTC', label: 'Kejadian Tidak Cedera (KTC)' },
                                { value: 'KTD', label: 'Kejadian Tidak Diharapkan (KTD)' },
                                { value: 'Sentinel', label: 'Kejadian Sentinel' }
                            ]} containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
                            <FormInputText id="incident-reporter" label="Insiden mengenai" placeholder="Contoh: Pasien, Keluarga Pasien, Pengunjung" />
                            <FormInputSelect id="incident-location" label="Lokasi Insiden" placeholder="Pilih lokasi insiden" items={[
                                { value: 'ruang_perawatan', label: 'Ruang Perawatan' },
                                { value: 'koridor', label: 'Koridor' },
                                { value: 'toilet', label: 'Kamar Mandi / Toilet' },
                                { value: 'luar_gedung', label: 'Luar Gedung' },
                                { value: 'lainnya', label: 'Lainnya' },
                            ]} />
                            <FormInputSelect id="incident-unit" label="Unit Terkait Insiden" placeholder="Pilih unit" items={[
                                { value: 'rawat_jalan', label: 'Rawat Jalan' },
                                { value: 'rawat_inap', label: 'Rawat Inap' },
                                { value: 'farmasi', label: 'Farmasi' },
                                { value: 'laboratorium', label: 'Laboratorium' },
                            ]} />
                        </div>
                    )}
                     {currentStep === 2 && (
                        <div className="space-y-6">
                            <SectionTitle>Tindak Lanjut & Pelaporan</SectionTitle>
                            <FormInputTextarea id="first-action" label="Tindakan yang dilakukan segera setelah kejadian" placeholder="Jelaskan tindakan pertama yang diberikan" containerClassName="grid grid-cols-1 md:grid-cols-form-label-full gap-x-4" />
                            <FormInputRadio id="first-action-by" label="Tindakan dilakukan oleh" items={[
                                    { value: 'tim', label: 'Tim' }, { value: 'dokter', label: 'Dokter' },
                                    { value: 'perawat', label: 'Perawat' }, { value: 'petugas_lain', label: 'Petugas Lainnya' },
                                ]} />
                            <FormInputRadio id="incident_reported" label="Apakah kejadian sama pernah terjadi di unit lain?" items={[{ value: 'ya', label: 'Ya' }, { value: 'tidak', label: 'Tidak' }]} />
                             <FormInputRadio id="grading" label="Grading Risiko Kejadian" items={[
                                    { value: 'biru', label: 'BIRU (Rendah)' }, 
                                    { value: 'hijau', label: 'HIJAU (Sedang)' },
                                    { value: 'kuning', label: 'KUNING (Tinggi)' }, 
                                    { value: 'merah', label: 'MERAH (Sangat Tinggi)' }
                                ]} orientation="vertical" />
                            <Separator />
                            <SectionTitle>Informasi Pelapor</SectionTitle>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <FormInputText id="reporter-name" label="Nama Pelapor" placeholder="Nama Anda" />
                                <FormInputText id="reporter-unit" label="Unit Kerja Pelapor" placeholder="Unit tempat Anda bekerja" />
                            </div>
                        </div>
                    )}
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
                            <Button onClick={() => setOpen(false)} size="lg">Simpan Laporan</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
