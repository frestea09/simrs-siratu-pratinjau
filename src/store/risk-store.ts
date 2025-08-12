"use client"

import { create } from 'zustand'

export type RiskSource = "Laporan Insiden" | "Komplain" | "Survey/Ronde" | "Rapat/Brainstorming" | "Investigasi" | "Litigasi" | "External Requirement";
export type RiskCategory = "Klinis" | "Non-Klinis" | "Operasional" | "Finansial" | "Reputasi";


export type Risk = {
  id: string
  unit: string
  source: RiskSource
  description: string
  cause: string
  category: RiskCategory
  submissionDate: string
}

type RiskState = {
  risks: Risk[]
  addRisk: (risk: Omit<Risk, 'id' | 'submissionDate'>) => string
  updateRisk: (id: string, risk: Partial<Omit<Risk, 'id' | 'submissionDate'>>) => void
}

const initialRisks: Risk[] = [
    {
        id: "RISK-001",
        unit: "IGD",
        source: "Laporan Insiden",
        description: "Pasien jatuh dari brankar saat menunggu triase.",
        cause: "Pengaman sisi brankar tidak dinaikkan oleh petugas.",
        category: "Klinis",
        submissionDate: "2023-10-26"
    },
    {
        id: "RISK-002",
        unit: "FARMASI",
        source: "Komplain",
        description: "Salah memberikan obat kepada pasien rawat jalan.",
        cause: "Label obat tertukar karena nama pasien mirip (sound-alike).",
        category: "Klinis",
        submissionDate: "2023-11-05"
    }
];

export const useRiskStore = create<RiskState>((set, get) => ({
  risks: initialRisks,
  addRisk: (risk) => {
    const newId = `RISK-${String(get().risks.length + 1).padStart(3, '0')}`;
    const newRisk = {
        ...(risk as Omit<Risk, 'id' | 'submissionDate'>),
        id: newId,
        submissionDate: new Date().toISOString(),
    };
    set((state) => ({
      risks: [newRisk, ...state.risks],
    }));
    return newId;
  },
  updateRisk: (id, riskData) => set((state) => ({
      risks: state.risks.map(r => r.id === id ? { ...r, ...riskData } : r)
  }))
}));
