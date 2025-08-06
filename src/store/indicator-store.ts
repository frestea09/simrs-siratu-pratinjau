import { create } from 'zustand'

export type Indicator = {
  indicator: string
  period: string
  numerator: number
  denominator: number
  ratio: string
}

type IndicatorState = {
  indicators: Indicator[]
  addIndicator: (indicator: Omit<Indicator, 'ratio'>) => void
}

const initialIndicators: Indicator[] = [
  { indicator: "Kepatuhan Kebersihan Tangan", period: "2023-06", numerator: 980, denominator: 1000, ratio: "98.0%" },
  { indicator: "Ketepatan Identifikasi Pasien", period: "2023-06", numerator: 495, denominator: 500, ratio: "99.0%" },
  { indicator: "Waktu Tunggu Rawat Jalan", period: "2023-06", numerator: 45, denominator: 1, ratio: "45 min" },
  { indicator: "Kepatuhan Kebersihan Tangan", period: "2023-05", numerator: 950, denominator: 1000, ratio: "95.0%" },
];

const calculateRatio = (indicator: Omit<Indicator, 'ratio'>): string => {
    if (indicator.indicator === "Waktu Tunggu Rawat Jalan") {
        return `${indicator.numerator} min`
    }
    if (indicator.denominator === 0) return "0.0%"
    return `${((indicator.numerator / indicator.denominator) * 100).toFixed(1)}%`
}

export const useIndicatorStore = create<IndicatorState>((set) => ({
  indicators: initialIndicators,
  addIndicator: (indicator) =>
    set((state) => ({
      indicators: [
          ...state.indicators,
          {...indicator, ratio: calculateRatio(indicator)}
      ],
    })),
}))
