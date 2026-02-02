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

  console.log('Seed selesai: pengguna + SKP triwulanan')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
