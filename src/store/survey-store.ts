"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SurveyResponse = {
  id: string
  unit: string
  workDuration: string
  unitDuration: string
  weeklyHours: string
  directPatientContact: string
  incidentsReported: string
  safetyRating: string
  comments?: string
  submittedAt: string
}

type SurveyState = {
  responses: SurveyResponse[]
  addResponse: (data: Omit<SurveyResponse, "id" | "submittedAt">) => void
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      responses: [],
      addResponse: (data) =>
        set((state) => ({
          responses: [
            ...state.responses,
            {
              id: Date.now().toString(),
              submittedAt: new Date().toISOString(),
              ...data,
            },
          ],
        })),
    }),
    { name: "survey-store" }
  )
)
