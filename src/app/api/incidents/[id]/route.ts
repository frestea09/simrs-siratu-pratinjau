import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()

    const data: any = {}
    const fields = [
      'status','patientName','medicalRecordNumber','careRoom','ageGroup','gender','payer',
      'entryTime','incidentTime','chronology','type','incidentSubject','incidentLocation',
      'incidentLocationOther','relatedUnit','firstAction','firstActionBy','hasHappenedBefore',
      'severity','patientImpact','analysisNotes','followUpPlan'
    ]
    for (const f of fields) if (f in body) data[f] = body[f] ?? null
    if ('entryDate' in body) data.entryDate = body.entryDate ? new Date(body.entryDate) : null
    if ('incidentDate' in body) data.incidentDate = body.incidentDate ? new Date(body.incidentDate) : null

    const updated = await prisma.incident.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update incident' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.incident.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete incident' }, { status: 500 })
  }
}

