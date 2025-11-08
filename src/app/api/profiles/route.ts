import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  mapProfileToFrontend,
  mapStatusToDb,
  mapTargetUnitToDb,
  resolveAuthorIdFromCookie,
} from './utils'
import { eventBus } from '@/lib/realtime-event-bus'

export async function GET() {
  try {
    const items = await prisma.indicatorProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        submittedIndicators: {
          select: {
            id: true,
            status: true,
            achievements: { select: { id: true }, take: 1 },
          },
        },
      },
    })
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
    const mapped = mapProfileToFrontend(created)
    eventBus.emit('profile:created', mapped)
    return NextResponse.json(mapped, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create profile' }, { status: 500 })
  }
}
