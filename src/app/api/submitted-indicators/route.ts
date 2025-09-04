import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const mapCategoryToDb = (c: string): 'INM' | 'IMP_RS' | 'IMPU' | 'SPM' => (c === 'IMP-RS' ? 'IMP_RS' : (c as any))
const mapCategoryToUi = (c: string): 'INM' | 'IMP-RS' | 'IMPU' | 'SPM' => (c === 'IMP_RS' ? 'IMP-RS' : (c as any))
const mapFreqToDb = (f: string): 'Harian' | 'Mingguan' | 'Bulanan' | 'Triwulan' | 'Tahunan' => (f as any)
const mapUnitToDb = (u: string): 'percent' | 'minute' => (u === '%' ? 'percent' : 'minute')
const mapUnitToUi = (u: string): '%' | 'menit' => (u === 'percent' ? '%' : 'menit')
const mapStatusToDb = (s?: string): 'MenungguPersetujuan' | 'Diverifikasi' | 'Ditolak' => (
  s === 'Diverifikasi' ? 'Diverifikasi' : s === 'Ditolak' ? 'Ditolak' : 'MenungguPersetujuan'
)
const mapStatusToUi = (s: string): 'Menunggu Persetujuan' | 'Diverifikasi' | 'Ditolak' => (
  s === 'MenungguPersetujuan' ? 'Menunggu Persetujuan' : (s as any)
)

function toFrontend(si: any) {
  return {
    id: si.id,
    name: si.name,
    category: mapCategoryToUi(si.category),
    description: si.description ?? '',
    unit: si.unit,
    frequency: si.frequency,
    status: mapStatusToUi(si.status),
    submissionDate: (si.submissionDate instanceof Date ? si.submissionDate : new Date(si.submissionDate)).toISOString(),
    standard: si.standard,
    standardUnit: mapUnitToUi(si.standardUnit),
    rejectionReason: si.rejectionReason ?? undefined,
    submittedById: si.submittedById,
    profileId: si.profileId,
  }
}

export async function GET() {
  try {
    const items = await prisma.submittedIndicator.findMany({ orderBy: { submissionDate: 'desc' } })
    return NextResponse.json(items.map(toFrontend))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch submitted indicators' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }
    // Resolve submittedById from session cookie; fallback to admin
    let submittedById: string | undefined
    try {
      const jar = await cookies()
      const session = jar.get('session')?.value
      if (session) {
        const sess = JSON.parse(session)
        if (sess?.email) {
          let user = await prisma.user.findUnique({ where: { email: sess.email } })
          if (!user) {
            const mapUiRoleToDbRole = (r?: string) => {
              switch (r) {
                case 'Admin Sistem': return 'AdminSistem'
                case 'PIC Mutu': return 'PICMutu'
                case 'PJ Ruangan': return 'PJRuangan'
                case 'Kepala Unit/Instalasi': return 'KepalaUnitInstalasi'
                case 'Direktur': return 'Direktur'
                case 'Sub. Komite Peningkatan Mutu': return 'SubKomitePeningkatanMutu'
                case 'Sub. Komite Keselamatan Pasien': return 'SubKomiteKeselamatanPasien'
                case 'Sub. Komite Manajemen Risiko': return 'SubKomiteManajemenRisiko'
                default: return 'AdminSistem'
              }
            }
            user = await prisma.user.create({
              data: {
                name: sess.name ?? 'Admin Sistem',
                email: sess.email,
                password: sess.password ?? '123456',
                role: mapUiRoleToDbRole(sess.role) as any,
                unit: sess.unit ?? null,
              }
            })
          }
          submittedById = user.id
        }
      }
    } catch {}
    if (!submittedById) {
      const admin = await prisma.user.upsert({
        where: { email: 'admin@sim.rs' },
        update: {},
        create: { name: 'Admin Sistem', email: 'admin@sim.rs', password: '123456', role: 'AdminSistem' },
      })
      submittedById = admin.id
    }
    const created = await prisma.submittedIndicator.create({
      data: {
        name: body.name,
        category: mapCategoryToDb(body.category),
        description: body.description ?? '',
        unit: body.unit,
        frequency: mapFreqToDb(body.frequency),
        status: mapStatusToDb(body.status),
        standard: Number(body.standard),
        standardUnit: mapUnitToDb(body.standardUnit),
        rejectionReason: body.rejectionReason ?? null,
        profileId: body.profileId,
        submittedById,
      },
    })
    return NextResponse.json(toFrontend(created), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to submit indicator' }, { status: 500 })
  }
}
