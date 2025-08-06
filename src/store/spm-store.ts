import { create } from 'zustand'

export type SpmIndicator = {
  id: string;
  serviceType: string;
  indicator: string;
  target: string;
  achievement: string;
  notes?: string;
  reportingDate: string; // ISO date string
}

type SpmState = {
  spmIndicators: SpmIndicator[],
  addSpmIndicator: (indicator: Omit<SpmIndicator, 'id'>) => void;
}

const initialSpmData: SpmIndicator[] = [];


export const useSpmStore = create<SpmState>((set) => ({
  spmIndicators: initialSpmData,
  addSpmIndicator: (indicator) => set((state) => ({
    spmIndicators: [{ ...indicator, id: `SPM-${String(state.spmIndicators.length + 1).padStart(3, '0')}` }, ...state.spmIndicators],
  })),
}))
