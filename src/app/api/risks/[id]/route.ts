import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  computeRisk,
  mapCategoryUiToDb,
  mapSourceUiToDb,
  mapStatusUiToDb,
} from '../utils'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
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

    const updated = await prisma.risk.update({
      where: { id },
      data,
      include: { pic: true },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Failed to update risk' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await prisma.risk.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Failed to delete risk' },
      { status: 500 },
    )
  }
}

