"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
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
  addSurvey: (survey: Omit<SurveyResult, "id" | "submissionDate">) => void
  removeSurvey: (id: string) => void
  updateSurvey: (id: string, survey: Omit<SurveyResult, "id" | "submissionDate">) => void
}

// --- Store Zustand ---

const createSurveyStore = () =>
  create<SurveyState>()(
    persist(
      (set) => ({
        surveys: [],

        addSurvey: (surveyData) => {
          const newSurvey: SurveyResult = {
            ...surveyData,
            id: `SURVEY-${Date.now()}`,
            submissionDate: new Date().toISOString(),
            locked: surveyData.locked ?? false,
            lockedReason: surveyData.lockedReason,
          }
          set((state) => ({
            surveys: [newSurvey, ...state.surveys],
          }))
        },

        removeSurvey: (id) => {
          set((state) => ({
            surveys: state.surveys.filter((survey) => survey.id !== id),
          }))
        },

        updateSurvey: (id, surveyData) => {
          set((state) => ({
            surveys: state.surveys.map((survey) => {
              if (survey.id !== id) return survey

              const updated: SurveyResult = {
                ...survey,
                ...surveyData,
                submissionDate: survey.submissionDate,
                locked: surveyData.locked ?? survey.locked,
                lockedReason:
                  surveyData.lockedReason === undefined
                    ? survey.lockedReason
                    : surveyData.lockedReason,
                submittedById:
                  surveyData.submittedById === undefined
                    ? survey.submittedById
                    : surveyData.submittedById,
                submittedByName:
                  surveyData.submittedByName === undefined
                    ? survey.submittedByName
                    : surveyData.submittedByName,
                submittedByRole:
                  surveyData.submittedByRole === undefined
                    ? survey.submittedByRole
                    : surveyData.submittedByRole,
              }

              return updated
            }),
          }))
        },
      }),
      {
        name: "survey-results-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  )

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
