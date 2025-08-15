
import { PrismaClient, IndicatorCategory, UserRole, RiskLevel, IncidentStatus, RiskStatus } from '@prisma/client'
import { calculateRatio, calculateStatus } from '../src/lib/indicator-utils'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Seed Users
  const usersData = [
    { id: 'user-1', name: 'Admin Sistem', email: 'admin@sim.rs', password: '123456', role: 'Admin' as UserRole },
    { id: 'user-2', name: 'Delina (PIC Mutu)', email: 'delina@sim.rs', password: '123456', role: 'PicMutu' as UserRole, unit: 'PPI' },
    { id: 'user-3', name: 'Deti (PJ Ruangan)', email: 'deti@sim.rs', password: '123456', role: 'PjRuangan' as UserRole, unit: 'RANAP' },
    { id: 'user-4', name: 'Devin (Keselamatan Pasien)', email: 'devin@sim.rs', password: '123456', role: 'PatientSafetyCommittee' as UserRole },
    { id: 'user-5', name: 'Deka (Kepala Unit)', email: 'deka@sim.rs', password: '123456', role: 'UnitHead' as UserRole, unit: 'IGD' },
    { id: 'user-6', name: 'Dr. Direktur', email: 'dir@sim.rs', password: '123456', role: 'Director' as UserRole },
    { id: 'user-7', name: 'Dion (Peningkatan Mutu)', email: 'dion@sim.rs', password: '123456', role: 'QualityImprovementCommittee' as UserRole },
    { id: 'user-8', name: 'Dara (Manajemen Risiko)', email: 'dara@sim.rs', password: '123456', role: 'RiskManagementCommittee' as UserRole },
  ]
  for (const u of usersData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: u,
    })
  }

  // Seed Submitted Indicators
  const submittedIndicatorsData = [
    // INM
    { id: 'sub-1', name: 'Kepatuhan Kebersihan Tangan', category: 'INM' as IndicatorCategory, unit: 'PPI', frequency: 'Bulanan', description: 'Persentase kepatuhan petugas dalam melakukan kebersihan tangan sesuai standar WHO.', standard: 85, standardUnit: '%', status: 'Diverifikasi' },
    { id: 'sub-2', name: 'Kepatuhan Penggunaan APD', category: 'INM' as IndicatorCategory, unit: 'PPI', frequency: 'Bulanan', description: 'Persentase kepatuhan petugas dalam menggunakan Alat Pelindung Diri (APD) sesuai indikasi.', standard: 100, standardUnit: '%', status: 'Diverifikasi' },
    { id: 'sub-3', name: 'Waktu Tunggu Rawat Jalan', category: 'INM' as IndicatorCategory, unit: 'RAJAL', frequency: 'Bulanan', description: 'Rata-rata waktu tunggu pasien rawat jalan mulai dari pendaftaran hingga mendapat pelayanan dokter.', standard: 60, standardUnit: 'menit', status: 'Ditolak', rejectionReason: 'Definisi operasional kurang jelas, harap diperbaiki.' },
    // IMP-RS
    { id: 'sub-4', name: 'Angka Kejadian Pasien Jatuh', category: 'IMPRS' as IndicatorCategory, unit: 'RANAP', frequency: 'Bulanan', description: 'Jumlah kejadian pasien jatuh di lingkungan rumah sakit per 1000 hari rawat.', standard: 0, standardUnit: '%', status: 'Diverifikasi' },
    { id: 'sub-5', name: 'Kecepatan Respon time Komplain', category: 'IMPRS' as IndicatorCategory, unit: 'HUMAS', frequency: 'Bulanan', description: 'Waktu yang dibutuhkan untuk merespon komplain pelanggan.', standard: 90, standardUnit: '%', status: 'Menunggu Persetujuan' },
    // IMPU
    { id: 'sub-6', name: 'Waktu Lapor Hasil Kritis Laboratorium', category: 'IMPU' as IndicatorCategory, unit: 'LABORATORIUM', frequency: 'Bulanan', description: 'Waktu yang dibutuhkan sejak hasil kritis keluar hingga dilaporkan ke DPJP.', standard: 30, standardUnit: 'menit', status: 'Diverifikasi' },
    { id: 'sub-7', name: 'Kepatuhan Identifikasi Pasien', category: 'IMPU' as IndicatorCategory, unit: 'IGD', frequency: 'Bulanan', description: 'Kepatuhan petugas IGD dalam melakukan identifikasi pasien sebelum tindakan.', standard: 100, standardUnit: '%', status: 'Diverifikasi' },
  ];
  for (const si of submittedIndicatorsData) {
    await prisma.indicatorSubmission.upsert({
      where: { id: si.id },
      update: {},
      create: si,
    });
  }

  // Seed Indicator Data
  const indicatorData = [];
  const today = new Date();
  const baseIndicatorsToSeed = submittedIndicatorsData.filter(si => si.status === 'Diverifikasi');

  for (let i = 0; i < 6; i++) { // Seed data for the last 6 months
    const period = new Date(today.getFullYear(), today.getMonth() - i, 15);
    for (const baseIndicator of baseIndicatorsToSeed) {
      const isPercentage = baseIndicator.standardUnit === '%';
      const isTime = baseIndicator.standardUnit === 'menit';
      
      let numerator, denominator;

      if (isPercentage) {
        denominator = Math.floor(Math.random() * 50) + 50; // 50-100
        const randomFactor = (Math.random() - 0.1) * baseIndicator.standard; // Fluctuate around standard
        numerator = Math.floor((denominator * (randomFactor + (Math.random() * 20))) / 100);
        numerator = Math.min(denominator, Math.max(0, numerator)); // ensure 0 <= numerator <= denominator
      } else if (isTime) {
        denominator = Math.floor(Math.random() * 20) + 10; // 10-30 patients
        numerator = Math.floor(denominator * (baseIndicator.standard + (Math.random() * 20 - 10))); // Fluctuate around standard
      } else {
        denominator = 100;
        numerator = Math.floor(Math.random() * 101);
      }
      
      const data: Omit<any, 'id'> = {
        indicator: baseIndicator.name,
        category: baseIndicator.category,
        unit: baseIndicator.unit,
        period: period,
        frequency: baseIndicator.frequency,
        numerator,
        denominator,
        standard: baseIndicator.standard,
        standardUnit: baseIndicator.standardUnit,
        analysisNotes: parseFloat(calculateRatio({numerator, denominator, standardUnit: baseIndicator.standardUnit})) < baseIndicator.standard ? 'Perlu dilakukan investigasi lebih lanjut terkait penurunan capaian.' : 'Capaian bulan ini memenuhi standar yang ditetapkan.',
        followUpPlan: parseFloat(calculateRatio({numerator, denominator, standardUnit: baseIndicator.standardUnit})) < baseIndicator.standard ? 'Akan diadakan re-sosialisasi SOP kepada staf terkait.' : ''
      };
      
      data.ratio = calculateRatio(data);
      data.status = calculateStatus(data);
      
      indicatorData.push(data);
    }
  }

  for (const d of indicatorData) {
    await prisma.indicator.create({
      data: d,
    });
  }

  // Seed Incidents
  const incidentsData = [
    { id: 'inc-1', date: new Date(today.setDate(today.getDate() - 5)), type: 'KNC', severity: 'biru', status: 'Investigasi' as IncidentStatus, patientName: 'Budi Santoso', medicalRecordNumber: '123456', careRoom: 'RANAP', ageGroup: '>30 thn - 65 thn', gender: 'Laki-laki', payer: 'BPJS NON PBI', incidentDate: new Date(today.setDate(today.getDate() - 6)), incidentTime: '10:00', chronology: 'Pasien hampir terjatuh dari tempat tidur karena pagar pengaman tidak terpasang.', incidentSubject: 'Pasien', incidentLocation: 'Ruang Perawatan', relatedUnit: 'RANAP', firstAction: 'Memasang pagar pengaman tempat tidur dan mengedukasi pasien.', firstActionBy: 'Perawat', patientImpact: 'Tidak ada cedera', hasHappenedBefore: 'Tidak', analysisNotes: 'Kelalaian perawat dalam memasang pagar pengaman setelah melakukan tindakan.', followUpPlan: 'Re-sosialisasi SOP pemasangan pengaman tempat tidur.' },
    { id: 'inc-2', date: new Date(today.setDate(today.getDate() - 10)), type: 'KTD', severity: 'kuning', status: 'Selesai' as IncidentStatus, patientName: 'Siti Aminah', medicalRecordNumber: '654321', careRoom: 'IGD', ageGroup: '>15 thn - 30 thn', gender: 'Perempuan', payer: 'Pribadi / UMUM', incidentDate: new Date(today.setDate(today.getDate() - 11)), incidentTime: '15:30', chronology: 'Salah pemberian obat, seharusnya Paracetamol diberikan Ibuprofen.', incidentSubject: 'Pasien', incidentLocation: 'Ruang Perawatan', relatedUnit: 'FARMASI', firstAction: 'Melaporkan ke dokter jaga dan memonitor kondisi pasien.', firstActionBy: 'Perawat', patientImpact: 'Cedera Ringan', hasHappenedBefore: 'Ya', analysisNotes: 'Kesalahan pembacaan resep oleh petugas farmasi.', followUpPlan: 'Implementasi double check untuk obat-obatan look-alike-sound-alike (LASA).' },
  ];
  for (const i of incidentsData) {
    await prisma.incident.upsert({
        where: { id: i.id },
        update: {},
        create: i,
    });
  }

  // Seed Risks
  const risksData = [
    { id: 'risk-1', unit: 'IT', source: 'RapatBrainstorming', description: 'Kegagalan sistem server utama SIM-RS', cause: 'Hardware sudah tua dan tidak ada redudansi.', category: 'Operasional', consequence: 5, likelihood: 2, controllability: 3, evaluation: 'Mitigasi', actionPlan: 'Pengadaan server baru dengan sistem high-availability', dueDate: new Date(today.getFullYear(), today.getMonth() + 3, 1).toISOString(), pic: 'Admin Sistem', status: 'InProgress' as RiskStatus },
    { id: 'risk-2', unit: 'IGD', source: 'LaporanInsiden', description: 'Risiko pasien jatuh di area IGD', cause: 'Lantai licin dan kurangnya penanda.', category: 'PelayananPasien', consequence: 3, likelihood: 4, controllability: 4, evaluation: 'Mitigasi', actionPlan: 'Pemasangan rambu lantai licin dan rubber mat di area basah.', dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString(), pic: 'Deka (Kepala Unit)', status: 'Closed' as RiskStatus, residualConsequence: 2, residualLikelihood: 1, reportNotes: 'Rambu dan rubber mat sudah terpasang. Kejadian tidak terulang.' },
  ];
   for (const r of risksData) {
    await prisma.risk.upsert({
        where: { id: r.id },
        update: {},
        create: r,
    });
  }

  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
