import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

function mapTargetUnitToFrontend(u: string): '%' | 'menit' {
  return u === 'percent' ? '%' : 'menit'
}

function mapTargetUnitToDb(u: string): 'percent' | 'minute' {
  return u === '%' ? 'percent' : 'minute'
}

function mapStatusToFrontend(s: string): 'Draf' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' {
  if (s === 'MenungguPersetujuan') return 'Menunggu Persetujuan'
  return s as any
}

function mapStatusToDb(s?: string): 'Draf' | 'MenungguPersetujuan' | 'Disetujui' | 'Ditolak' {
  if (!s) return 'Draf'
  if (s === 'Menunggu Persetujuan') return 'MenungguPersetujuan'
  return s as any
}

function mapProfileToFrontend(p: any) {
  return {
    id: p.id,
    title: p.title,
    purpose: p.purpose,
    definition: p.definition ?? '',
    implication: p.implication ?? '',
    calculationMethod: p.calculationMethod,
    numerator: p.numerator,
    denominator: p.denominator,
    target: p.target,
    targetUnit: mapTargetUnitToFrontend(p.targetUnit) as any,
    inclusionCriteria: p.inclusionCriteria ?? '',
    exclusionCriteria: p.exclusionCriteria ?? '',
    dataRecording: p.dataRecording,
    unitRecap: p.unitRecap,
    analysisReporting: p.analysisReporting,
    area: p.area,
    pic: p.pic,
    status: mapStatusToFrontend(p.status),
    rejectionReason: p.rejectionReason ?? undefined,
    createdBy: p.authorId,
    createdAt: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)).toISOString(),
    unit: p.unit,
  }
}

async function resolveAuthorIdFromCookie() {
  try {
    const jar = await cookies()
    const session = jar.get('session')?.value
    if (!session) return null
    const sess = JSON.parse(session)
    if (sess?.email) {
      // Try find by email
      let user = await prisma.user.findUnique({ where: { email: sess.email } })
      if (user) return user.id

      // If not exist, create the user based on session
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
      return user.id
    }
  } catch {}
  return null
}

export async function GET() {
  try {
    const items = await prisma.indicatorProfile.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items.map(mapProfileToFrontend))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let authorId = await resolveAuthorIdFromCookie()
    if (!authorId) {
      const admin = await prisma.user.upsert({
        where: { email: 'admin@sim.rs' },
        update: {},
        create: {
          name: 'Admin Sistem',
          email: 'admin@sim.rs',
          password: '123456',
          role: 'AdminSistem',
        },
      })
      authorId = admin.id
    }

    const created = await prisma.indicatorProfile.create({
      data: {
        title: body.title,
        purpose: body.purpose,
        definition: body.definition ?? '',
        implication: body.implication ?? '',
        calculationMethod: body.calculationMethod,
        numerator: body.numerator,
        denominator: body.denominator,
        target: Number(body.target),
        targetUnit: mapTargetUnitToDb(body.targetUnit),
        inclusionCriteria: body.inclusionCriteria ?? '',
        exclusionCriteria: body.exclusionCriteria ?? '',
        dataRecording: body.dataRecording,
        unitRecap: body.unitRecap,
        analysisReporting: body.analysisReporting,
        area: body.area,
        pic: body.pic,
        status: mapStatusToDb(body.status),
        rejectionReason: body.rejectionReason ?? null,
        unit: body.unit,
        authorId,
      },
    })
    return NextResponse.json(mapProfileToFrontend(created), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create profile' }, { status: 500 })
  }
}
