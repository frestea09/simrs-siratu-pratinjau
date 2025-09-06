import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  computeRisk,
  mapCategoryUiToDb,
  mapSourceUiToDb,
  mapStatusUiToDb,
  resolveUserFromSession,
  toFrontend,
} from './utils'

export async function GET() {
  try {
    const items = await prisma.risk.findMany({
      orderBy: { createdAt: 'desc' },
      include: { pic: true },
    })
    return NextResponse.json(items.map(toFrontend))
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Failed to fetch risks' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const author = await resolveUserFromSession()
    const authorId =
      author?.id ??
      (
        await prisma.user.upsert({
          where: { email: 'admin@sim.rs' },
          update: {},
          create: {
            name: 'Admin Sistem',
            email: 'admin@sim.rs',
            password: '123456',
            role: 'AdminSistem',
          },
        })
      ).id

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
    return NextResponse.json(
      { error: e.message || 'Failed to create risk' },
      { status: 500 }
    )
  }
}

