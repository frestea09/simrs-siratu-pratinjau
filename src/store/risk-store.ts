"use client"

import { createWithEqualityFn } from "zustand/traditional"

export type RiskSource =
  | "Laporan Insiden"
  | "Komplain"
  | "Survey/Ronde"
  | "Rapat/Brainstorming"
  | "Investigasi"
  | "Litigasi"
  | "External Requirement"
export type RiskCategory =
  | "Strategis"
  | "Operasional"
  | "Finansial"
  | "Compliance"
  | "Reputasi"
  | "Pelayanan Pasien"
  | "Bahaya Fisik"
  | "Bahaya Kimia"
  | "Bahaya Biologi"
  | "Bahaya Ergonomi"
  | "Bahaya Psikososial"
export type RiskLevel = "Rendah" | "Moderat" | "Tinggi" | "Ekstrem"
export type RiskEvaluation = "Mitigasi" | "Transfer" | "Diterima" | "Dihindari"
export type RiskStatus = "Open" | "In Progress" | "Closed"

export type Risk = {
  id: string
  unit: string
  source: RiskSource
  description: string
  cause: string
  category: RiskCategory
  submissionDate: string
  consequence: number
  likelihood: number
  cxl: number
  riskLevel: RiskLevel
  controllability: number
  riskScore: number
  evaluation: RiskEvaluation
  actionPlan: string
  dueDate?: string
  pic?: string
  status: RiskStatus
  residualConsequence?: number
  residualLikelihood?: number
  residualRiskScore?: number
  residualRiskLevel?: RiskLevel
  reportNotes?: string
}

type RiskState = {
  risks: Risk[]
  fetchRisks: () => Promise<void>
  addRisk: (
    risk: Omit<
      Risk,
      | "id"
      | "submissionDate"
      | "cxl"
      | "riskLevel"
      | "riskScore"
      | "residualRiskScore"
      | "residualRiskLevel"
    >
  ) => Promise<string>
  updateRisk: (
    id: string,
    risk: Partial<
      Omit<
        Risk,
        | "id"
        | "submissionDate"
        | "cxl"
        | "riskLevel"
        | "riskScore"
        | "residualRiskScore"
        | "residualRiskLevel"
      >
    >
  ) => Promise<void>
  removeRisk: (id: string) => Promise<void>
}

const sourceToApi: Record<RiskSource, string> = {
  "Laporan Insiden": "Laporan_Insiden",
  Komplain: "Komplain",
  "Survey/Ronde": "Survey_Ronde",
  "Rapat/Brainstorming": "Rapat_Brainstorming",
  Investigasi: "Investigasi",
  Litigasi: "Litigasi",
  "External Requirement": "External_Requirement",
}
const sourceFromApi = Object.fromEntries(
  Object.entries(sourceToApi).map(([k, v]) => [v, k])
) as Record<string, RiskSource>

const categoryToApi: Record<RiskCategory, string> = {
  Strategis: "Strategis",
  Operasional: "Operasional",
  Finansial: "Finansial",
  Compliance: "Compliance",
  Reputasi: "Reputasi",
  "Pelayanan Pasien": "Pelayanan_Pasien",
  "Bahaya Fisik": "Bahaya_Fisik",
  "Bahaya Kimia": "Bahaya_Kimia",
  "Bahaya Biologi": "Bahaya_Biologi",
  "Bahaya Ergonomi": "Bahaya_Ergonomi",
  "Bahaya Psikososial": "Bahaya_Psikososial",
}
const categoryFromApi = Object.fromEntries(
  Object.entries(categoryToApi).map(([k, v]) => [v, k])
) as Record<string, RiskCategory>

const statusToApi: Record<RiskStatus, string> = {
  Open: "Open",
  "In Progress": "In_Progress",
  Closed: "Closed",
}
const statusFromApi = Object.fromEntries(
  Object.entries(statusToApi).map(([k, v]) => [v, k])
) as Record<string, RiskStatus>

const getRiskLevel = (cxl: number): RiskLevel => {
  if (cxl <= 3) return "Rendah"
  if (cxl <= 6) return "Moderat"
  if (cxl <= 12) return "Tinggi"
  return "Ekstrem"
}

const calculateRiskProperties = (risk: Partial<Risk>) => {
  const consequence = risk.consequence || 0
  const likelihood = risk.likelihood || 0
  const controllability = risk.controllability || 1

  const cxl = consequence * likelihood
  const riskLevel = getRiskLevel(cxl)
  const riskScore = cxl * controllability

  let residualRiskScore: number | undefined
  let residualRiskLevel: RiskLevel | undefined

  if (risk.residualConsequence && risk.residualLikelihood) {
    const residualCxL = risk.residualConsequence * risk.residualLikelihood
    residualRiskScore = residualCxL * controllability
    residualRiskLevel = getRiskLevel(residualCxL)
  }

  return { cxl, riskLevel, riskScore, residualRiskScore, residualRiskLevel }
}

export const useRiskStore = createWithEqualityFn<RiskState>()((set) => ({
  risks: [],

  fetchRisks: async () => {
    const res = await fetch("/api/risks")
    if (!res.ok) return
    const data = await res.json()
    const risks: Risk[] = data.risks.map((r: any) => {
      const base = {
        id: r.id,
        unit: r.unit,
        source: sourceFromApi[r.source],
        description: r.description,
        cause: r.cause,
        category: categoryFromApi[r.category],
        submissionDate: r.submissionDate,
        consequence: r.consequence,
        likelihood: r.likelihood,
        controllability: r.controllability,
        evaluation: r.evaluation,
        actionPlan: r.actionPlan,
        dueDate: r.dueDate || undefined,
        pic: r.pic?.name,
        status: statusFromApi[r.status],
        residualConsequence: r.residualConsequence || undefined,
        residualLikelihood: r.residualLikelihood || undefined,
        reportNotes: r.reportNotes || undefined,
      }
      const props = calculateRiskProperties(base)
      return { ...base, ...props }
    })
    set({ risks: risks.sort((a, b) => b.riskScore - a.riskScore) })
  },

  addRisk: async (risk) => {
    const payload = {
      unit: risk.unit,
      source: sourceToApi[risk.source],
      description: risk.description,
      cause: risk.cause,
      category: categoryToApi[risk.category],
      consequence: risk.consequence,
      likelihood: risk.likelihood,
      controllability: risk.controllability,
      evaluation: risk.evaluation,
      actionPlan: risk.actionPlan,
      dueDate: risk.dueDate,
      status: statusToApi[risk.status],
      residualConsequence: risk.residualConsequence,
      residualLikelihood: risk.residualLikelihood,
      reportNotes: risk.reportNotes,
    }
    const res = await fetch("/api/risks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Failed to add risk")
    const data = await res.json()
    const base = {
      ...risk,
      id: data.risk.id,
      submissionDate: data.risk.submissionDate,
    }
    const props = calculateRiskProperties(base)
    const newRisk: Risk = { ...base, ...props }
    set((state) => ({
      risks: [newRisk, ...state.risks].sort((a, b) => b.riskScore - a.riskScore),
    }))
    return data.risk.id
  },

  updateRisk: async (id, riskData) => {
    const payload: any = { ...riskData }
    if (riskData.source) payload.source = sourceToApi[riskData.source]
    if (riskData.category) payload.category = categoryToApi[riskData.category]
    if (riskData.status) payload.status = statusToApi[riskData.status]
    await fetch(`/api/risks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    set((state) => ({
      risks: state.risks
        .map((r) => {
          if (r.id === id) {
            const updated = { ...r, ...riskData }
            const props = calculateRiskProperties(updated)
            return { ...updated, ...props }
          }
          return r
        })
        .sort((a, b) => b.riskScore - a.riskScore),
    }))
  },

  removeRisk: async (id) => {
    await fetch(`/api/risks/${id}`, { method: "DELETE" })
    set((state) => ({ risks: state.risks.filter((r) => r.id !== id) }))
  },
}))

