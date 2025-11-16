import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const units = await prisma.unit.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(
      units.map((unit) => ({ id: unit.id, name: unit.name }))
    )
  } catch (error: any) {
    const message =
      error instanceof Error
        ? error.message
        : 'Gagal memuat data unit.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
