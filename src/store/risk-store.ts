
"use client"

import { create } from 'zustand'

export type RiskSource = "Laporan Insiden" | "Komplain" | "Survey/Ronde" | "Rapat/Brainstorming" | "Investigasi" | "Litigasi" | "External Requirement";
export type RiskCategory = "Strategis" | "Operasional" | "Finansial" | "Compliance" | "Reputasi" | "Pelayanan Pasien" | "Bahaya Fisik" | "Bahaya Kimia" | "Bahaya Biologi" | "Bahaya Ergonomi" | "Bahaya Psikososial";
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
  cxl: number // Consequence x Likelihood
  riskLevel: RiskLevel
  controllability: number
  riskScore: number
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
  reportNotes?: string;
}

type RiskState = {
  risks: Risk[]
  addRisk: (risk: Omit<Risk, 'id' | 'submissionDate' | 'cxl' | 'riskScore' | 'riskLevel' | 'status' >) => string
  updateRisk: (id: string, risk: Partial<Omit<Risk, 'id' | 'submissionDate'>>) => void
  removeRisk: (id: string) => void
}

const getRiskLevel = (cxlScore: number): RiskLevel => {
    if (cxlScore <= 3) return "Rendah";
    if (cxlScore <= 6) return "Moderat";
    if (cxlScore <= 12) return "Tinggi";
    return "Ekstrem";
}

const initialRisks: Risk[] = [
    {
        id: "RISK-001",
        unit: "IGD",
        source: "Laporan Insiden",
        description: "Pasien jatuh dari brankar saat menunggu triase.",
        cause: "Pengaman sisi brankar tidak dinaikkan oleh petugas.",
        category: "Pelayanan Pasien",
        submissionDate: "2023-10-26",
        consequence: 4,
        likelihood: 3,
        cxl: 12,
        riskLevel: "Tinggi",
        controllability: 4,
        riskScore: 48,
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
        category: "Pelayanan Pasien",
        submissionDate: "2023-11-05",
        consequence: 3,
        likelihood: 2,
        cxl: 6,
        riskLevel: "Moderat",
        controllability: 2,
        riskScore: 12,
        evaluation: "Mitigasi",
        actionPlan: "Menerapkan sistem double check dan konfirmasi tanggal lahir pasien sebelum menyerahkan obat.",
        dueDate: "2023-12-15",
        pic: "Admin Sistem",
        status: "Open"
    }
];

const calculateRiskProperties = (risk: Partial<Risk>) => {
    const consequence = risk.consequence || 0;
    const likelihood = risk.likelihood || 0;
    const controllability = risk.controllability || 1; 

    const cxl = consequence * likelihood;
    const riskLevel = getRiskLevel(cxl);
    const riskScore = cxl * controllability;
    
    let residualRiskScore: number | undefined;
    let residualRiskLevel: RiskLevel | undefined;

    if (risk.residualConsequence && risk.residualLikelihood) {
        const residualCxL = risk.residualConsequence * risk.residualLikelihood;
        residualRiskScore = residualCxL * controllability;
        residualRiskLevel = getRiskLevel(residualCxL);
    }
    
    return { cxl, riskLevel, riskScore, residualRiskScore, residualRiskLevel };
}


export const useRiskStore = create<RiskState>((set, get) => ({
  risks: initialRisks.map(r => {
      const { cxl, riskLevel, riskScore } = calculateRiskProperties(r);
      return {
          ...r,
          cxl,
          riskLevel,
          riskScore,
      }
  }).sort((a,b) => b.riskScore - a.riskScore),
  addRisk: (risk) => {
    const newId = `RISK-${String(get().risks.length + 1).padStart(3, '0')}`;
    const { cxl, riskLevel, riskScore } = calculateRiskProperties(risk);

    const newRisk: Risk = {
        ...(risk as Omit<Risk, 'id' | 'submissionDate' | 'cxl' | 'riskScore' | 'riskLevel' | 'status'>),
        id: newId,
        cxl,
        riskLevel,
        riskScore,
        submissionDate: new Date().toISOString(),
        status: 'Open'
    };
    set((state) => ({
      risks: [newRisk, ...state.risks].sort((a,b) => b.riskScore - a.riskScore),
    }));
    return newId;
  },
  updateRisk: (id, riskData) => set((state) => ({
      risks: state.risks.map(r => {
        if (r.id === id) {
            const updatedRisk = { ...r, ...riskData };
            const { cxl, riskLevel, riskScore, residualRiskScore, residualRiskLevel } = calculateRiskProperties(updatedRisk);
            
            updatedRisk.cxl = cxl;
            updatedRisk.riskLevel = riskLevel;
            updatedRisk.riskScore = riskScore;

            if (residualRiskScore !== undefined && residualRiskLevel !== undefined) {
                updatedRisk.residualRiskScore = residualRiskScore;
                updatedRisk.residualRiskLevel = residualRiskLevel;
            } else {
                delete updatedRisk.residualRiskScore;
                delete updatedRisk.residualRiskLevel;
            }
            return updatedRisk;
        }
        return r;
      }).sort((a,b) => b.riskScore - a.riskScore)
  })),
  removeRisk: (id: string) => set((state) => ({
      risks: state.risks.filter(r => r.id !== id)
  }))
}));
