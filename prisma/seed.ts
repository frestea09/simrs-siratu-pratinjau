import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const hospitalUnits = [
    'Rawat Inap - Bougenville',
    'Rawat Inap - Anggrek',
    'Rawat Inap - Flamboyan',
    'Rawat Inap - Mawar',
    'Rawat Inap - Anyelir',
    'Rawat Inap - Melati',
    'Rawat Inap - Dahlia/VK',
    'Rawat Inap - Camelia',
    'Rawat Inap - Kenanga',
    'Rawat Inap - WK',
    'ICU',
    'PICU',
    'NICU',
    'IGD',
    'PONEK',
    'IBS',
    'Gizi',
    'Farmasi',
    'Kesling & K3RS',
    'Rawat Jalan',
    'Laboratorium',
    'Radiologi',
    'Rekam Medis',
    'IPSRS',
    'SIMRS',
    'CSSD',
    'Laundry',
    'Keuangan',
    'Kepegawaian',
    'Bagian Umum',
    'Program Humas & Program',
    'PKRS',
  ]

  await prisma.unit.createMany({
    data: hospitalUnits.map((name) => ({ name })),
    skipDuplicates: true,
  })

  const users: Prisma.UserCreateInput[] = [
    { name: 'Admin Sistem', email: 'admin@sim.rs', password: '123456', role: 'AdminSistem' },
    { name: 'Delina (PIC Mutu)', email: 'delina@sim.rs', password: '123456', role: 'PICMutu', unit: 'PPI' },
    { name: 'Deti (PJ Ruangan)', email: 'deti@sim.rs', password: '123456', role: 'PJRuangan', unit: 'RANAP' },
    { name: 'Devin (Keselamatan Pasien)', email: 'devin@sim.rs', password: '123456', role: 'SubKomiteKeselamatanPasien' },
    { name: 'Deka (Kepala Unit)', email: 'deka@sim.rs', password: '123456', role: 'KepalaUnitInstalasi', unit: 'IGD' },
    { name: 'Dr. Direktur', email: 'dir@sim.rs', password: '123456', role: 'Direktur' },
    { name: 'Dion (Peningkatan Mutu)', email: 'dion@sim.rs', password: '123456', role: 'SubKomitePeningkatanMutu' },
    { name: 'Dara (Manajemen Risiko)', email: 'dara@sim.rs', password: '123456', role: 'SubKomiteManajemenRisiko' },
  ]

  await prisma.user.createMany({ data: users, skipDuplicates: true })
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@sim.rs' } })

  const profile = await prisma.indicatorProfile.upsert({
    where: { title: 'Kepatuhan Identifikasi Pasien' },
    update: {},
    create: {
      title: 'Kepatuhan Identifikasi Pasien',
      purpose: 'Memantau kepatuhan identifikasi pasien untuk keselamatan pasien',
      definition: 'Persentase kepatuhan identifikasi pasien sesuai kebijakan rumah sakit',
      implication: 'Meningkatkan keselamatan dan kualitas pelayanan',
      calculationMethod: 'percentage',
      numerator: 'Jumlah observasi tindakan yang memenuhi kriteria identifikasi',
      denominator: 'Total observasi tindakan yang memerlukan identifikasi',
      target: 95,
      targetUnit: 'percent',
      inclusionCriteria: 'Semua tindakan yang memerlukan identifikasi pasien',
      exclusionCriteria: 'Kasus emergensi tertentu bila tak memungkinkan',
      dataRecording: 'Form audit kepatuhan identifikasi',
      unitRecap: 'Rekap oleh unit mutu setiap triwulan',
      analysisReporting: 'Analisis tren triwulanan dan rencana tindak lanjut',
      area: 'Seluruh unit pelayanan',
      pic: 'Sub Komite Keselamatan Pasien',
      unit: 'Mutu',
      authorId: admin.id,
    },
  })

  const submission = await prisma.submittedIndicator.create({
    data: {
      name: 'SKP: Kepatuhan Identifikasi Pasien',
      category: 'IMP_RS',
      description: 'Laporan SKP triwulanan terkait kepatuhan identifikasi pasien',
      unit: 'Mutu',
      frequency: 'Triwulan',
      standard: 95,
      standardUnit: 'percent',
      profileId: profile.id,
      submittedById: admin.id,
      status: 'MenungguPersetujuan',
    },
  })

  const year = new Date().getFullYear()
  const quarters = [
    new Date(year, 2, 31),
    new Date(year, 5, 30),
    new Date(year, 8, 30),
    new Date(year, 11, 31),
  ]

  const samples = [
    { num: 190, den: 200 },
    { num: 280, den: 300 },
    { num: 360, den: 380 },
    { num: 480, den: 500 },
  ]

  for (let i = 0; i < quarters.length; i++) {
    const { num: n, den: d } = samples[i]
    const ratio = d > 0 ? (n / d) * 100 : 0
    await prisma.indicator.create({
      data: {
        period: new Date(quarters[i].toISOString().slice(0, 10)),
        numerator: n,
        denominator: d,
        ratio,
        status: 'Final',
        submissionId: submission.id,
        analysisNotes: 'Hasil audit konsisten, perlu monitoring berkelanjutan',
        followUpPlan: 'Edukasi ulang petugas dan audit mendadak',
      },
    })
  }

  await prisma.incident.createMany({
    data: [
      {
        status: 'Investigasi',
        patientName: 'Haryati',
        careRoom: 'IGD',
        chronology: 'Pasien terjatuh saat menuju toilet, ditolong perawat.',
        type: 'KTD',
        incidentSubject: 'Pasien',
        relatedUnit: 'IGD',
        severity: 'kuning',
        patientImpact: 'Luka lecet ringan di lutut kanan',
        analysisNotes: 'Perlu pemeriksaan ulang SOP pendampingan pasien risiko jatuh.',
        followUpPlan: 'Tingkatkan edukasi keluarga dan cek ulang alarm bed rail.',
      },
      {
        status: 'Investigasi',
        patientName: 'Andi',
        careRoom: 'Rawat Inap - Mawar',
        chronology: 'Obat kemoterapi terlambat 30 menit karena stok di farmasi terbatas.',
        type: 'KNC',
        incidentSubject: 'Obat',
        relatedUnit: 'Farmasi',
        severity: 'hijau',
        patientImpact: 'Tidak ada dampak klinis, jadwal terapi digeser.',
        analysisNotes: 'Butuh buffer stock dan dashboard early warning.',
        followUpPlan: 'Tambah minimum stock level dan reminder otomatis.',
      },
    ],
  })

  await prisma.risk.createMany({
    data: [
      {
        unit: 'IGD',
        source: 'Komplain',
        description: 'Risiko keterlambatan triase di jam sibuk.',
        cause: 'Kekurangan petugas saat shift malam.',
        category: 'PelayananPasien',
        consequence: 4,
        likelihood: 3,
        cxl: 12,
        riskLevel: 'Tinggi',
        controllability: 2,
        riskScore: 24,
        evaluation: 'Mitigasi',
        actionPlan: 'Optimasi jadwal petugas dan buka loket triase mandiri.',
        dueDate: new Date(new Date().getFullYear(), 6, 1),
        status: 'Open',
        residualConsequence: 2,
        residualLikelihood: 2,
        residualRiskScore: 4,
        residualRiskLevel: 'Rendah',
        reportNotes: 'Evaluasi setelah tiga bulan pelaksanaan.',
        authorId: admin.id,
        picId: admin.id,
      },
      {
        unit: 'Farmasi',
        source: 'ExternalRequirement',
        description: 'Risiko kepatuhan penyimpanan obat high alert.',
        cause: 'Labelisasi belum seragam di satelit farmasi.',
        category: 'Compliance',
        consequence: 5,
        likelihood: 2,
        cxl: 10,
        riskLevel: 'Moderat',
        controllability: 3,
        riskScore: 30,
        evaluation: 'Mitigasi',
        actionPlan: 'Audit harian lemari obat high alert dan refresh training.',
        dueDate: new Date(new Date().getFullYear(), 7, 15),
        status: 'InProgress',
        residualConsequence: 3,
        residualLikelihood: 1,
        residualRiskScore: 3,
        residualRiskLevel: 'Rendah',
        reportNotes: 'Membutuhkan dukungan Kepala Instalasi Farmasi.',
        authorId: admin.id,
        picId: admin.id,
      },
    ],
  })

  await prisma.notification.createMany({
    data: [
      {
        title: 'Capaian SKP triwulan terbaru',
        description: 'Data capaian SKP sudah lengkap hingga triwulan berjalan.',
        link: '/dashboard',
        recipientId: admin.id,
      },
      {
        title: 'Tindak lanjut risiko IGD',
        description: 'Review mitigasi risiko keterlambatan triase pada rapat mutu.',
        link: '/risks',
        recipientId: admin.id,
      },
    ],
  })

  await prisma.systemLog.createMany({
    data: [
      {
        user: 'Admin Sistem',
        action: 'Seed',
        details: 'Seeder menjalankan inisialisasi pengguna dan data contoh.',
      },
      {
        user: 'Admin Sistem',
        action: 'Profil Indikator',
        details: 'Membuat profil Kepatuhan Identifikasi Pasien untuk demo dashboard.',
      },
    ],
  })

  console.log('Seed selesai: pengguna, capaian SKP, insiden, risiko, dan notifikasi contoh')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
