import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import type {
  RiskCategory,
  RiskLevel,
  RiskSource,
  RiskStatus,
} from '@prisma/client'
const sourceMap = {
  'Laporan Insiden': 'LaporanInsiden',
  Komplain: 'Komplain',
  'Survey/Ronde': 'SurveyRonde',
  'Rapat/Brainstorming': 'RapatBrainstorming',
  Investigasi: 'Investigasi',
  Litigasi: 'Litigasi',
  'External Requirement': 'ExternalRequirement',
} as const
const sourceDbMap = Object.fromEntries(
  Object.entries(sourceMap).map(([ui, db]) => [db, ui])
) as Record<RiskSource, string>
export const mapSourceUiToDb = (s: string): RiskSource =>
  sourceMap[s as keyof typeof sourceMap] ?? 'Investigasi'
export const mapSourceDbToUi = (s: RiskSource) => sourceDbMap[s] ?? s

const categoryMap = {
  'Pelayanan Pasien': 'PelayananPasien',
  'Bahaya Fisik': 'BahayaFisik',
  'Bahaya Kimia': 'BahayaKimia',
  'Bahaya Biologi': 'BahayaBiologi',
  'Bahaya Ergonomi': 'BahayaErgonomi',
  'Bahaya Psikososial': 'BahayaPsikososial',
} as const
const categoryDbMap = Object.fromEntries(
  Object.entries(categoryMap).map(([ui, db]) => [db, ui])
) as Record<RiskCategory, string>
export const mapCategoryUiToDb = (c: string): RiskCategory =>
  categoryMap[c as keyof typeof categoryMap] ?? 'PelayananPasien'
export const mapCategoryDbToUi = (c: RiskCategory) => categoryDbMap[c] ?? c

export type RiskStatusUi = 'Open' | 'In Progress' | 'Closed'

export const mapStatusUiToDb = (s?: RiskStatusUi): RiskStatus =>
  s === 'In Progress' ? 'InProgress' : s === 'Closed' ? 'Closed' : 'Open'

export const mapStatusDbToUi = (s: RiskStatus): RiskStatusUi =>
  s === 'InProgress' ? 'In Progress' : s

export function computeRisk(r: {
  consequence: number
  likelihood: number
  controllability: number
  residualConsequence?: number | null
  residualLikelihood?: number | null
}): {
  cxl: number
  riskLevel: RiskLevel
  riskScore: number
  residualRiskScore: number | null
  residualRiskLevel: RiskLevel | null
} {
  const consequence = Number(r.consequence) || 0
  const likelihood = Number(r.likelihood) || 0
  const controllability = Number(r.controllability) || 1
  const cxl = consequence * likelihood
  const riskLevel: RiskLevel =
    cxl <= 3 ? 'Rendah' : cxl <= 6 ? 'Moderat' : cxl <= 12 ? 'Tinggi' : 'Ekstrem'
  const riskScore = cxl * controllability
  let residualRiskScore: number | null = null
  let residualRiskLevel: RiskLevel | null = null
  if ((r.residualConsequence ?? 0) > 0 && (r.residualLikelihood ?? 0) > 0) {
    const rc = Number(r.residualConsequence)
    const rl = Number(r.residualLikelihood)
    const resCxl = rc * rl
    residualRiskScore = resCxl * controllability
    residualRiskLevel =
      resCxl <= 3
        ? 'Rendah'
        : resCxl <= 6
          ? 'Moderat'
          : resCxl <= 12
            ? 'Tinggi'
            : 'Ekstrem'
  }
  return { cxl, riskLevel, riskScore, residualRiskScore, residualRiskLevel }
}

const roleMap: Record<string, any> = {
  'Admin Sistem': 'AdminSistem',
  'PIC Mutu': 'PICMutu',
  'PJ Ruangan': 'PJRuangan',
  'Kepala Unit/Instalasi': 'KepalaUnitInstalasi',
  Direktur: 'Direktur',
  'Sub. Komite Peningkatan Mutu': 'SubKomitePeningkatanMutu',
  'Sub. Komite Keselamatan Pasien': 'SubKomiteKeselamatanPasien',
  'Sub. Komite Manajemen Risiko': 'SubKomiteManajemenRisiko',
}
export async function resolveUserFromSession() {
  try {
    const jar = await cookies()
    const raw = jar.get('session')?.value
    if (!raw) return null
    const sess = JSON.parse(raw)
    if (!sess?.email) return null
    let user = await prisma.user.findUnique({ where: { email: sess.email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: sess.name ?? 'Admin Sistem',
          email: sess.email,
          password: sess.password ?? '123456',
          role: roleMap[sess.role as keyof typeof roleMap] ?? 'PICMutu',
          unit: sess.unit ?? null,
        },
      })
    }
    return user
  } catch {
    return null
  }
}

export function toFrontend(r: any) {
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

