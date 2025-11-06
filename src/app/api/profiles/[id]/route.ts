import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function mapTargetUnitToDb(u: string): 'percent' | 'minute' {
  return u === '%' ? 'percent' : 'minute'
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()

    const data: any = {}
    const direct = [
      'title',
      'purpose',
      'definition',
      'implication',
      'calculationMethod',
      'numerator',
      'denominator',
      'unitRecap',
      'dataRecording',
      'analysisReporting',
      'area',
      'pic',
      'status',
      'rejectionReason',
      'unit',
    ]
    for (const f of direct) if (f in body) data[f] = body[f]
    if ('target' in body) data.target = Number(body.target)
    if ('targetUnit' in body)
      data.targetUnit = mapTargetUnitToDb(body.targetUnit)
    if ('status' in body) {
      data.status =
        body.status === 'Menunggu Persetujuan'
          ? 'MenungguPersetujuan'
          : body.status
    }

    const updated = await prisma.indicatorProfile.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Failed to update profile' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const linked = await prisma.submittedIndicator.findMany({
      where: { profileId: id },
      select: {
        status: true,
        achievements: { select: { id: true }, take: 1 },
      },
    })
    if (linked.length > 0) {
      const hasAchievements = linked.some(
        (item) => (item.achievements?.length ?? 0) > 0,
      )
      const hasVerifiedSubmission = linked.some(
        (item) => item.status === "Diverifikasi",
      )
      const reason = hasAchievements || hasVerifiedSubmission
        ? "Profil indikator tidak dapat dihapus karena indikator ini sudah diproses dan memiliki data capaian. Silakan nonaktifkan atau edit data tanpa menghapusnya."
        : "Profil indikator tidak dapat dihapus karena sedang digunakan di manajemen indikator. Silakan nonaktifkan atau edit data tanpa menghapusnya."
      return NextResponse.json({ error: reason }, { status: 400 })
    }
    await prisma.indicatorProfile.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return NextResponse.json(
        {
          error:
            "Profil indikator tidak dapat dihapus karena sudah digunakan dalam manajemen indikator atau memiliki capaian yang dilaporkan. Silakan nonaktifkan atau edit data tanpa menghapusnya."
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: e.message || 'Failed to delete profile' },
      { status: 500 },
    )
  }
}
