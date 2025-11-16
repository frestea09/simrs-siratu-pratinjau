import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const mapCategoryToUi = (c: string): 'INM' | 'IMP-RS' | 'IMPU' | 'SPM' => (c === 'IMP_RS' ? 'IMP-RS' : (c as any))
const mapUnitToUi = (u: string): '%' | 'menit' => (u === 'percent' ? '%' : 'menit')

function toFrontend(i: any) {
  const sub = i.submission
  const prof = sub?.profile
  return {
    id: i.id,
    submissionId: i.submissionId,
    indicator: sub?.name ?? '',
    category: sub ? mapCategoryToUi(sub.category) : 'INM',
    unit: sub?.unit ?? '',
    period: (i.period instanceof Date ? i.period : new Date(i.period)).toISOString(),
    frequency: sub?.frequency ?? 'Bulanan',
    numerator: i.numerator,
    denominator: i.denominator,
    calculationMethod: prof?.calculationMethod ?? 'percentage',
    standard: sub?.standard ?? 0,
    standardUnit: sub ? mapUnitToUi(sub.standardUnit) : '%',
    analysisNotes: i.analysisNotes ?? undefined,
    followUpPlan: i.followUpPlan ?? undefined,
    ratio: (typeof i.ratio === 'number' ? i.ratio.toFixed(1) : String(i.ratio ?? '0.0')),
    status: i.status as 'Memenuhi Standar' | 'Tidak Memenuhi Standar' | 'N/A',
  }
}

function calcRatio(numerator: number, denominator: number, method: 'percentage' | 'average'): number {
  if (!denominator) return 0
  if (method === 'percentage') return (numerator / denominator) * 100
  return numerator / denominator
}

function calcStatus(ratio: number, method: 'percentage' | 'average', standard: number): 'Memenuhi Standar' | 'Tidak Memenuhi Standar' | 'N/A' {
  if (isNaN(ratio)) return 'N/A'
  if (method === 'average') return ratio <= standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar'
  return ratio >= standard ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar'
}

export async function GET() {
  try {
    const items = await prisma.indicator.findMany({
      orderBy: { period: 'desc' },
      include: { submission: { include: { profile: true } } },
    })
    return NextResponse.json(items.map(toFrontend))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch indicators' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { submissionId, period, numerator, denominator, analysisNotes, followUpPlan } = body || {}
    if (!submissionId || !period) return NextResponse.json({ error: 'submissionId and period are required' }, { status: 400 })

    const sub = await prisma.submittedIndicator.findUnique({ where: { id: submissionId }, include: { profile: true } })
    if (!sub) return NextResponse.json({ error: 'Related submitted indicator not found' }, { status: 400 })
    const method = (sub.profile?.calculationMethod ?? 'percentage') as 'percentage' | 'average'
    const ratioNum = calcRatio(Number(numerator), Number(denominator), method)
    const status = calcStatus(ratioNum, method, Number(sub.standard))

    const created = await prisma.indicator.create({
      data: {
        submissionId,
        period: new Date(period),
        numerator: Number(numerator),
        denominator: Number(denominator),
        ratio: Number.isFinite(ratioNum) ? ratioNum : 0,
        status,
        analysisNotes: analysisNotes ?? null,
        followUpPlan: followUpPlan ?? null,
      },
      include: { submission: { include: { profile: true } } },
    })
    return NextResponse.json(toFrontend(created), { status: 201 })
  } catch (e: any) {
    // Handle unique constraint on (submissionId, period)
    const msg = (e?.code === 'P2002') ? 'Capaian untuk periode ini sudah ada' : (e.message || 'Failed to create indicator')
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

