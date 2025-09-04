import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.systemLog.findMany({ orderBy: { timestamp: 'desc' } })
    return NextResponse.json(items.map(l => ({
      id: l.id,
      timestamp: (l.timestamp instanceof Date ? l.timestamp : new Date(l.timestamp)).toISOString(),
      user: l.user,
      action: l.action,
      details: l.details,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch logs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.user || !body?.action || !body?.details) {
      return NextResponse.json({ error: 'user, action, details are required' }, { status: 400 })
    }
    const created = await prisma.systemLog.create({ data: {
      user: body.user,
      action: body.action,
      details: body.details,
    }})
    return NextResponse.json({
      id: created.id,
      timestamp: (created.timestamp instanceof Date ? created.timestamp : new Date(created.timestamp)).toISOString(),
      user: created.user,
      action: created.action,
      details: created.details,
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to write log' }, { status: 500 })
  }
}

