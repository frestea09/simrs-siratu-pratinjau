
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
  submittedById?: string;
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
  indicators: [],
  submittedIndicators: [],

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
        indicator.id === id ? { ...indicator, ...data } : indicator
      ),
    }))
  },

  removeSubmittedIndicator: async (id) => {
    set((state) => ({
      submittedIndicators: state.submittedIndicators.filter((i) => i.id !== id),
    }))
  },
}))
