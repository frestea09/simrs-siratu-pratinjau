
"use client"

import { create } from "zustand"
import React, { createContext, useContext, useRef } from "react"

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
  createdAt: string
  unit: string
  source: RiskSource
  description: string
  cause: string
  category: RiskCategory
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
      | "createdAt"
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
        | "createdAt"
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

const createRiskStore = () => create<RiskState>((set) => ({
  risks: [],

  fetchRisks: async () => {
    // No-op
  },

  addRisk: async (risk) => {
    const newId = `RISK-${Date.now()}`
    const base = {
      ...risk,
      id: newId,
      createdAt: new Date().toISOString(),
    }
    const props = calculateRiskProperties(base)
    const newRisk: Risk = { ...base, ...props } as Risk;

    set((state) => ({
      risks: [newRisk, ...state.risks].sort((a, b) => b.riskScore - a.riskScore),
    }))
    return newId;
  },

  updateRisk: async (id, riskData) => {
    set((state) => ({
      risks: state.risks
        .map((r) => {
          if (r.id === id) {
            const updated = { ...r, ...riskData }
            const props = calculateRiskProperties(updated)
            return { ...updated, ...props } as Risk;
          }
          return r
        })
        .sort((a, b) => b.riskScore - a.riskScore),
    }))
  },

  removeRisk: async (id) => {
    set((state) => ({ risks: state.risks.filter((r) => r.id !== id) }))
  },
}))

const RiskStoreContext = createContext<ReturnType<typeof createRiskStore> | null>(null);

export const RiskStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const storeRef = useRef<ReturnType<typeof createRiskStore>>();
    if (!storeRef.current) {
        storeRef.current = createRiskStore();
    }
    return (
        <RiskStoreContext.Provider value={storeRef.current}>
            {children}
        </RiskStoreContext.Provider>
    );
};

export const useRiskStore = (): RiskState => {
    const store = useContext(RiskStoreContext);
    if (!store) {
        throw new Error('useRiskStore must be used within a RiskStoreProvider');
    }
    return store(state => state);
};
