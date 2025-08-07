
import { create } from 'zustand'

export type IndicatorCategory = 'INM' | 'IMP-RS' | 'IPU';

export type SubmittedIndicator = {
  id: string;
  name: string;
  category: IndicatorCategory;
  description: string;
  unit: string;
  frequency: 'Harian' | 'Mingguan' | 'Bulanan' | '6 Bulanan';
  status: 'Menunggu Persetujuan' | 'Diverifikasi' | 'Ditolak';
  submissionDate: string;
  standard: number;
  standardUnit: '%' | 'menit';
  rejectionReason?: string;
}

export type Indicator = {
  id: string;
  indicator: string;
  category: IndicatorCategory;
  unit: string;
  period: string;
  numerator: number;
  denominator: number;
  standard: number;
  standardUnit: '%' | 'menit';
  notes?: string;
  ratio: string;
  status: 'Memenuhi Standar' | 'Tidak Memenuhi Standar' | 'N/A';
}

type IndicatorState = {
  indicators: Indicator[]
  submittedIndicators: SubmittedIndicator[]
  addIndicator: (indicator: Omit<Indicator, 'id' |'ratio' | 'status'>) => string
  updateIndicator: (id: string, data: Omit<Indicator, 'id' |'ratio' | 'status'>) => void
  submitIndicator: (indicator: Omit<SubmittedIndicator, 'id' | 'status' | 'submissionDate'>) => string
  updateSubmittedIndicatorStatus: (id: string, status: SubmittedIndicator['status'], reason?: string) => void
  updateSubmittedIndicator: (id: string, data: Partial<Omit<SubmittedIndicator, 'id' | 'status' | 'submissionDate'>>) => void
}

const initialSubmittedIndicators: SubmittedIndicator[] = [];

const initialIndicators: Indicator[] = [];

const calculateRatio = (indicator: Omit<Indicator, 'id' | 'ratio' | 'status'>): string => {
    if (indicator.standardUnit === "menit") {
        if (indicator.denominator === 0) return "0 min";
        const average = indicator.numerator / indicator.denominator;
        return `${average.toFixed(1)} min`
    }
    if (indicator.denominator === 0) return "0.0%"
    const ratio = (indicator.numerator / indicator.denominator) * 100;
    return `${ratio.toFixed(1)}%`
}

const calculateStatus = (indicator: Omit<Indicator, 'id' |'ratio' | 'status'>): Indicator['status'] => {
    let achievementValue: number;
    
    if (indicator.standardUnit === 'menit') {
        if (indicator.denominator === 0) return 'N/A';
        achievementValue = indicator.numerator / indicator.denominator;
        // Lower is better for wait times
        return achievementValue <= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
    } else {
        if (indicator.denominator === 0) return 'N/A';
        achievementValue = (indicator.numerator / indicator.denominator) * 100;
        // Higher is better for percentages
        return achievementValue >= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
    }
}


export const useIndicatorStore = create<IndicatorState>((set, get) => ({
  indicators: initialIndicators.map(i => ({
      ...i, 
      ratio: calculateRatio(i),
      status: calculateStatus(i)
  })),
  submittedIndicators: initialSubmittedIndicators,
  addIndicator: (indicator) => {
    const newId = `CAP-${String(get().indicators.length + 1).padStart(3, '0')}`;
    const newIndicator = {
        ...indicator, 
        id: newId,
        ratio: calculateRatio(indicator),
        status: calculateStatus(indicator)
    };
    set((state) => ({
      indicators: [ ...state.indicators, newIndicator ],
    }));
    return newId;
  },
  updateIndicator: (id, data) =>
    set((state) => ({
      indicators: state.indicators.map((indicator) => {
        if (indicator.id === id) {
          const updatedData = { ...indicator, ...data };
          return {
            ...updatedData,
            ratio: calculateRatio(updatedData),
            status: calculateStatus(updatedData),
          }
        }
        return indicator
      }),
    })),
  submitIndicator: (indicator) => {
    const newId = `IND-${String(get().submittedIndicators.length + 1).padStart(3, '0')}`;
    
    // Auto-verify INM and IMP-RS, but put IPU for approval
    const status = (indicator.category === 'INM' || indicator.category === 'IMP-RS') 
        ? 'Diverifikasi' 
        : 'Menunggu Persetujuan';

    const newSubmittedIndicator = {
        ...indicator,
        id: newId,
        status: status,
        submissionDate: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      submittedIndicators: [newSubmittedIndicator, ...state.submittedIndicators]
    }));
    return newId;
  },
  updateSubmittedIndicatorStatus: (id, status, reason) =>
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) => {
        if (indicator.id === id) {
          const updatedIndicator = { ...indicator, status };
          if (status === 'Ditolak' && reason) {
            updatedIndicator.rejectionReason = reason;
          } else if (status !== 'Ditolak') {
            delete updatedIndicator.rejectionReason;
          }
          return updatedIndicator;
        }
        return indicator;
      }),
    })),
  updateSubmittedIndicator: (id, data) =>
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) =>
        indicator.id === id ? { ...indicator, ...data } : indicator
      )
    }))
}))
