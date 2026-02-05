import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const units = await prisma.unit.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(
      units.map((unit: any) => ({ id: unit.id, name: unit.name }))
    )
  } catch (error: any) {
    const message =
      error instanceof Error
        ? error.message
        : 'Gagal memuat data unit.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body?.name ?? '').trim()
    if (!name) {
      return NextResponse.json(
        { error: 'Nama unit harus diisi.' },
        { status: 400 },
      )
    }

    const created = await prisma.unit.create({ data: { name } })
    return NextResponse.json(
      { id: created.id, name: created.name },
      { status: 201 },
    )
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Nama unit sudah digunakan.' },
        { status: 409 },
      )
    }
    const message =
      error instanceof Error ? error.message : 'Gagal menyimpan unit.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
