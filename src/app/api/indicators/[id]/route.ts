import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const indicator = await prisma.indicator.update({
    where: { id: params.id },
    data: {
      period: data.period,
      numerator: data.numerator !== undefined ? parseFloat(data.numerator) : undefined,
      denominator: data.denominator !== undefined ? parseFloat(data.denominator) : undefined,
      analysisNotes: data.analysisNotes,
      followUpPlan: data.followUpPlan,
    },
    include: { submission: true }
  })
  return NextResponse.json({ indicator })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.indicator.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
