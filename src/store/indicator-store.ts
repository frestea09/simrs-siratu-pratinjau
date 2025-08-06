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
}

const initialSubmittedIndicators: SubmittedIndicator[] = [
  { id: 'IND-001', name: 'Kepatuhan Kebersihan Tangan', description: 'Mengukur kepatuhan staf medis dalam mencuci tangan sesuai standar.', frequency: 'Bulanan', status: 'Diverifikasi', submissionDate: '2023-04-10' },
  { id: 'IND-002', name: 'Ketepatan Identifikasi Pasien', description: 'Memastikan pasien diidentifikasi dengan benar sebelum prosedur medis.', frequency: 'Bulanan', status: 'Diverifikasi', submissionDate: '2023-04-10' },
  { id: 'IND-003', name: 'Waktu Tunggu Rawat Jalan', description: 'Rata-rata waktu tunggu pasien di poli rawat jalan.', frequency: 'Harian', status: 'Diverifikasi', submissionDate: '2023-04-11' },
  { id: 'IND-004', name: 'Angka Kejadian Pasien Jatuh', description: 'Jumlah pasien jatuh selama perawatan di rumah sakit.', frequency: 'Bulanan', status: 'Menunggu Persetujuan', submissionDate: '2023-06-12' },
];

const initialIndicators: Indicator[] = [
  { indicator: "Kepatuhan Kebersihan Tangan", period: "2023-06", numerator: 980, denominator: 1000, standard: 100, ratio: "98.0%", status: 'Tidak Memenuhi Standar' },
  { indicator: "Ketepatan Identifikasi Pasien", period: "2023-06", numerator: 495, denominator: 500, standard: 100, ratio: "99.0%", status: 'Tidak Memenuhi Standar' },
  { indicator: "Waktu Tunggu Rawat Jalan", period: "2023-06", numerator: 45, denominator: 1, standard: 60, ratio: "45 min", status: 'Memenuhi Standar' },
  { indicator: "Kepatuhan Kebersihan Tangan", period: "2023-05", numerator: 950, denominator: 1000, standard: 90, ratio: "95.0%", status: 'Memenuhi Standar' },
];

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
        ...state.submittedIndicators,
        {
          ...indicator,
          id: `IND-${String(state.submittedIndicators.length + 1).padStart(3, '0')}`,
          status: 'Menunggu Persetujuan',
          submissionDate: new Date().toISOString().split('T')[0],
        }
      ]
    })),
  updateSubmittedIndicatorStatus: (id, status) =>
    set((state) => ({
      submittedIndicators: state.submittedIndicators.map((indicator) =>
        indicator.id === id ? { ...indicator, status } : indicator
      ),
    })),
}))

    