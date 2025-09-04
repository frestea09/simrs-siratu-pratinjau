
"use client"

import { create } from "zustand"
import { calculateRatio, calculateStatus } from "@/lib/indicator-utils"

export type IndicatorCategory = "INM" | "IMP-RS" | "IMPU" | "SPM"
export type IndicatorFrequency = "Harian" | "Mingguan" | "Bulanan" | "Triwulan" | "Tahunan"
export type CalculationMethod = "percentage" | "average";

export type IndicatorProfile = {
  id: string
  title: string
  purpose: string
  definition: string
  implication: string
  calculationMethod: CalculationMethod,
  numerator: string
  denominator: string
  target: number
  targetUnit: "%" | "menit"
  inclusionCriteria: string
  exclusionCriteria: string
  dataRecording: string
  unitRecap: string
  analysisReporting: string
  area: string
  pic: string
  status: 'Draf' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak'
  rejectionReason?: string
  createdBy: string // user id
  createdAt: string
  unit: string
}

export type SubmittedIndicator = {
  id: string
  name: string
  category: IndicatorCategory
  description: string
  unit: string
  frequency: IndicatorFrequency
  status: "Menunggu Persetujuan" | "Diverifikasi" | "Ditolak"
  submissionDate: string
  standard: number
  standardUnit: "%" | "menit"
  rejectionReason?: string
  submittedById?: string;
  profileId?: string;
}

export type Indicator = {
  id: string
  submissionId: string;
  indicator: string
  category: IndicatorCategory
  unit: string
  period: string
  frequency: IndicatorFrequency
  numerator: number
  denominator: number
  calculationMethod: CalculationMethod;
  standard: number
  standardUnit: "%" | "menit"
  analysisNotes?: string
  followUpPlan?: string
  ratio: string
  status: "Memenuhi Standar" | "Tidak Memenuhi Standar" | "N/A"
}

// --- Initial Demo Data ---

const initialProfiles: IndicatorProfile[] = [
  {
    id: "PROF-SKP-1",
    title: "Kepatuhan Identifikasi Pasien",
    purpose: "Memastikan pasien teridentifikasi dengan benar sebelum menerima layanan medis.",
    definition: "Persentase kepatuhan petugas dalam melakukan identifikasi pasien menggunakan minimal dua identitas (nama, tanggal lahir) sebelum tindakan.",
    implication: "Mengurangi risiko salah pasien, salah prosedur, dan salah pengobatan.",
    calculationMethod: "percentage",
    numerator: "Jumlah tindakan di mana identifikasi dilakukan dengan benar",
    denominator: "Jumlah total tindakan yang diamati",
    target: 100,
    targetUnit: "%",
    inclusionCriteria: "Semua pasien yang akan menerima obat, transfusi darah, atau tindakan.",
    exclusionCriteria: "Pasien yang tidak dapat dikonfirmasi identitasnya.",
    dataRecording: "Dicatat oleh supervisor pada lembar observasi.",
    unitRecap: "Direkapitulasi oleh kepala ruangan setiap bulan.",
    analysisReporting: "Dianalisis oleh Komite Mutu setiap triwulan.",
    area: "Rawat Inap, IGD, Rawat Jalan",
    pic: "Kepala Ruangan",
    status: 'Disetujui',
    createdBy: "user-1",
    createdAt: new Date("2023-01-10T10:00:00Z").toISOString(),
    unit: "IGD"
  },
  {
    id: "PROF-SKP-2",
    title: "Kepatuhan Hand Hygiene",
    purpose: "Mencegah penyebaran infeksi melalui tangan.",
    definition: "Persentase kepatuhan petugas melakukan kebersihan tangan sesuai 5 momen WHO.",
    implication: "Menurunkan angka infeksi terkait pelayanan kesehatan (HAIs).",
    calculationMethod: "percentage",
    numerator: "Jumlah momen cuci tangan yang dilakukan sesuai standar",
    denominator: "Jumlah seluruh peluang cuci tangan yang diamati",
    target: 85,
    targetUnit: "%",
    inclusionCriteria: "Semua petugas kesehatan yang kontak dengan pasien.",
    exclusionCriteria: "N/A",
    dataRecording: "Observasi oleh tim PPI.",
    unitRecap: "Direkapitulasi oleh tim PPI setiap bulan.",
    analysisReporting: "Dilaporkan ke Komite PPI setiap bulan.",
    area: "Seluruh Area RS",
    pic: "Tim PPI",
    status: 'Disetujui',
    createdBy: "user-1",
    createdAt: new Date("2023-01-11T10:00:00Z").toISOString(),
    unit: "PPI"
  },
  {
    id: "PROF-SKP-3",
    title: "Kepatuhan Penandaan Area Operasi (Site Marking)",
    purpose: "Memastikan lokasi operasi yang benar.",
    definition: "Persentase pasien operasi yang mendapatkan penandaan lokasi operasi dengan benar oleh dokter bedah.",
    implication: "Mencegah kesalahan lokasi operasi (wrong-site surgery).",
    calculationMethod: "percentage",
    numerator: "Jumlah pasien operasi yang ditandai dengan benar",
    denominator: "Jumlah total pasien operasi yang memerlukan penandaan",
    target: 100,
    targetUnit: "%",
    inclusionCriteria: "Semua pasien yang akan menjalani prosedur bedah.",
    exclusionCriteria: "Prosedur tanpa sisi (misal: operasi jantung).",
    dataRecording: "Checklist keselamatan pasien di kamar operasi.",
    unitRecap: "Direkap oleh kepala instalasi bedah.",
    analysisReporting: "Dilaporkan ke Komite Mutu.",
    area: "IBS",
    pic: "Kepala IBS",
    status: 'Disetujui',
    createdBy: "user-1",
    createdAt: new Date("2023-01-12T10:00:00Z").toISOString(),
    unit: "IBS"
  },
  {
    id: "PROF-SKP-4",
    title: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
    purpose: "Mengurangi angka kejadian pasien jatuh.",
    definition: "Persentase kepatuhan pelaksanaan asesmen dan intervensi risiko jatuh pada pasien.",
    implication: "Meningkatkan keselamatan pasien dan mengurangi cedera.",
    calculationMethod: "percentage",
    numerator: "Jumlah pasien berisiko yang mendapatkan intervensi sesuai standar",
    denominator: "Jumlah total pasien yang diskrining berisiko jatuh",
    target: 100,
    targetUnit: "%",
    inclusionCriteria: "Semua pasien rawat inap.",
    exclusionCriteria: "Pasien di ICU/PICU/NICU.",
    dataRecording: "Formulir asesmen risiko jatuh.",
    unitRecap: "Direkap oleh kepala ruangan.",
    analysisReporting: "Dianalisis oleh Komite Keselamatan Pasien.",
    area: "Rawat Inap",
    pic: "Kepala Ruangan",
    status: 'Disetujui',
    createdBy: "user-1",
    createdAt: new Date("2023-01-13T10:00:00Z").toISOString(),
    unit: "RANAP"
  },
];


const initialSubmittedIndicators: SubmittedIndicator[] = [
  {
    id: "SUB-SKP-1",
    profileId: "PROF-SKP-1",
    name: "Kepatuhan Identifikasi Pasien",
    category: "IMP-RS",
    description: "Persentase kepatuhan petugas dalam melakukan identifikasi pasien menggunakan minimal dua identitas (nama, tanggal lahir) sebelum tindakan.",
    unit: "IGD",
    frequency: "Bulanan",
    status: "Diverifikasi",
    submissionDate: new Date("2023-02-01T10:00:00Z").toISOString(),
    standard: 100,
    standardUnit: "%",
    submittedById: "user-5"
  },
  {
    id: "SUB-SKP-2",
    profileId: "PROF-SKP-2",
    name: "Kepatuhan Hand Hygiene",
    category: "INM",
    description: "Persentase kepatuhan petugas melakukan kebersihan tangan sesuai 5 momen WHO.",
    unit: "PPI",
    frequency: "Bulanan",
    status: "Diverifikasi",
    submissionDate: new Date("2023-02-02T10:00:00Z").toISOString(),
    standard: 85,
    standardUnit: "%",
    submittedById: "user-2"
  },
  {
    id: "SUB-SKP-3",
    profileId: "PROF-SKP-3",
    name: "Kepatuhan Penandaan Area Operasi (Site Marking)",
    category: "IMP-RS",
    description: "Persentase pasien operasi yang mendapatkan penandaan lokasi operasi dengan benar oleh dokter bedah.",
    unit: "IBS",
    frequency: "Bulanan",
    status: "Diverifikasi",
    submissionDate: new Date("2023-02-03T10:00:00Z").toISOString(),
    standard: 100,
    standardUnit: "%",
    submittedById: "user-1"
  },
  {
    id: "SUB-SKP-4",
    profileId: "PROF-SKP-4",
    name: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
    category: "IMPU",
    description: "Persentase kepatuhan pelaksanaan asesmen dan intervensi risiko jatuh pada pasien.",
    unit: "RANAP",
    frequency: "Bulanan",
    status: "Diverifikasi",
    submissionDate: new Date("2023-02-04T10:00:00Z").toISOString(),
    standard: 100,
    standardUnit: "%",
    submittedById: "user-3"
  }
];



type IndicatorState = {
  profiles: IndicatorProfile[]
  addProfile: (profile: Omit<IndicatorProfile, "id" | "createdAt">) => Promise<string>
  updateProfile: (id: string, data: Partial<Omit<IndicatorProfile, "id" | "createdAt">>) => Promise<void>
  removeProfile: (id: string) => Promise<void>

  indicators: Indicator[]
  submittedIndicators: SubmittedIndicator[]
  fetchIndicators: () => Promise<void>
  fetchSubmittedIndicators: () => Promise<void>
  addIndicator: (
    indicator: Omit<Indicator, "id" | "ratio" | "status">
  ) => Promise<string>
  updateIndicator: (
    id: string,
    data: Partial<Omit<Indicator, "id" | "ratio" | "status">>
  ) => Promise<void>
  removeIndicator: (id: string) => Promise<void>
  submitIndicator: (
    indicator: Omit<SubmittedIndicator, "id" | "submissionDate">,
    sendNotificationCallback?: () => void
  ) => Promise<string>
  updateSubmittedIndicatorStatus: (
    id: string,
    status: SubmittedIndicator["status"],
    reason?: string
  ) => Promise<void>
  updateSubmittedIndicator: (
    id: string,
    data: Partial<Omit<SubmittedIndicator, "id" | "submissionDate">>
  ) => Promise<void>
  removeSubmittedIndicator: (id: string) => Promise<void>
}

export const useIndicatorStore = create<IndicatorState>((set, get) => ({
  profiles: initialProfiles,
  addProfile: async (profileData) => {
    const newId = `PROF-${Date.now()}`;
    const newProfile: IndicatorProfile = {
      ...profileData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      profiles: [newProfile, ...state.profiles].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }));
    return newId;
  },
  updateProfile: async (id, data) => {
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...data } as IndicatorProfile : p)),
    }));
  },
  removeProfile: async (id) => {
    set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) }));
  },


  indicators: [],
  submittedIndicators: initialSubmittedIndicators,

  fetchIndicators: async () => {
    // No-op
  },

  fetchSubmittedIndicators: async () => {
    // No-op
  },

  addIndicator: async (indicator) => {
    const newId = `IND-${Date.now()}`
    const base = { ...indicator, id: newId }
    const newIndicator: Indicator = {
      ...base,
      ratio: calculateRatio(base),
      status: calculateStatus(base),
    }
    set((state) => ({ indicators: [newIndicator, ...state.indicators].sort((a,b) => new Date(b.period).getTime() - new Date(a.period).getTime()) }))
    return newId
  },

  updateIndicator: async (id, data) => {
    set((state) => ({
      indicators: state.indicators.map((indicator) => {
        if (indicator.id === id) {
          const updated = { ...indicator, ...data }
          return {
            ...updated,
            ratio: calculateRatio(updated),
            status: calculateStatus(updated),
          }
        }
        return indicator
      }),
    }))
  },

  removeIndicator: async (id) => {
    set((state) => ({ indicators: state.indicators.filter((i) => i.id !== id) }))
  },

  submitIndicator: async (indicator, sendNotificationCallback) => {
    const newId = `SUB-${Date.now()}`;
    const newSubmission: SubmittedIndicator = {
      ...indicator,
      id: newId,
      submissionDate: new Date().toISOString(),
    }
    set((state) => ({
      submittedIndicators: [newSubmission, ...state.submittedIndicators].sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()),
    }))
    if (sendNotificationCallback) sendNotificationCallback()
    return newId;
  },

  updateSubmittedIndicatorStatus: async (id, status, reason) => {
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) => {
        if (indicator.id === id) {
          const updated: SubmittedIndicator = { ...indicator, status }
          if (status === "Ditolak" && reason) {
            updated.rejectionReason = reason
          } else {
            delete updated.rejectionReason
          }
          return updated
        }
        return indicator
      }),
    }))
  },

  updateSubmittedIndicator: async (id, data) => {
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) =>
        indicator.id === id ? { ...indicator, ...data } as SubmittedIndicator : indicator
      ),
    }))
  },

  removeSubmittedIndicator: async (id) => {
    set((state) => ({
      submittedIndicators: state.submittedIndicators.filter((i) => i.id !== id),
    }))
  },
}))
