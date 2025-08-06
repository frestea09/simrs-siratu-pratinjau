import { create } from 'zustand'

export type SubmittedIndicator = {
  id: string;
  name: string;
  description: string;
  frequency: 'Harian' | 'Mingguan' | 'Bulanan' | '6 Bulanan';
  status: 'Menunggu Persetujuan' | 'Diverifikasi' | 'Ditolak';
  submissionDate: string;
}

export type Indicator = {
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
  addIndicator: (indicator: Omit<Indicator, 'ratio' | 'status'>) => void
  submitIndicator: (indicator: Omit<SubmittedIndicator, 'id' | 'status' | 'submissionDate'>) => void
  updateSubmittedIndicatorStatus: (id: string, status: SubmittedIndicator['status']) => void
  updateSubmittedIndicator: (id: string, data: Partial<Omit<SubmittedIndicator, 'id' | 'status' | 'submissionDate'>>) => void
}

const initialSubmittedIndicators: SubmittedIndicator[] = [];

const initialIndicators: Indicator[] = [];

const calculateRatio = (indicator: Omit<Indicator, 'ratio' | 'status'>): string => {
    if (indicator.indicator === "Waktu Tunggu Rawat Jalan") {
        return `${indicator.numerator} min`
    }
    if (indicator.denominator === 0) return "0.0%"
    const ratio = (indicator.numerator / indicator.denominator) * 100;
    return `${ratio.toFixed(1)}%`
}

const calculateStatus = (indicator: Omit<Indicator, 'ratio' | 'status'>): Indicator['status'] => {
    if (indicator.indicator === "Waktu Tunggu Rawat Jalan") {
        // Lower is better for wait times
        return indicator.numerator <= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
    }
    
    if (indicator.denominator === 0) return 'N/A';
    
    const ratioValue = (indicator.numerator / indicator.denominator) * 100;
    
    // Higher is better for percentages
    return ratioValue >= indicator.standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
}


export const useIndicatorStore = create<IndicatorState>((set) => ({
  indicators: initialIndicators.map(i => ({
      ...i, 
      ratio: calculateRatio(i),
      status: calculateStatus(i)
  })),
  submittedIndicators: initialSubmittedIndicators,
  addIndicator: (indicator) =>
    set((state) => ({
      indicators: [
          ...state.indicators,
          {
              ...indicator, 
              ratio: calculateRatio(indicator),
              status: calculateStatus(indicator)
          }
      ],
    })),
  submitIndicator: (indicator) =>
    set((state) => ({
      submittedIndicators: [
        {
          ...indicator,
          id: `IND-${String(state.submittedIndicators.length + 1).padStart(3, '0')}`,
          status: 'Menunggu Persetujuan',
          submissionDate: new Date().toISOString().split('T')[0],
        },
        ...state.submittedIndicators
      ]
    })),
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
