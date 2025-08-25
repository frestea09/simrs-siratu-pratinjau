"use client"

import { create } from "zustand"

export type DimensionScore = {
  score: number
  positiveResponses: number
  neutralResponses: number
  negativeResponses: number
}

export type SurveyResult = {
  id: string
  submissionDate: string
  unit: string
  scores: Record<string, DimensionScore>
  totalScore: number
  positivePercentage: number
  neutralPercentage: number
  negativePercentage: number
  answers: Record<string, string>
}

type SurveyState = {
  surveys: SurveyResult[]
  fetchSurveys: () => Promise<void>
  addSurvey: (
    surveyData: Omit<SurveyResult, "id" | "submissionDate">
  ) => Promise<void>
  removeSurvey: (id: string) => Promise<void>
  updateSurvey: (
    id: string,
    surveyData: Omit<SurveyResult, "id" | "submissionDate">
  ) => Promise<void>
}

async function safeJson<T>(res: Response): Promise<T | null> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: [],
  fetchSurveys: async () => {
    if (get().surveys.length > 0) return
    const res = await fetch("/api/surveys")
    const data = (await safeJson<SurveyResult[]>(res)) ?? []
    set({ surveys: data })
  },
  addSurvey: async (surveyData) => {
    const res = await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(surveyData),
    })
    const survey = await safeJson<SurveyResult>(res)
    if (survey) {
      set((state) => ({ surveys: [survey, ...state.surveys] }))
    }
  },
  removeSurvey: async (id) => {
    await fetch(`/api/surveys/${id}`, { method: "DELETE" })
    set((state) => ({ surveys: state.surveys.filter((s) => s.id !== id) }))
  },
  updateSurvey: async (id, surveyData) => {
    const res = await fetch(`/api/surveys/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(surveyData),
    })
    const survey = await safeJson<SurveyResult>(res)
    if (survey) {
      set((state) => ({
        surveys: state.surveys.map((s) => (s.id === id ? survey : s)),
      }))
    }
  },
}))
