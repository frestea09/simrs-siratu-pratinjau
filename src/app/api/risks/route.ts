import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const mapSourceUiToDb = (s: string): any => {
  switch (s) {
    case 'Laporan Insiden': return 'LaporanInsiden'
    case 'Komplain': return 'Komplain'
    case 'Survey/Ronde': return 'SurveyRonde'
    case 'Rapat/Brainstorming': return 'RapatBrainstorming'
    case 'Investigasi': return 'Investigasi'
    case 'Litigasi': return 'Litigasi'
    case 'External Requirement': return 'ExternalRequirement'
    default: return 'Investigasi'
  }
}
const mapSourceDbToUi = (s: string): any => {
  switch (s) {
    case 'LaporanInsiden': return 'Laporan Insiden'
    case 'Komplain': return 'Komplain'
    case 'SurveyRonde': return 'Survey/Ronde'
    case 'RapatBrainstorming': return 'Rapat/Brainstorming'
    case 'Investigasi': return 'Investigasi'
    case 'Litigasi': return 'Litigasi'
    case 'ExternalRequirement': return 'External Requirement'
    default: return s
  }
}
const mapCategoryUiToDb = (c: string): any => c.replace(' ', '').replace(' ', '')
const mapCategoryDbToUi = (c: string): any => {
  switch (c) {
    case 'PelayananPasien': return 'Pelayanan Pasien'
    case 'BahayaFisik': return 'Bahaya Fisik'
    case 'BahayaKimia': return 'Bahaya Kimia'
    case 'BahayaBiologi': return 'Bahaya Biologi'
    case 'BahayaErgonomi': return 'Bahaya Ergonomi'
    case 'BahayaPsikososial': return 'Bahaya Psikososial'
    default: return c
  }
}
const mapStatusUiToDb = (s?: string): any => (s === 'In Progress' ? 'InProgress' : (s ?? 'Open'))
const mapStatusDbToUi = (s: string): any => (s === 'InProgress' ? 'In Progress' : s)

function computeRisk(r: { consequence: number; likelihood: number; controllability: number; residualConsequence?: number | null; residualLikelihood?: number | null }) {
  const consequence = Number(r.consequence) || 0
  const likelihood = Number(r.likelihood) || 0
  const controllability = Number(r.controllability) || 1
  const cxl = consequence * likelihood
  const riskLevel = cxl <= 3 ? 'Rendah' : cxl <= 6 ? 'Moderat' : cxl <= 12 ? 'Tinggi' : 'Ekstrem'
  const riskScore = cxl * controllability
  let residualRiskScore: number | null = null
  let residualRiskLevel: any = null
  if ((r.residualConsequence ?? 0) > 0 && (r.residualLikelihood ?? 0) > 0) {
    const rc = Number(r.residualConsequence)
    const rl = Number(r.residualLikelihood)
    const resCxl = rc * rl
    residualRiskScore = resCxl * controllability
    residualRiskLevel = resCxl <= 3 ? 'Rendah' : resCxl <= 6 ? 'Moderat' : resCxl <= 12 ? 'Tinggi' : 'Ekstrem'
  }
  return { cxl, riskLevel, riskScore, residualRiskScore, residualRiskLevel }
}

async function resolveUserFromSession() {
  try {
    const jar = await cookies()
    const raw = jar.get('session')?.value
    if (!raw) return null
    const sess = JSON.parse(raw)
    if (!sess?.email) return null
    let user = await prisma.user.findUnique({ where: { email: sess.email } })
    if (!user) {
      const mapUiRoleToDb = (r?: string) => {
        switch (r) {
          case 'Admin Sistem': return 'AdminSistem'
          case 'PIC Mutu': return 'PICMutu'
          case 'PJ Ruangan': return 'PJRuangan'
          case 'Kepala Unit/Instalasi': return 'KepalaUnitInstalasi'
          case 'Direktur': return 'Direktur'
          case 'Sub. Komite Peningkatan Mutu': return 'SubKomitePeningkatanMutu'
          case 'Sub. Komite Keselamatan Pasien': return 'SubKomiteKeselamatanPasien'
          case 'Sub. Komite Manajemen Risiko': return 'SubKomiteManajemenRisiko'
          default: return 'PICMutu'
        }
      }
      user = await prisma.user.create({ data: {
        name: sess.name ?? 'Admin Sistem',
        email: sess.email,
        password: sess.password ?? '123456',
        role: mapUiRoleToDb(sess.role) as any,
        unit: sess.unit ?? null,
      }})
    }
    return user
  } catch { return null }
}

function toFrontend(r: any) {
  return {
    id: r.id,
    createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
    unit: r.unit,
    source: mapSourceDbToUi(r.source),
    description: r.description,
    cause: r.cause,
    category: mapCategoryDbToUi(r.category),
    consequence: r.consequence,
    likelihood: r.likelihood,
    cxl: r.cxl,
    riskLevel: r.riskLevel,
    controllability: r.controllability,
    riskScore: r.riskScore,
    evaluation: r.evaluation,
    actionPlan: r.actionPlan,
    dueDate: r.dueDate ? new Date(r.dueDate).toISOString() : undefined,
    pic: r.pic ? r.pic.name : undefined,
    status: mapStatusDbToUi(r.status),
    residualConsequence: r.residualConsequence ?? undefined,
    residualLikelihood: r.residualLikelihood ?? undefined,
    residualRiskScore: r.residualRiskScore ?? undefined,
    residualRiskLevel: r.residualRiskLevel ?? undefined,
    reportNotes: r.reportNotes ?? undefined,
  }
}

export async function GET() {
  try {
    const items = await prisma.risk.findMany({ orderBy: { createdAt: 'desc' }, include: { pic: true } })
    return NextResponse.json(items.map(toFrontend))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch risks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const author = await resolveUserFromSession()
    const authorId = author?.id ?? (await prisma.user.upsert({ where: { email: 'admin@sim.rs' }, update: {}, create: { name: 'Admin Sistem', email: 'admin@sim.rs', password: '123456', role: 'AdminSistem' } })).id

    let picId: string | null = null
    if (body.pic) {
      const pic = await prisma.user.findFirst({ where: { name: body.pic } })
      picId = pic?.id ?? null
    }

    const computed = computeRisk({
      consequence: Number(body.consequence),
      likelihood: Number(body.likelihood),
      controllability: Number(body.controllability),
      residualConsequence: body.residualConsequence ?? null,
      residualLikelihood: body.residualLikelihood ?? null,
    })

    const created = await prisma.risk.create({
      data: {
        unit: body.unit,
        source: mapSourceUiToDb(body.source),
        description: body.description,
        cause: body.cause,
        category: mapCategoryUiToDb(body.category),
        consequence: Number(body.consequence),
        likelihood: Number(body.likelihood),
        cxl: computed.cxl,
        riskLevel: computed.riskLevel,
        controllability: Number(body.controllability),
        riskScore: computed.riskScore,
        evaluation: body.evaluation,
        actionPlan: body.actionPlan,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: mapStatusUiToDb(body.status),
        residualConsequence: body.residualConsequence ?? null,
        residualLikelihood: body.residualLikelihood ?? null,
        residualRiskScore: computed.residualRiskScore,
        residualRiskLevel: computed.residualRiskLevel,
        reportNotes: body.reportNotes ?? null,
        authorId,
        picId,
      },
      include: { pic: true },
    })
    return NextResponse.json(toFrontend(created), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create risk' }, { status: 500 })
  }
}

