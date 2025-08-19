import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const indicator = await prisma.indicator.findUnique({
    where: { id: params.id },
    include: { submission: true },
  })
  if (!indicator) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ indicator })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const indicator = await prisma.indicator.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json({ indicator })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.indicator.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
