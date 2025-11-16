import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const name = (body?.name ?? '').trim()
    if (!name) {
      return NextResponse.json(
        { error: 'Nama unit harus diisi.' },
        { status: 400 },
      )
    }
    const updated = await prisma.unit.update({ where: { id }, data: { name } })
    return NextResponse.json({ id: updated.id, name: updated.name })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Nama unit sudah digunakan.' },
        { status: 409 },
      )
    }
    const message =
      error instanceof Error ? error.message : 'Gagal memperbarui unit.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await prisma.unit.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    const message =
      error instanceof Error ? error.message : 'Gagal menghapus unit.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
