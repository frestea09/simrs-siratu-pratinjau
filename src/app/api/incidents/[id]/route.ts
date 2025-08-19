import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const incident = await prisma.incident.findUnique({
    where: { id: params.id },
  })
  if (!incident) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ incident })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const incident = await prisma.incident.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json({ incident })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.incident.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
