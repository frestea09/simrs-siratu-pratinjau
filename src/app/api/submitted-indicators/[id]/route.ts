import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const mapCategoryToDb = (c: string): 'INM' | 'IMP_RS' | 'IMPU' | 'SPM' => (c === 'IMP-RS' ? 'IMP_RS' : (c as any))
const mapFreqToDb = (f: string): 'Harian' | 'Mingguan' | 'Bulanan' | 'Triwulan' | 'Tahunan' => (f as any)
const mapUnitToDb = (u: string): 'percent' | 'minute' => (u === '%' ? 'percent' : 'minute')

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: any = {}
    if ('name' in body) data.name = body.name
    if ('category' in body) data.category = mapCategoryToDb(body.category)
    if ('description' in body) data.description = body.description ?? ''
    if ('unit' in body) data.unit = body.unit
    if ('frequency' in body) data.frequency = mapFreqToDb(body.frequency)
    if ('standard' in body) data.standard = Number(body.standard)
    if ('standardUnit' in body) data.standardUnit = mapUnitToDb(body.standardUnit)
    if ('rejectionReason' in body) data.rejectionReason = body.rejectionReason ?? null
    if ('status' in body) data.status = body.status === 'Menunggu Persetujuan' ? 'MenungguPersetujuan' : body.status
    const updated = await prisma.submittedIndicator.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update submitted indicator' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await prisma.$transaction([
      prisma.indicator.deleteMany({ where: { submissionId: id } }),
      prisma.submittedIndicator.delete({ where: { id } }),
    ])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete submitted indicator' }, { status: 500 })
  }
}

