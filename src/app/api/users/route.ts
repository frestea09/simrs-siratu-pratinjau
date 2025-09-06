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

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: mapRoleDbToUi(u.role),
      unit: u.unit ?? undefined,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.name || !body?.email || !body?.password || !body?.role) {
      return NextResponse.json({ error: 'name, email, password, role are required' }, { status: 400 })
    }
    const created = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password, // demo plaintext
        role: mapRoleUiToDb(body.role),
        unit: body.unit ?? null,
      }
    })
    return NextResponse.json({
      id: created.id,
      name: created.name,
      email: created.email,
      role: mapRoleDbToUi(created.role),
      unit: created.unit ?? undefined,
    }, { status: 201 })
  } catch (e: any) {
    // Unique email violation
    const msg = e?.code === 'P2002' ? 'Email sudah digunakan' : (e.message || 'Failed to create user')
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

