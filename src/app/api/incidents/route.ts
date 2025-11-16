import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Map Prisma Incident to frontend Incident shape
function mapIncident(i: any) {
  const dateSrc = i.incidentDate ?? i.reportDate
  return {
    id: i.id,
    date: (dateSrc instanceof Date ? dateSrc : new Date(dateSrc)).toISOString(),
    status: i.status,
    patientName: i.patientName ?? undefined,
    medicalRecordNumber: i.medicalRecordNumber ?? undefined,
    careRoom: i.careRoom ?? undefined,
    ageGroup: i.ageGroup ?? undefined,
    gender: i.gender ?? undefined,
    payer: i.payer ?? undefined,
    entryDate: i.entryDate ? new Date(i.entryDate).toISOString() : undefined,
    entryTime: i.entryTime ?? undefined,
    incidentDate: i.incidentDate ? new Date(i.incidentDate).toISOString() : undefined,
    incidentTime: i.incidentTime ?? undefined,
    chronology: i.chronology ?? undefined,
    type: i.type,
    incidentSubject: i.incidentSubject ?? undefined,
    incidentLocation: i.incidentLocation ?? undefined,
    incidentLocationOther: i.incidentLocationOther ?? undefined,
    relatedUnit: i.relatedUnit ?? undefined,
    firstAction: i.firstAction ?? undefined,
    firstActionBy: i.firstActionBy ?? undefined,
    hasHappenedBefore: i.hasHappenedBefore ?? undefined,
    severity: i.severity,
    patientImpact: i.patientImpact ?? undefined,
    analysisNotes: i.analysisNotes ?? undefined,
    followUpPlan: i.followUpPlan ?? undefined,
  }
}

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.incident.findMany({ orderBy: { reportDate: 'desc' } })
    return NextResponse.json(items.map(mapIncident))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch incidents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Basic sanitation: ensure required enums are present
    if (!body?.type || !body?.severity) {
      return NextResponse.json({ error: 'type and severity are required' }, { status: 400 })
    }

    const created = await prisma.incident.create({
      data: {
        status: 'Investigasi',
        // patient & meta
        patientName: body.patientName ?? null,
        medicalRecordNumber: body.medicalRecordNumber ?? null,
        careRoom: body.careRoom ?? null,
        ageGroup: body.ageGroup ?? null,
        gender: body.gender ?? null,
        payer: body.payer ?? null,
        entryDate: body.entryDate ? new Date(body.entryDate) : null,
        entryTime: body.entryTime ?? null,
        incidentDate: body.incidentDate ? new Date(body.incidentDate) : null,
        incidentTime: body.incidentTime ?? null,
        chronology: body.chronology ?? null,
        type: body.type,
        incidentSubject: body.incidentSubject ?? null,
        incidentLocation: body.incidentLocation ?? null,
        incidentLocationOther: body.incidentLocationOther ?? null,
        relatedUnit: body.relatedUnit ?? null,
        firstAction: body.firstAction ?? null,
        firstActionBy: body.firstActionBy ?? null,
        hasHappenedBefore: body.hasHappenedBefore ?? null,
        severity: body.severity,
        patientImpact: body.patientImpact ?? null,
        analysisNotes: body.analysisNotes ?? null,
        followUpPlan: body.followUpPlan ?? null,
      },
    })
    return NextResponse.json(mapIncident(created), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create incident' }, { status: 500 })
  }
}

