
import { create } from 'zustand'

export type IndicatorCategory = 'INM' | 'IMP-RS' | 'IMPU' | 'SPM';
export type IndicatorFrequency = 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan';


export type SubmittedIndicator = {
  id: string;
  name: string;
  category: IndicatorCategory;
  description: string;
  unit: string;
  frequency: IndicatorFrequency;
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
  period: string; // YYYY-MM-DD for Harian/Mingguan, YYYY-MM for Bulanan
  frequency: IndicatorFrequency;
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
    
    const status = ['INM', 'IMP-RS', 'SPM'].includes(indicator.category)
        ? 'Diverifikasi'
        : 'Menunggu Persetujuan';

    const newSubmittedIndicator = {
        ...(indicator as SubmittedIndicator),
        id: newId,
        status: status,
        submissionDate: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      submittedIndicators: [newSubmittedIndicator, ...state.submittedIndicators]
    }));

    if(indicator.category === 'IMPU') {
         const notificationPayload = {
            title: 'Pengajuan Indikator Baru (IMPU)',
            description: `Indikator "${indicator.name}" dari unit ${indicator.unit} menunggu persetujuan.`,
            link: '/dashboard/indicators',
        };
        // Notify PJ Ruangan in the same unit
        addNotification({ ...notificationPayload, recipientUnit: indicator.unit, recipientRole: 'PJ Ruangan' });
        // Notify Kepala Unit/Instalasi in the same unit
        addNotification({ ...notificationPayload, recipientUnit: indicator.unit, recipientRole: 'Kepala Unit/Instalasi' });
        // Notify the central committee
        addNotification({ ...notificationPayload, recipientRole: 'Sub. Komite Peningkatan Mutu' });
    }


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

// Dummy function to avoid error, will be replaced by actual notification store logic
const addNotification = (payload: any) => {};
