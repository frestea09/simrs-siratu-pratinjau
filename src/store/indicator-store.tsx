
"use client"

import { create } from "zustand"
import { calculateRatio, calculateStatus } from "@/lib/indicator-utils"
import React, { createContext, useContext, useRef } from "react"


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
  updatedAt: string
  unit: string
  locked?: boolean
  lockedReason?: string
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
  locked?: boolean;
  lockedReason?: string;
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
    updatedAt: new Date("2023-01-10T10:00:00Z").toISOString(),
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
    updatedAt: new Date("2023-01-11T10:00:00Z").toISOString(),
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
    updatedAt: new Date("2023-01-12T10:00:00Z").toISOString(),
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
    updatedAt: new Date("2023-01-13T10:00:00Z").toISOString(),
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



const sortProfiles = (profiles: IndicatorProfile[]) =>
  [...profiles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

const mergeProfiles = (
  current: IndicatorProfile[],
  incoming: IndicatorProfile[],
) => {
  const currentMap = new Map(current.map((profile) => [profile.id, profile]))

  const incomingIds = new Set(incoming.map((profile) => profile.id))

  const merged = incoming.map((profile) => {
    const existing = currentMap.get(profile.id)
    if (!existing) {
      return profile
    }

    const existingUpdatedAt = new Date(existing.updatedAt).getTime()
    const incomingUpdatedAt = new Date(profile.updatedAt).getTime()

    return existingUpdatedAt > incomingUpdatedAt ? existing : profile
  })

  const extras = current.filter((profile) => !incomingIds.has(profile.id))

  return sortProfiles([...merged, ...extras])
}

type IndicatorState = {
  profiles: IndicatorProfile[]
  fetchProfiles: () => Promise<void>
  addProfile: (
    profile: Omit<IndicatorProfile, "id" | "createdAt" | "updatedAt">
  ) => Promise<string>
  updateProfile: (
    id: string,
    data: Partial<Omit<IndicatorProfile, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>
  removeProfile: (id: string) => Promise<void>
  upsertProfileFromServer: (profile: IndicatorProfile) => void
  removeProfileFromServer: (id: string) => void

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
  upsertSubmittedIndicatorFromServer: (indicator: SubmittedIndicator) => void
  removeSubmittedIndicatorFromServer: (id: string) => void
}

const createIndicatorStore = () => create<IndicatorState>((set, get) => ({
  profiles: [],
  fetchProfiles: async () => {
    const res = await fetch('/api/profiles', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch profiles')
    const data: IndicatorProfile[] = await res.json()
    set((state) => ({ profiles: mergeProfiles(state.profiles, data) }))
  },
  addProfile: async (profileData) => {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    })
    if (!res.ok) {
      try {
        const err = await res.json()
        throw new Error(err?.error || 'Failed to create profile')
      } catch {
        throw new Error('Failed to create profile')
      }
    }
    const created: IndicatorProfile = await res.json()
    set((state) => {
      const existing = state.profiles.find((profile) => profile.id === created.id)
      if (existing) {
        const existingUpdatedAt = new Date(existing.updatedAt).getTime()
        const incomingUpdatedAt = new Date(created.updatedAt).getTime()
        if (existingUpdatedAt >= incomingUpdatedAt) {
          return state
        }
      }

      return { profiles: sortProfiles([created, ...state.profiles]) }
    })
    return created.id
  },
  updateProfile: async (id, data) => {
    const res = await fetch(`/api/profiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update profile')
    const updated: IndicatorProfile = await res.json()
    set((state) => ({
      profiles: sortProfiles(
        state.profiles.map((p) => (p.id === id ? updated : p))
      ),
    }))
  },
  removeProfile: async (id) => {
    const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      try {
        const err = await res.json()
        throw new Error(err?.error || 'Failed to delete profile')
      } catch {
        throw new Error('Failed to delete profile')
      }
    }
    set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) }))
  },
  upsertProfileFromServer: (profile) => {
    set((state) => {
      const existing = state.profiles.find((p) => p.id === profile.id)
      if (existing) {
        const existingUpdatedAt = new Date(existing.updatedAt).getTime()
        const incomingUpdatedAt = new Date(profile.updatedAt).getTime()
        if (incomingUpdatedAt < existingUpdatedAt) {
          return state
        }
        const updated = state.profiles.map((p) => (p.id === profile.id ? profile : p))
        return { profiles: sortProfiles(updated) }
      }

      return { profiles: sortProfiles([profile, ...state.profiles]) }
    })
  },
  removeProfileFromServer: (id) => {
    set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) }))
  },


  indicators: [],
  submittedIndicators: [],

  fetchIndicators: async () => {
    const res = await fetch('/api/indicators', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch indicators')
    const data: Indicator[] = await res.json()
    set({ indicators: data })
  },

  fetchSubmittedIndicators: async () => {
    const res = await fetch('/api/submitted-indicators', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch submitted indicators')
    const data: SubmittedIndicator[] = await res.json()
    set({ submittedIndicators: data })
  },

  addIndicator: async (indicator) => {
    const payload: any = {
      submissionId: (indicator as any).submissionId,
      period: indicator.period,
      numerator: indicator.numerator,
      denominator: indicator.denominator,
      analysisNotes: indicator.analysisNotes,
      followUpPlan: indicator.followUpPlan,
    }
    const res = await fetch('/api/indicators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      try { const err = await res.json(); throw new Error(err?.error || 'Failed to save indicator') } catch { throw new Error('Failed to save indicator') }
    }
    const created: Indicator = await res.json()
    set((state) => ({ indicators: [created, ...state.indicators].sort((a,b) => new Date(b.period).getTime() - new Date(a.period).getTime()) }))
    return created.id
  },

  updateIndicator: async (id, data) => {
    const res = await fetch(`/api/indicators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      try { const err = await res.json(); throw new Error(err?.error || 'Failed to update indicator') } catch { throw new Error('Failed to update indicator') }
    }
    const updated: Indicator = await res.json()
    set((state) => ({
      indicators: state.indicators.map((indicator) => (indicator.id === id ? updated : indicator)),
    }))
  },

  removeIndicator: async (id) => {
    const res = await fetch(`/api/indicators/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete indicator')
    set((state) => ({ indicators: state.indicators.filter((i) => i.id !== id) }))
  },

  submitIndicator: async (indicator, sendNotificationCallback) => {
    const res = await fetch('/api/submitted-indicators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indicator),
    })
    if (!res.ok) {
      try { const err = await res.json(); throw new Error(err?.error || 'Failed to submit indicator') } catch { throw new Error('Failed to submit indicator') }
    }
    const created: SubmittedIndicator = await res.json()
    set((state) => {
      const exists = state.submittedIndicators.some((item) => item.id === created.id)
      const next = exists
        ? state.submittedIndicators.map((item) => (item.id === created.id ? created : item))
        : [created, ...state.submittedIndicators]
      return {
        submittedIndicators: next.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()),
      }
    })
    if (sendNotificationCallback) sendNotificationCallback()
    return created.id
  },

  updateSubmittedIndicatorStatus: async (id, status, reason) => {
    const payload: any = { status }
    if (status === 'Ditolak') payload.rejectionReason = reason ?? ''
    const res = await fetch(`/api/submitted-indicators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to update submitted indicator status')
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) => {
        if (indicator.id === id) {
          const updated: SubmittedIndicator = { ...indicator, status }
          if (status === 'Ditolak') {
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
    const res = await fetch(`/api/submitted-indicators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update submitted indicator')
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) =>
        indicator.id === id ? { ...indicator, ...data } as SubmittedIndicator : indicator
      ),
    }))
  },

  removeSubmittedIndicator: async (id) => {
    const res = await fetch(`/api/submitted-indicators/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      try {
        const err = await res.json()
        throw new Error(err?.error || 'Failed to delete submitted indicator')
      } catch {
        throw new Error('Failed to delete submitted indicator')
      }
    }
    set((state) => ({
      submittedIndicators: state.submittedIndicators.filter((i) => i.id !== id),
    }))
  },

  upsertSubmittedIndicatorFromServer: (indicator) => {
    set((state) => {
      const existingIndex = state.submittedIndicators.findIndex((item) => item.id === indicator.id)
      if (existingIndex >= 0) {
        const updated = [...state.submittedIndicators]
        updated[existingIndex] = indicator
        return {
          submittedIndicators: updated.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()),
        }
      }
      return {
        submittedIndicators: [indicator, ...state.submittedIndicators].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()),
      }
    })
  },

  removeSubmittedIndicatorFromServer: (id) => {
    set((state) => ({
      submittedIndicators: state.submittedIndicators.filter((i) => i.id !== id),
    }))
  },
}))

const IndicatorStoreContext = createContext<ReturnType<typeof createIndicatorStore> | null>(null);

export const IndicatorStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createIndicatorStore>>();
  if (!storeRef.current) {
    storeRef.current = createIndicatorStore();
  }
  return (
    <IndicatorStoreContext.Provider value={storeRef.current}>
      {children}
    </IndicatorStoreContext.Provider>
  );
};

export const useIndicatorStore = (): IndicatorState => {
  const store = useContext(IndicatorStoreContext);
  if (!store) {
    throw new Error('useIndicatorStore must be used within a IndicatorStoreProvider');
  }
  return store(state => state);
};
