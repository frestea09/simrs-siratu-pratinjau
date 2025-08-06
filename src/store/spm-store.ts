
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
  addSpmIndicator: (indicator: Omit<SpmIndicator, 'id'>) => string;
  updateSpmIndicator: (id: string, indicator: Omit<SpmIndicator, 'id'>) => void;
}

const initialSpmData: SpmIndicator[] = [];


export const useSpmStore = create<SpmState>((set, get) => ({
  spmIndicators: initialSpmData,
  addSpmIndicator: (indicator) => {
    const newId = `SPM-${String(get().spmIndicators.length + 1).padStart(3, '0')}`;
    const newIndicator = { ...indicator, id: newId };
    set((state) => ({
        spmIndicators: [newIndicator, ...state.spmIndicators],
    }));
    return newId;
  },
  updateSpmIndicator: (id, indicatorData) => set((state) => ({
    spmIndicators: state.spmIndicators.map(spm => {
        if (spm.id === id) {
            return {
                ...spm,
                ...indicatorData
            }
        }
        return spm;
    })
  }))
}))
