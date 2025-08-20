"use client"

import { create } from "zustand"
import { calculateRatio, calculateStatus } from "@/lib/indicator-utils"

export type IndicatorCategory = "INM" | "IMP-RS" | "IMPU" | "SPM"
export type IndicatorFrequency = "Harian" | "Mingguan" | "Bulanan" | "Tahunan"

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
}

export type Indicator = {
  id: string
  indicator: string
  category: IndicatorCategory
  unit: string
  period: string
  frequency: IndicatorFrequency
  numerator: number
  denominator: number
  standard: number
  standardUnit: "%" | "menit"
  analysisNotes?: string
  followUpPlan?: string
  ratio: string
  status: "Memenuhi Standar" | "Tidak Memenuhi Standar" | "N/A"
}

type IndicatorState = {
  indicators: Indicator[]
  submittedIndicators: SubmittedIndicator[]
  fetchIndicators: () => Promise<void>
  fetchSubmittedIndicators: () => Promise<void>
  addIndicator: (
    indicator: Omit<Indicator, "id" | "ratio" | "status"> & { submissionId: string }
  ) => Promise<string>
  updateIndicator: (
    id: string,
    data: Partial<Omit<Indicator, "id" | "ratio" | "status">>
  ) => Promise<void>
  removeIndicator: (id: string) => Promise<void>
  submitIndicator: (
    indicator: Omit<SubmittedIndicator, "id" | "status" | "submissionDate"> & {
      submittedById: string
    },
    sendNotificationCallback?: () => void
  ) => Promise<string>
  updateSubmittedIndicatorStatus: (
    id: string,
    status: SubmittedIndicator["status"],
    reason?: string
  ) => Promise<void>
  updateSubmittedIndicator: (
    id: string,
    data: Partial<Omit<SubmittedIndicator, "id" | "status" | "submissionDate">>
  ) => Promise<void>
  removeSubmittedIndicator: (id: string) => Promise<void>
}

const categoryToApi = (c: IndicatorCategory) => (c === "IMP-RS" ? "IMP_RS" : c)
const categoryFromApi = (c: string): IndicatorCategory =>
  (c === "IMP_RS" ? "IMP-RS" : c) as IndicatorCategory
const statusToApi = (s: SubmittedIndicator["status"]) =>
  s === "Menunggu Persetujuan" ? "Menunggu_Persetujuan" : s
const statusFromApi = (s: string): SubmittedIndicator["status"] =>
  s === "Menunggu_Persetujuan" ? "Menunggu Persetujuan" : (s as any)
const unitToApi = (u: "%" | "menit") => (u === "%" ? "persen" : "menit")
const unitFromApi = (u: string): "%" | "menit" => (u === "persen" ? "%" : "menit")

export const useIndicatorStore = create<IndicatorState>((set, get) => ({
  indicators: [],
  submittedIndicators: [],

  fetchIndicators: async () => {
    const res = await fetch("/api/indicators")
    if (!res.ok) return
    const data = await res.json()
    const indicators: Indicator[] = data.indicators.map((ind: any) => {
      const base = {
        id: ind.id,
        indicator: ind.submission.name,
        category: categoryFromApi(ind.submission.category),
        unit: ind.submission.unit,
        period: ind.period.split("T")[0],
        frequency: ind.submission.frequency,
        numerator: ind.numerator,
        denominator: ind.denominator,
        standard: ind.submission.standard,
        standardUnit: unitFromApi(ind.submission.standardUnit),
        analysisNotes: ind.analysisNotes ?? undefined,
        followUpPlan: ind.followUpPlan ?? undefined,
      }
      return {
        ...base,
        ratio: calculateRatio(base),
        status: calculateStatus(base),
      }
    })
    set({ indicators })
  },

  fetchSubmittedIndicators: async () => {
    const res = await fetch("/api/indicator-submissions")
    if (!res.ok) return
    const data = await res.json()
    const submissions: SubmittedIndicator[] = data.submissions.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: categoryFromApi(s.category),
      description: s.description,
      unit: s.unit,
      frequency: s.frequency,
      status: statusFromApi(s.status),
      submissionDate: s.submissionDate,
      standard: s.standard,
      standardUnit: unitFromApi(s.standardUnit),
      rejectionReason: s.rejectionReason ?? undefined,
    }))
    set({ submittedIndicators: submissions })
  },

  addIndicator: async (indicator) => {
    const payload = {
      submissionId: indicator.submissionId,
      period: indicator.period,
      numerator: indicator.numerator,
      denominator: indicator.denominator,
      analysisNotes: indicator.analysisNotes,
      followUpPlan: indicator.followUpPlan,
    }
    const res = await fetch("/api/indicators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Failed to add indicator")
    const data = await res.json()
    const base = { ...indicator, id: data.indicator.id }
    const newIndicator: Indicator = {
      ...base,
      ratio: calculateRatio(base),
      status: calculateStatus(base),
    }
    set((state) => ({ indicators: [...state.indicators, newIndicator] }))
    return data.indicator.id
  },

  updateIndicator: async (id, data) => {
    await fetch(`/api/indicators/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
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
    await fetch(`/api/indicators/${id}`, { method: "DELETE" })
    set((state) => ({ indicators: state.indicators.filter((i) => i.id !== id) }))
  },

  submitIndicator: async (indicator, sendNotificationCallback) => {
    const autoStatus: SubmittedIndicator["status"] = [
      "INM",
      "IMP-RS",
      "SPM",
    ].includes(indicator.category)
      ? "Diverifikasi"
      : "Menunggu Persetujuan"
    const payload = {
      ...indicator,
      category: categoryToApi(indicator.category),
      standardUnit: unitToApi(indicator.standardUnit),
      status: statusToApi(autoStatus),
    }
    const res = await fetch("/api/indicator-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Failed to submit indicator")
    const data = await res.json()
    const submission: SubmittedIndicator = {
      id: data.submission.id,
      name: data.submission.name,
      category: indicator.category,
      description: indicator.description,
      unit: indicator.unit,
      frequency: indicator.frequency,
      status: autoStatus,
      submissionDate: data.submission.submissionDate,
      standard: indicator.standard,
      standardUnit: indicator.standardUnit,
    }
    set((state) => ({
      submittedIndicators: [submission, ...state.submittedIndicators],
    }))
    if (sendNotificationCallback) sendNotificationCallback()
    return submission.id
  },

  updateSubmittedIndicatorStatus: async (id, status, reason) => {
    const payload: any = { status: statusToApi(status) }
    if (status === "Ditolak" && reason) payload.rejectionReason = reason
    await fetch(`/api/indicator-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
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
    const payload: any = { ...data }
    if (data.category) payload.category = categoryToApi(data.category)
    if (data.standardUnit) payload.standardUnit = unitToApi(data.standardUnit)
    await fetch(`/api/indicator-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) =>
        indicator.id === id ? { ...indicator, ...data } : indicator
      ),
    }))
  },

  removeSubmittedIndicator: async (id) => {
    await fetch(`/api/indicator-submissions/${id}`, { method: "DELETE" })
    set((state) => ({
      submittedIndicators: state.submittedIndicators.filter((i) => i.id !== id),
    }))
  },
}))

