import { create } from 'zustand'

export type SpmIndicator = {
  serviceType: string;
  indicator: string;
  target: string;
  achievement: string;
  notes?: string;
}

type SpmState = {
  spmIndicators: SpmIndicator[]
}

const initialSpmData: SpmIndicator[] = [
    { serviceType: 'Pelayanan Gawat Darurat', indicator: 'Kemampuan menangani life saving anak dan dewasa', target: '100%', achievement: '100%', notes: '' },
    { serviceType: 'Pelayanan Gawat Darurat', indicator: 'Jam buka Pelayanan Gawat Darurat', target: '24 jam', achievement: '24 Jam', notes: '' },
    { serviceType: 'Pelayanan Gawat Darurat', indicator: 'Pemberi pelayanan gawat darurat yang bersertifikat yang masih berlaku BLS/PPGD/GELS/ALS', target: '100%', achievement: '92,50%', notes: '3 orang kadaluarsa dari 40 orang' },
    { serviceType: 'Pelayanan Gawat Darurat', indicator: 'Ketersediaan tim penanggulangan bencana', target: 'Satu tim', achievement: 'Satu Tim', notes: '' },
    { serviceType: 'Pelayanan Gawat Darurat', indicator: 'Waktu tanggap pelayanan Dokter di Gawat Darurat', target: '≤ lima menit terlayani, setelah pasien datang', achievement: '2 menit', notes: '' },
    { serviceType: 'Pelayanan Gawat Darurat', indicator: 'Kepuasan Pelanggan', target: '≥ 70 %', achievement: '83,37', notes: 'sesuai nilai SKM' },
    { serviceType: 'Pelayanan Gawat Darurat', indicator: 'Kematian pasien< 24 Jam', target: '≤ dua per seribu (pindah ke pelayanan rawat inap setelah 8 jam)', achievement: '3,372681282', notes: '' },
];


export const useSpmStore = create<SpmState>((set) => ({
  spmIndicators: initialSpmData,
}))
