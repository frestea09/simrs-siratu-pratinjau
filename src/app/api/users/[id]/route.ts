import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const mapRoleUiToDb = (r: string): any => {
  switch (r) {
    case 'Admin Sistem': return 'AdminSistem'
    case 'PIC Mutu': return 'PICMutu'
    case 'PJ Ruangan': return 'PJRuangan'
    case 'Kepala Unit/Instalasi': return 'KepalaUnitInstalasi'
    case 'Direktur': return 'Direktur'
    case 'Sub. Komite Peningkatan Mutu': return 'SubKomitePeningkatanMutu'
    case 'Sub. Komite Keselamatan Pasien': return 'SubKomiteKeselamatanPasien'
    case 'Sub. Komite Manajemen Risiko': return 'SubKomiteManajemenRisiko'
    default: return 'PICMutu'
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: any = {}
    if ('name' in body) data.name = body.name
    if ('email' in body) data.email = body.email
    if ('password' in body) data.password = body.password
    if ('role' in body) data.role = mapRoleUiToDb(body.role)
    if ('unit' in body) data.unit = body.unit ?? null
    const updated = await prisma.user.update({ where: { id }, data })
    const mapRoleDbToUi = (r: string): any => {
      switch (r) {
        case 'AdminSistem': return 'Admin Sistem'
        case 'PICMutu': return 'PIC Mutu'
        case 'PJRuangan': return 'PJ Ruangan'
        case 'KepalaUnitInstalasi': return 'Kepala Unit/Instalasi'
        case 'Direktur': return 'Direktur'
        case 'SubKomitePeningkatanMutu': return 'Sub. Komite Peningkatan Mutu'
        case 'SubKomiteKeselamatanPasien': return 'Sub. Komite Keselamatan Pasien'
        case 'SubKomiteManajemenRisiko': return 'Sub. Komite Manajemen Risiko'
        default: return r
      }
    }
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: mapRoleDbToUi(updated.role),
      unit: updated.unit ?? undefined,
    })
  } catch (e: any) {
    const msg = e?.code === 'P2002' ? 'Email sudah digunakan' : (e.message || 'Failed to update user')
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete user' }, { status: 500 })
  }
}
