import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatChronology } from "@/lib/utils"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const incident = await prisma.incident.update({
    where: { id: params.id },
    data: {
      ...data,
      chronology: data.chronology !== undefined ? formatChronology(data.chronology) : undefined,
    },
  })
  return NextResponse.json({ incident })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.incident.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
