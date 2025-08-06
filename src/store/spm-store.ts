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

const initialSpmData: SpmIndicator[] = [
    { id: 'SPM-001', serviceType: 'Pelayanan Gawat Darurat', indicator: 'Kemampuan menangani life saving anak dan dewasa', target: '100%', achievement: '100%', notes: '', reportingDate: '2024-07-01' },
    { id: 'SPM-002', serviceType: 'Pelayanan Gawat Darurat', indicator: 'Jam buka Pelayanan Gawat Darurat', target: '24 jam', achievement: '24 Jam', notes: '', reportingDate: '2024-07-01' },
    { id: 'SPM-003', serviceType: 'Pelayanan Gawat Darurat', indicator: 'Pemberi pelayanan gawat darurat yang bersertifikat yang masih berlaku BLS/PPGD/GELS/ALS', target: '100%', achievement: '92,50%', notes: '3 orang kadaluarsa dari 40 orang', reportingDate: '2024-07-01' },
    { id: 'SPM-004', serviceType: 'Pelayanan Gawat Darurat', indicator: 'Ketersediaan tim penanggulangan bencana', target: 'Satu tim', achievement: 'Satu Tim', notes: '', reportingDate: '2024-07-01' },
    { id: 'SPM-005', serviceType: 'Pelayanan Gawat Darurat', indicator: 'Waktu tanggap pelayanan Dokter di Gawat Darurat', target: '≤ lima menit terlayani, setelah pasien datang', achievement: '2 menit', notes: '', reportingDate: '2024-07-01' },
    { id: 'SPM-006', serviceType: 'Pelayanan Gawat Darurat', indicator: 'Kepuasan Pelanggan', target: '≥ 70 %', achievement: '83,37', notes: 'sesuai nilai SKM', reportingDate: '2024-07-01' },
    { id: 'SPM-007', serviceType: 'Pelayanan Gawat Darurat', indicator: 'Kematian pasien< 24 Jam', target: '≤ dua per seribu (pindah ke pelayanan rawat inap setelah 8 jam)', achievement: '3,372681282', notes: '', reportingDate: '2024-07-01' },
];


export const useSpmStore = create<SpmState>((set) => ({
  spmIndicators: initialSpmData,
  addSpmIndicator: (indicator) => set((state) => ({
    spmIndicators: [{ ...indicator, id: `SPM-${String(state.spmIndicators.length + 1).padStart(3, '0')}` }, ...state.spmIndicators],
  })),
}))
