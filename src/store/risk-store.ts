
"use client"

import { create } from 'zustand'

export type RiskSource = "Laporan Insiden" | "Komplain" | "Survey/Ronde" | "Rapat/Brainstorming" | "Investigasi" | "Litigasi" | "External Requirement";
export type RiskCategory = "Klinis" | "Non-Klinis" | "Operasional" | "Finansial" | "Reputasi";
export type RiskLevel = "Rendah" | "Moderat" | "Tinggi" | "Ekstrem";
export type RiskEvaluation = "Mitigasi" | "Transfer" | "Diterima" | "Dihindari";
export type RiskStatus = "Open" | "In Progress" | "Closed";


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
  // Evaluation
  evaluation: RiskEvaluation
  actionPlan: string
  dueDate?: string
  pic?: string // Penanggung Jawab
  status: RiskStatus
  // Residual Risk
  residualConsequence?: number
  residualLikelihood?: number
  residualRiskScore?: number
  residualRiskLevel?: RiskLevel
}

type RiskState = {
  risks: Risk[]
  addRisk: (risk: Omit<Risk, 'id' | 'submissionDate' | 'riskScore' | 'riskLevel' | 'ranking' | 'status'>) => string
  updateRisk: (id: string, risk: Partial<Omit<Risk, 'id' | 'submissionDate'>>) => void
  removeRisk: (id: string) => void
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
        ranking: 6, // 12 / 2
        evaluation: "Mitigasi",
        actionPlan: "Membuat SOP baru tentang kewajiban menaikkan pengaman brankar setiap saat.",
        dueDate: "2023-11-30",
        pic: "Deka (Kepala Unit)",
        status: "In Progress"
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
        ranking: 1.5, // 6 / 4
        evaluation: "Mitigasi",
        actionPlan: "Menerapkan sistem double check dan konfirmasi tanggal lahir pasien sebelum menyerahkan obat.",
        dueDate: "2023-12-15",
        pic: "Admin Sistem",
        status: "Open"
    }
];

export const useRiskStore = create<RiskState>((set, get) => ({
  risks: initialRisks.map(r => {
      const score = r.consequence * r.likelihood;
      return {
          ...r,
          riskScore: score,
          riskLevel: getRiskLevel(score),
          ranking: score / r.controllability
      }
  }).sort((a,b) => b.ranking - a.ranking),
  addRisk: (risk) => {
    const newId = `RISK-${String(get().risks.length + 1).padStart(3, '0')}`;
    const riskScore = risk.consequence * risk.likelihood;
    const newRisk: Risk = {
        ...(risk as Omit<Risk, 'id' | 'submissionDate' | 'riskScore' | 'riskLevel' | 'ranking' | 'status'>),
        id: newId,
        riskScore,
        riskLevel: getRiskLevel(riskScore),
        ranking: riskScore / risk.controllability,
        submissionDate: new Date().toISOString(),
        status: 'Open'
    };
    set((state) => ({
      risks: [newRisk, ...state.risks].sort((a,b) => b.ranking - a.ranking),
    }));
    return newId;
  },
  updateRisk: (id, riskData) => set((state) => ({
      risks: state.risks.map(r => {
        if (r.id === id) {
            const updatedRisk = { ...r, ...riskData };
            // Recalculate score and level if consequence or likelihood changes
            if (riskData.consequence || riskData.likelihood || riskData.controllability) {
                const score = updatedRisk.consequence * updatedRisk.likelihood;
                updatedRisk.riskScore = score;
                updatedRisk.riskLevel = getRiskLevel(score);
                updatedRisk.ranking = score / updatedRisk.controllability;
            }
             // Recalculate residual score and level
            if (updatedRisk.residualConsequence && updatedRisk.residualLikelihood) {
                const residualScore = updatedRisk.residualConsequence * updatedRisk.residualLikelihood;
                updatedRisk.residualRiskScore = residualScore;
                updatedRisk.residualRiskLevel = getRiskLevel(residualScore);
            } else {
                delete updatedRisk.residualRiskScore;
                delete updatedRisk.residualRiskLevel;
            }
            return updatedRisk;
        }
        return r;
      }).sort((a,b) => b.ranking - a.ranking)
  })),
  removeRisk: (id: string) => set((state) => ({
      risks: state.risks.filter(r => r.id !== id)
  }))
}));
