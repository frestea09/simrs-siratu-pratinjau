
"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React, { createContext, useContext, useRef } from 'react';

export type RiskSource = "Laporan Insiden" | "Komplain" | "Survey/Ronde" | "Rapat/Brainstorming" | "Investigasi" | "Litigasi" | "External Requirement";
export type RiskCategory = "Strategis" | "Operasional" | "Finansial" | "Compliance" | "Reputasi" | "Pelayanan Pasien" | "Bahaya Fisik" | "Bahaya Kimia" | "Bahaya Biologi" | "Bahaya Ergonomi" | "Bahaya Psikososial";
export type RiskLevel = "Rendah" | "Moderat" | "Tinggi" | "Ekstrem";
export type RiskEvaluation = "Mitigasi" | "Transfer" | "Diterima" | "Dihindari";
export type RiskStatus = "Open" | "In Progress" | "Closed";

export type Risk = {
  id: string;
  unit: string;
  source: RiskSource;
  description: string;
  cause: string;
  category: RiskCategory;
  
  consequence: number;
  likelihood: number;
  controllability: number;
  
  riskLevel: RiskLevel;
  riskScore: number;
  
  evaluation: RiskEvaluation;
  actionPlan: string;
  dueDate?: string;
  pic?: string;
  
  residualConsequence?: number;
  residualLikelihood?: number;
  residualRiskLevel?: RiskLevel;
  residualRiskScore?: number;
  
  reportNotes?: string;
  status: RiskStatus;
};

type RiskState = {
  risks: Risk[];
  addRisk: (data: Omit<Risk, 'id' | 'riskLevel' | 'riskScore'>) => void;
  updateRisk: (id: string, data: Partial<Omit<Risk, 'id'>>) => void;
  removeRisk: (id: string) => void;
}

const calculateRisk = (data: { consequence: number, likelihood: number, controllability: number, residualConsequence?: number, residualLikelihood?: number }) => {
    const cxl = data.consequence * data.likelihood;
    let riskLevel: RiskLevel;
    if (cxl >= 15) riskLevel = "Ekstrem";
    else if (cxl >= 9) riskLevel = "Tinggi";
    else if (cxl >= 4) riskLevel = "Moderat";
    else riskLevel = "Rendah";

    const riskScore = cxl / data.controllability;

    let residualRiskLevel: RiskLevel | undefined = undefined;
    let residualRiskScore: number | undefined = undefined;

    if (data.residualConsequence && data.residualLikelihood) {
        const residualCxL = data.residualConsequence * data.residualLikelihood;
        if (residualCxL >= 15) residualRiskLevel = "Ekstrem";
        else if (residualCxL >= 9) residualRiskLevel = "Tinggi";
        else if (residualCxL >= 4) residualRiskLevel = "Moderat";
        else residualRiskLevel = "Rendah";
        residualRiskScore = residualCxL;
    }

    return { riskLevel, riskScore: parseFloat(riskScore.toFixed(2)), residualRiskLevel, residualRiskScore };
}

const initialRisks: Risk[] = [
    { id: 'risk-1', unit: 'IT', source: 'Rapat/Brainstorming', description: 'Kegagalan sistem server utama SIM-RS', cause: 'Hardware sudah tua dan tidak ada redudansi.', category: 'Operasional', consequence: 5, likelihood: 2, controllability: 3, evaluation: 'Mitigasi', actionPlan: 'Pengadaan server baru dengan sistem high-availability', dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1).toISOString(), pic: 'Admin Sistem', status: 'In Progress', ...calculateRisk({ consequence: 5, likelihood: 2, controllability: 3 }) },
    { id: 'risk-2', unit: 'IGD', source: 'Laporan Insiden', description: 'Risiko pasien jatuh di area IGD', cause: 'Lantai licin dan kurangnya penanda.', category: 'Pelayanan Pasien', consequence: 3, likelihood: 4, controllability: 4, evaluation: 'Mitigasi', actionPlan: 'Pemasangan rambu lantai licin dan rubber mat di area basah.', dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(), pic: 'Deka (Kepala Unit)', status: 'Closed', residualConsequence: 2, residualLikelihood: 1, reportNotes: 'Rambu dan rubber mat sudah terpasang. Kejadian tidak terulang.', ...calculateRisk({ consequence: 3, likelihood: 4, controllability: 4, residualConsequence: 2, residualLikelihood: 1 }) },
];


const createRiskStore = () => create<RiskState>()(
  persist(
    (set, get) => ({
      risks: initialRisks,
      addRisk: (data) => {
        const newId = `risk-${get().risks.length + 1}`;
        const calculations = calculateRisk(data);
        const newRisk: Risk = { id: newId, ...data, ...calculations };
        set((state) => ({ risks: [...state.risks, newRisk].sort((a,b) => b.riskScore - a.riskScore) }));
      },
      updateRisk: (id, data) => set((state) => ({
        risks: state.risks.map(r => {
            if (r.id === id) {
                const updatedData = { ...r, ...data } as Risk;
                const calculations = calculateRisk(updatedData);
                return { ...updatedData, ...calculations };
            }
            return r;
        }).sort((a,b) => b.riskScore - a.riskScore),
      })),
      removeRisk: (id) => set((state) => ({
        risks: state.risks.filter(r => r.id !== id),
      })),
    }),
    {
      name: 'risk-storage',
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

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
  return store();
};
