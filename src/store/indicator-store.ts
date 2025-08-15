
"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React, { createContext, useContext, useRef } from 'react';
import { calculateRatio, calculateStatus } from '../lib/indicator-utils';

export type IndicatorCategory = 'INM' | 'IMP_RS' | 'IMPU' | 'SPM';

export type SubmittedIndicator = {
  id: string;
  name: string;
  category: IndicatorCategory;
  unit: string;
  frequency: 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan';
  submissionDate: string;
  description: string;
  standard: number;
  standardUnit: '%' | 'menit';
  status: 'Menunggu Persetujuan' | 'Diverifikasi' | 'Ditolak';
  rejectionReason?: string;
}

export type Indicator = {
  id: string;
  indicator: string;
  category: IndicatorCategory;
  unit: string;
  period: string; // YYYY-MM-DD
  frequency: 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan';
  numerator: number;
  denominator: number;
  ratio: string;
  standard: number;
  standardUnit: '%' | 'menit';
  status: 'Memenuhi Standar' | 'Tidak Memenuhi Standar' | 'N/A';
  analysisNotes?: string;
  followUpPlan?: string;
};

type IndicatorState = {
  submittedIndicators: SubmittedIndicator[];
  indicators: Indicator[];
  submitIndicator: (data: Omit<SubmittedIndicator, 'id' | 'submissionDate' | 'status'>) => string;
  updateSubmittedIndicator: (id: string, data: Partial<Omit<SubmittedIndicator, 'id'>>) => void;
  updateSubmittedIndicatorStatus: (id: string, status: SubmittedIndicator['status'], rejectionReason?: string) => void;
  addIndicator: (data: Omit<Indicator, 'id' | 'ratio' | 'status'>) => string;
  updateIndicator: (id: string, data: Partial<Omit<Indicator, 'id'>>) => void;
  getIndicatorById: (id: string) => Indicator | undefined;
}

const initialSubmittedIndicators: SubmittedIndicator[] = [
    { id: 'sub-1', name: 'Kepatuhan Kebersihan Tangan', category: 'INM', unit: 'PPI', frequency: 'Bulanan', submissionDate: new Date().toISOString(), description: 'Persentase kepatuhan petugas dalam melakukan kebersihan tangan sesuai standar WHO.', standard: 85, standardUnit: '%', status: 'Diverifikasi' },
    { id: 'sub-2', name: 'Kepatuhan Penggunaan APD', category: 'INM', unit: 'PPI', frequency: 'Bulanan', submissionDate: new Date().toISOString(), description: 'Persentase kepatuhan petugas dalam menggunakan Alat Pelindung Diri (APD) sesuai indikasi.', standard: 100, standardUnit: '%', status: 'Diverifikasi' },
    { id: 'sub-3', name: 'Waktu Tunggu Rawat Jalan', category: 'INM', unit: 'RAJAL', frequency: 'Bulanan', submissionDate: new Date().toISOString(), description: 'Rata-rata waktu tunggu pasien rawat jalan mulai dari pendaftaran hingga mendapat pelayanan dokter.', standard: 60, standardUnit: 'menit', status: 'Ditolak', rejectionReason: 'Definisi operasional kurang jelas, harap diperbaiki.' },
    { id: 'sub-4', name: 'Angka Kejadian Pasien Jatuh', category: 'IMP_RS', unit: 'RANAP', frequency: 'Bulanan', submissionDate: new Date().toISOString(), description: 'Jumlah kejadian pasien jatuh di lingkungan rumah sakit per 1000 hari rawat.', standard: 0, standardUnit: '%', status: 'Diverifikasi' },
    { id: 'sub-5', name: 'Kecepatan Respon time Komplain', category: 'IMP_RS', unit: 'HUMAS', frequency: 'Bulanan', submissionDate: new Date().toISOString(), description: 'Waktu yang dibutuhkan untuk merespon komplain pelanggan.', standard: 90, standardUnit: '%', status: 'Menunggu Persetujuan' },
    { id: 'sub-6', name: 'Waktu Lapor Hasil Kritis Laboratorium', category: 'IMPU', unit: 'LABORATORIUM', frequency: 'Bulanan', submissionDate: new Date().toISOString(), description: 'Waktu yang dibutuhkan sejak hasil kritis keluar hingga dilaporkan ke DPJP.', standard: 30, standardUnit: 'menit', status: 'Diverifikasi' },
    { id: 'sub-7', name: 'Kepatuhan Identifikasi Pasien', category: 'IMPU', unit: 'IGD', frequency: 'Bulanan', submissionDate: new Date().toISOString(), description: 'Kepatuhan petugas IGD dalam melakukan identifikasi pasien sebelum tindakan.', standard: 100, standardUnit: '%', status: 'Diverifikasi' },
];

const generateInitialIndicatorData = (submissions: SubmittedIndicator[]): Indicator[] => {
    const data: Indicator[] = [];
    let dataIdCounter = 1;
    const today = new Date();
    const baseIndicatorsToSeed = submissions.filter(si => si.status === 'Diverifikasi');

    for (let i = 0; i < 6; i++) {
        const period = new Date(today.getFullYear(), today.getMonth() - i, 15);
        for (const baseIndicator of baseIndicatorsToSeed) {
            const isPercentage = baseIndicator.standardUnit === '%';
            const isTime = baseIndicator.standardUnit === 'menit';
            
            let numerator, denominator;

            if (isPercentage) {
                denominator = Math.floor(Math.random() * 50) + 50; 
                const randomFactor = (Math.random() - 0.1) * baseIndicator.standard; 
                numerator = Math.floor((denominator * (randomFactor + (Math.random() * 20))) / 100);
                numerator = Math.min(denominator, Math.max(0, numerator)); 
            } else if (isTime) {
                denominator = Math.floor(Math.random() * 20) + 10; 
                numerator = Math.floor(denominator * (baseIndicator.standard + (Math.random() * 20 - 10)));
            } else {
                denominator = 100;
                numerator = Math.floor(Math.random() * 101);
            }
            
            const indicatorData: Omit<Indicator, 'id' | 'ratio' | 'status'> = {
                indicator: baseIndicator.name,
                category: baseIndicator.category,
                unit: baseIndicator.unit,
                period: period.toISOString(),
                frequency: baseIndicator.frequency,
                numerator,
                denominator,
                standard: baseIndicator.standard,
                standardUnit: baseIndicator.standardUnit,
                analysisNotes: parseFloat(calculateRatio({numerator, denominator, standardUnit: baseIndicator.standardUnit} as any)) < baseIndicator.standard ? 'Perlu dilakukan investigasi lebih lanjut terkait penurunan capaian.' : 'Capaian bulan ini memenuhi standar yang ditetapkan.',
                followUpPlan: parseFloat(calculateRatio({numerator, denominator, standardUnit: baseIndicator.standardUnit} as any)) < baseIndicator.standard ? 'Akan diadakan re-sosialisasi SOP kepada staf terkait.' : ''
            };
            
            const ratio = calculateRatio(indicatorData as any);
            const status = calculateStatus(indicatorData as any);
            
            data.push({
                id: `data-${dataIdCounter++}`,
                ...indicatorData,
                ratio,
                status
            });
        }
    }
    return data;
}

const initialIndicators = generateInitialIndicatorData(initialSubmittedIndicators);


const createIndicatorStore = () => create<IndicatorState>()(
  persist(
    (set, get) => ({
      submittedIndicators: initialSubmittedIndicators,
      indicators: initialIndicators,
      submitIndicator: (data) => {
        const newId = `sub-${get().submittedIndicators.length + 1}`;
        const newSubmission = { 
            ...data, 
            id: newId, 
            submissionDate: new Date().toISOString(),
            status: 'Menunggu Persetujuan' as const 
        };
        set(state => ({ submittedIndicators: [newSubmission, ...state.submittedIndicators] }));
        return newId;
      },
      updateSubmittedIndicator: (id, data) => set(state => ({
        submittedIndicators: state.submittedIndicators.map(s => s.id === id ? { ...s, ...data } as SubmittedIndicator : s),
      })),
      updateSubmittedIndicatorStatus: (id, status, rejectionReason) => set(state => ({
        submittedIndicators: state.submittedIndicators.map(s => s.id === id ? { ...s, status, rejectionReason } : s),
      })),
      addIndicator: (data) => {
        const newId = `data-${get().indicators.length + 1}`;
        const ratio = calculateRatio(data as any);
        const status = calculateStatus(data as any);
        const newIndicator = { ...data, id: newId, ratio, status };
        set(state => ({ indicators: [newIndicator, ...state.indicators] }));
        return newId;
      },
      updateIndicator: (id, data) => set(state => ({
        indicators: state.indicators.map(i => {
            if (i.id === id) {
                const updatedData = { ...i, ...data };
                const ratio = calculateRatio(updatedData as any);
                const status = calculateStatus(updatedData as any);
                return { ...updatedData, ratio, status } as Indicator;
            }
            return i;
        })
      })),
      getIndicatorById: (id) => get().indicators.find(i => i.id === id),
    }),
    {
      name: 'indicator-storage',
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

const IndicatorStoreContext = createContext<ReturnType<typeof createIndicatorStore> | null>(null);

export const IndicatorStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createIndicatorStore>>();
  if (!storeRef.current) {
    storeRef.current = createIndicatorStore();
  }
  return (
    <IndicatorStoreContext.Provider value={storeRef.current}>
      {children}
    </IndicatorStoreContext.Provider>
  );
};

export const useIndicatorStore = (): IndicatorState => {
  const store = useContext(IndicatorStoreContext);
  if (!store) {
    throw new Error('useIndicatorStore must be used within an IndicatorStoreProvider');
  }
  return store();
};
