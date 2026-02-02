"use client"

import { create } from "zustand"
import React, { createContext, useContext, useRef } from "react"

import type { UserRole } from "./user-store"

// --- Tipe Data ---

// Struktur untuk skor per dimensi survei
export type DimensionScore = {
  score: number
  positiveResponses: number
  neutralResponses: number
  negativeResponses: number
}

// Struktur utama untuk satu entri hasil survei
export type SurveyResult = {
  id: string
  submissionDate: string
  unit: string
  scores: Record<string, DimensionScore> // Kunci adalah ID dimensi
  totalScore: number
  positivePercentage: number
  neutralPercentage: number
  negativePercentage: number
  answers: Record<string, string>
  submittedById?: string
  submittedByName?: string
  submittedByRole?: UserRole
  locked?: boolean
  lockedReason?: string
}

// State untuk store Zustand
type SurveyState = {
  surveys: SurveyResult[]
  fetchSurveys: () => Promise<void>
  addSurvey: (survey: Omit<SurveyResult, "id" | "submissionDate">) => Promise<SurveyResult>
  removeSurvey: (id: string) => Promise<void>
  updateSurvey: (id: string, survey: Omit<SurveyResult, "id" | "submissionDate">) => Promise<void>
}

// --- Store Zustand ---

const createSurveyStore = () =>
  create<SurveyState>()((set) => ({
    surveys: [],

    fetchSurveys: async () => {
      const res = await fetch("/api/surveys", { cache: "no-store" })
      if (!res.ok) {
        throw new Error("Failed to fetch surveys")
      }
      const data: SurveyResult[] = await res.json()
      set({ surveys: data })
    },

    addSurvey: async (surveyData) => {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      })
      if (!res.ok) {
        try {
          const err = await res.json()
          throw new Error(err?.error || "Failed to save survey")
        } catch {
          throw new Error("Failed to save survey")
        }
      }
      const created: SurveyResult = await res.json()
      set((state) => ({
        surveys: [created, ...state.surveys],
      }))
      return created
    },

    removeSurvey: async (id) => {
      const res = await fetch(`/api/surveys/${id}`, { method: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to delete survey")
      }
      set((state) => ({
        surveys: state.surveys.filter((survey) => survey.id !== id),
      }))
    },

    updateSurvey: async (id, surveyData) => {
      const res = await fetch(`/api/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      })
      if (!res.ok) {
        try {
          const err = await res.json()
          throw new Error(err?.error || "Failed to update survey")
        } catch {
          throw new Error("Failed to update survey")
        }
      }
      const updated: SurveyResult = await res.json()
      set((state) => ({
        surveys: state.surveys.map((survey) => (survey.id === id ? updated : survey)),
      }))
    },
  }))

const SurveyStoreContext = createContext<ReturnType<typeof createSurveyStore> | null>(null)

export const SurveyStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createSurveyStore>>()
  if (!storeRef.current) {
    storeRef.current = createSurveyStore()
  }
  return (
    <SurveyStoreContext.Provider value={storeRef.current}>
      {children}
    </SurveyStoreContext.Provider>
  )
}

export const useSurveyStore = (): SurveyState => {
  const store = useContext(SurveyStoreContext)
  if (!store) {
    throw new Error("useSurveyStore must be used within a SurveyStoreProvider")
  }
  return store((state) => state)
}
