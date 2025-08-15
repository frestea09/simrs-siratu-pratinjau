
"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React, { createContext, useContext, useRef } from 'react';
import { calculateRatio, calculateStatus } from '../lib/indicator-utils';

export type IncidentStatus = 'Investigasi' | 'Selesai';
export type Incident = {
  id: string;
  date: string;
  type: 'KPC' | 'KNC' | 'KTC' | 'KTD' | 'Sentinel';
  severity: 'biru' | 'hijau' | 'kuning' | 'merah';
  status: IncidentStatus;
  
  // Patient Data
  patientName?: string;
  medicalRecordNumber?: string;
  careRoom?: string;
  ageGroup?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  payer?: string;
  entryDate?: string;
  entryTime?: string;

  // Incident Details
  incidentDate: string;
  incidentTime?: string;
  chronology?: string;
  incidentSubject?: string;
  incidentLocation?: string;
  relatedUnit?: string;

  // Follow-up
  firstAction?: string;
  firstActionBy?: string;
  patientImpact?: string;
  hasHappenedBefore?: 'Ya' | 'Tidak';
  
  // Analysis (by Committee)
  analysisNotes?: string;
  followUpPlan?: string;
};

type IncidentState = {
  incidents: Incident[];
  addIncident: (data: Omit<Incident, 'id' | 'date' | 'status'>) => string;
  updateIncident: (id: string, data: Partial<Omit<Incident, 'id'>>) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  getIncidentById: (id: string) => Incident | undefined;
}

const initialIncidents: Incident[] = [
    { id: 'inc-1', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), type: 'KNC', severity: 'biru', status: 'Investigasi', patientName: 'Budi Santoso', medicalRecordNumber: '123456', careRoom: 'RANAP', ageGroup: '>30 thn - 65 thn', gender: 'Laki-laki', payer: 'BPJS NON PBI', incidentDate: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(), incidentTime: '10:00', chronology: 'Pasien hampir terjatuh dari tempat tidur karena pagar pengaman tidak terpasang.', incidentSubject: 'Pasien', incidentLocation: 'Ruang Perawatan', relatedUnit: 'RANAP', firstAction: 'Memasang pagar pengaman tempat tidur dan mengedukasi pasien.', firstActionBy: 'Perawat', patientImpact: 'Tidak ada cedera', hasHappenedBefore: 'Tidak', analysisNotes: 'Kelalaian perawat dalam memasang pagar pengaman setelah melakukan tindakan.', followUpPlan: 'Re-sosialisasi SOP pemasangan pengaman tempat tidur.' },
    { id: 'inc-2', date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), type: 'KTD', severity: 'kuning', status: 'Selesai', patientName: 'Siti Aminah', medicalRecordNumber: '654321', careRoom: 'IGD', ageGroup: '>15 thn - 30 thn', gender: 'Perempuan', payer: 'Pribadi / UMUM', incidentDate: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(), incidentTime: '15:30', chronology: 'Salah pemberian obat, seharusnya Paracetamol diberikan Ibuprofen.', incidentSubject: 'Pasien', incidentLocation: 'Ruang Perawatan', relatedUnit: 'FARMASI', firstAction: 'Melaporkan ke dokter jaga dan memonitor kondisi pasien.', firstActionBy: 'Perawat', patientImpact: 'Cedera Ringan', hasHappenedBefore: 'Ya', analysisNotes: 'Kesalahan pembacaan resep oleh petugas farmasi.', followUpPlan: 'Implementasi double check untuk obat-obatan look-alike-sound-alike (LASA).' },
];


const createIncidentStore = () => create<IncidentState>()(
  persist(
    (set, get) => ({
      incidents: initialIncidents,
      addIncident: (data) => {
        const newId = `inc-${get().incidents.length + 1}`;
        const newIncident: Incident = {
          id: newId,
          ...data,
          date: new Date().toISOString(),
          status: 'Investigasi',
        };
        set((state) => ({
          incidents: [...state.incidents, newIncident],
        }));
        return newId;
      },
      updateIncident: (id, data) => set((state) => ({
        incidents: state.incidents.map(i => i.id === id ? { ...i, ...data } as Incident : i),
      })),
      updateIncidentStatus: (id, status) => set((state) => ({
        incidents: state.incidents.map(i => i.id === id ? { ...i, status } : i),
      })),
      getIncidentById: (id) => get().incidents.find(i => i.id === id),
    }),
    {
      name: 'incident-storage',
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

const IncidentStoreContext = createContext<ReturnType<typeof createIncidentStore> | null>(null);

export const IncidentStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createIncidentStore>>();
  if (!storeRef.current) {
    storeRef.current = createIncidentStore();
  }
  return (
    <IncidentStoreContext.Provider value={storeRef.current}>
      {children}
    </IncidentStoreContext.Provider>
  );
};

export const useIncidentStore = (): IncidentState => {
  const store = useContext(IncidentStoreContext);
  if (!store) {
    throw new Error('useIncidentStore must be used within a IncidentStoreProvider');
  }
  return store();
};
