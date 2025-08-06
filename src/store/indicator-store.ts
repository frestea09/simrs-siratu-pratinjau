
import { create } from 'zustand'

export type SubmittedIndicator = {
  id: string;
  name: string;
  description: string;
  unit: string;
  frequency: 'Harian' | 'Mingguan' | 'Bulanan' | '6 Bulanan';
  status: 'Menunggu Persetujuan' | 'Diverifikasi' | 'Ditolak';
  submissionDate: string;
}

export type Indicator = {
  id: string;
  indicator: string
  period: string
  numerator: number
  denominator: number
  standard: number // The standard (percentage or minutes)
  notes?: string
  ratio: string
  status: 'Memenuhi Standar' | 'Tidak Memenuhi Standar' | 'N/A'
}

type IndicatorState = {
  indicators: Indicator[]
  submittedIndicators: SubmittedIndicator[]
  addIndicator: (indicator: Omit<Indicator, 'id' |'ratio' | 'status'>) => string
  updateIndicator: (id: string, data: Omit<Indicator, 'id' |'ratio' | 'status'>) => void
  submitIndicator: (indicator: Omit<SubmittedIndicator, 'id' | 'status' | 'submissionDate'>) => string
  updateSubmittedIndicatorStatus: (id: string, status: SubmittedIndicator['status']) => void
  updateSubmittedIndicator: (id: string, data: Partial<Omit<SubmittedIndicator, 'id' | 'status' | 'submissionDate'>>) => void
}

const initialSubmittedIndicators: SubmittedIndicator[] = [];

const initialIndicators: Indicator[] = [];

const calculateRatio = (indicator: Omit<Indicator, 'id' | 'ratio' | 'status'>): string => {
    if (indicator.indicator === "Waktu Tunggu Rawat Jalan") {
        return `${indicator.numerator} min`
    }
    if (indicator.denominator === 0) return "0.0%"
    const ratio = (indicator.numerator / indicator.denominator) * 100;
    return `${ratio.toFixed(1)}%`
}

const calculateStatus = (indicator: Omit<Indicator, 'id' |'ratio' | 'status'>): Indicator['status'] => {
    if (indicator.indicator === "Waktu Tunggu Rawat Jalan") {
        // Lower is better for wait times
        return indicator.numerator <= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
    }
    
    if (indicator.denominator === 0) return 'N/A';
    
    const ratioValue = (indicator.numerator / indicator.denominator) * 100;
    
    // Higher is better for percentages
    return ratioValue >= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
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
          return {
            ...indicator,
            ...data,
            ratio: calculateRatio(data),
            status: calculateStatus(data),
          }
        }
        return indicator
      }),
    })),
  submitIndicator: (indicator) => {
    const newId = `IND-${String(get().submittedIndicators.length + 1).padStart(3, '0')}`;
    const newSubmittedIndicator = {
        ...indicator,
        id: newId,
        status: 'Menunggu Persetujuan' as const,
        submissionDate: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      submittedIndicators: [newSubmittedIndicator, ...state.submittedIndicators]
    }));
    return newId;
  },
  updateSubmittedIndicatorStatus: (id, status) =>
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) =>
        indicator.id === id ? { ...indicator, status } : indicator
      ),
    })),
  updateSubmittedIndicator: (id, data) =>
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) =>
        indicator.id === id ? { ...indicator, ...data } : indicator
      )
    }))
}))

    
