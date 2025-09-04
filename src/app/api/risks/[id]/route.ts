import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const mapSourceUiToDb = (s: string): any => {
  switch (s) {
    case 'Laporan Insiden': return 'LaporanInsiden'
    case 'Komplain': return 'Komplain'
    case 'Survey/Ronde': return 'SurveyRonde'
    case 'Rapat/Brainstorming': return 'RapatBrainstorming'
    case 'Investigasi': return 'Investigasi'
    case 'Litigasi': return 'Litigasi'
    case 'External Requirement': return 'ExternalRequirement'
    default: return undefined
  }
}
const mapCategoryUiToDb = (c: string): any => c.replace(' ', '').replace(' ', '')
const mapStatusUiToDb = (s?: string): any => (s === 'In Progress' ? 'InProgress' : (s ?? undefined))

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()

    const data: any = {}
    if ('unit' in body) data.unit = body.unit
    if ('source' in body) data.source = mapSourceUiToDb(body.source)
    if ('description' in body) data.description = body.description
    if ('cause' in body) data.cause = body.cause
    if ('category' in body) data.category = mapCategoryUiToDb(body.category)
    if ('consequence' in body) data.consequence = Number(body.consequence)
    if ('likelihood' in body) data.likelihood = Number(body.likelihood)
    if ('controllability' in body) data.controllability = Number(body.controllability)
    if ('evaluation' in body) data.evaluation = body.evaluation
    if ('actionPlan' in body) data.actionPlan = body.actionPlan
    if ('dueDate' in body) data.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if ('status' in body) data.status = mapStatusUiToDb(body.status)
    if ('residualConsequence' in body) data.residualConsequence = body.residualConsequence ?? null
    if ('residualLikelihood' in body) data.residualLikelihood = body.residualLikelihood ?? null
    if ('reportNotes' in body) data.reportNotes = body.reportNotes ?? null
    if ('pic' in body) {
      const pic = body.pic ? await prisma.user.findFirst({ where: { name: body.pic } }) : null
      data.picId = pic?.id ?? null
    }

    // compute derived fields
    const comp = computeRisk({
      consequence: data.consequence,
      likelihood: data.likelihood,
      controllability: data.controllability,
      residualConsequence: data.residualConsequence,
      residualLikelihood: data.residualLikelihood,
    })
    data.cxl = comp.cxl
    data.riskLevel = comp.riskLevel
    data.riskScore = comp.riskScore
    data.residualRiskScore = comp.residualRiskScore
    data.residualRiskLevel = comp.residualRiskLevel

    const updated = await prisma.risk.update({ where: { id }, data, include: { pic: true } })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update risk' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.risk.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete risk' }, { status: 500 })
  }
}

