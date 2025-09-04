import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()
    const current = await prisma.indicator.findUnique({ where: { id }, include: { submission: { include: { profile: true } } } })
    if (!current) return NextResponse.json({ error: 'Indicator not found' }, { status: 404 })
    const method = (current.submission?.profile?.calculationMethod ?? 'percentage') as 'percentage' | 'average'
    const standard = Number(current.submission?.standard ?? 0)
    const numerator = ('numerator' in body) ? Number(body.numerator) : current.numerator
    const denominator = ('denominator' in body) ? Number(body.denominator) : current.denominator
    const ratioNum = calcRatio(numerator, denominator, method)
    const status = calcStatus(ratioNum, method, standard)

    const data: any = {
      numerator,
      denominator,
      ratio: Number.isFinite(ratioNum) ? ratioNum : 0,
      status,
    }
    if ('period' in body) data.period = new Date(body.period)
    if ('analysisNotes' in body) data.analysisNotes = body.analysisNotes ?? null
    if ('followUpPlan' in body) data.followUpPlan = body.followUpPlan ?? null

    const updated = await prisma.indicator.update({ where: { id }, data, include: { submission: { include: { profile: true } } } })
    const sub = updated.submission
    const prof = sub?.profile
    const mapUnitToUi = (u: string): '%' | 'menit' => (u === 'percent' ? '%' : 'menit')
    const mapCategoryToUi = (c: string): 'INM' | 'IMP-RS' | 'IMPU' | 'SPM' => (c === 'IMP_RS' ? 'IMP-RS' : (c as any))
    return NextResponse.json({
      id: updated.id,
      submissionId: updated.submissionId,
      indicator: sub?.name ?? '',
      category: sub ? mapCategoryToUi(sub.category) : 'INM',
      unit: sub?.unit ?? '',
      period: (updated.period instanceof Date ? updated.period : new Date(updated.period)).toISOString(),
      frequency: sub?.frequency ?? 'Bulanan',
      numerator: updated.numerator,
      denominator: updated.denominator,
      calculationMethod: prof?.calculationMethod ?? 'percentage',
      standard: sub?.standard ?? 0,
      standardUnit: sub ? mapUnitToUi(sub.standardUnit) : '%',
      analysisNotes: updated.analysisNotes ?? undefined,
      followUpPlan: updated.followUpPlan ?? undefined,
      ratio: (typeof updated.ratio === 'number' ? updated.ratio.toFixed(1) : String(updated.ratio ?? '0.0')),
      status: updated.status as any,
    })
  } catch (e: any) {
    const msg = (e?.code === 'P2002') ? 'Capaian untuk periode ini sudah ada' : (e.message || 'Failed to update indicator')
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.indicator.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete indicator' }, { status: 500 })
  }
}
