
"use client"

import { create } from 'zustand'

export type RiskSource = "Laporan Insiden" | "Komplain" | "Survey/Ronde" | "Rapat/Brainstorming" | "Investigasi" | "Litigasi" | "External Requirement";
export type RiskCategory = "Klinis" | "Non-Klinis" | "Operasional" | "Finansial" | "Reputasi";
export type RiskLevel = "Rendah" | "Moderat" | "Tinggi" | "Ekstrem";


export type Risk = {
  id: string
  unit: string
  source: RiskSource
  description: string
  cause: string
  category: RiskCategory
  submissionDate: string
  // Risk Analysis
  consequence: number
  likelihood: number
  controllability: number
  riskScore: number
  riskLevel: RiskLevel
  ranking: number
}

type RiskState = {
  risks: Risk[]
  addRisk: (risk: Omit<Risk, 'id' | 'submissionDate' | 'riskScore' | 'riskLevel' | 'ranking'>) => string
  updateRisk: (id: string, risk: Partial<Omit<Risk, 'id' | 'submissionDate'>>) => void
}

const getRiskLevel = (score: number): RiskLevel => {
    if (score <= 3) return "Rendah";
    if (score <= 6) return "Moderat";
    if (score <= 12) return "Tinggi";
    return "Ekstrem";
}

const initialRisks: Risk[] = [
    {
        id: "RISK-001",
        unit: "IGD",
        source: "Laporan Insiden",
        description: "Pasien jatuh dari brankar saat menunggu triase.",
        cause: "Pengaman sisi brankar tidak dinaikkan oleh petugas.",
        category: "Klinis",
        submissionDate: "2023-10-26",
        consequence: 4,
        likelihood: 3,
        controllability: 2,
        riskScore: 12,
        riskLevel: "Tinggi",
        ranking: 12,
    },
    {
        id: "RISK-002",
        unit: "FARMASI",
        source: "Komplain",
        description: "Salah memberikan obat kepada pasien rawat jalan.",
        cause: "Label obat tertukar karena nama pasien mirip (sound-alike).",
        category: "Klinis",
        submissionDate: "2023-11-05",
        consequence: 3,
        likelihood: 2,
        controllability: 4,
        riskScore: 6,
        riskLevel: "Moderat",
        ranking: 6,
    }
];

export const useRiskStore = create<RiskState>((set, get) => ({
  risks: initialRisks,
  addRisk: (risk) => {
    const newId = `RISK-${String(get().risks.length + 1).padStart(3, '0')}`;
    const riskScore = risk.consequence * risk.likelihood;
    const newRisk: Risk = {
        ...(risk as Omit<Risk, 'id' | 'submissionDate' | 'riskScore' | 'riskLevel' | 'ranking'>),
        id: newId,
        riskScore,
        riskLevel: getRiskLevel(riskScore),
        ranking: riskScore, // Default ranking to risk score
        submissionDate: new Date().toISOString(),
    };
    set((state) => ({
      risks: [newRisk, ...state.risks],
    }));
    return newId;
  },
  updateRisk: (id, riskData) => set((state) => ({
      risks: state.risks.map(r => {
        if (r.id === id) {
            const updatedRisk = { ...r, ...riskData };
            // Recalculate score and level if consequence or likelihood changes
            if (riskData.consequence || riskData.likelihood) {
                const score = updatedRisk.consequence * updatedRisk.likelihood;
                updatedRisk.riskScore = score;
                updatedRisk.riskLevel = getRiskLevel(score);
                updatedRisk.ranking = score; // Update ranking as well
            }
            return updatedRisk;
        }
        return r;
      })
  }))
}));
