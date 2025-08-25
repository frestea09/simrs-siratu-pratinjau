import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const submission = await prisma.indicatorSubmission.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json({ submission })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.indicatorSubmission.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
