import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const risk = await prisma.risk.findUnique({ where: { id: params.id } })
  if (!risk) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ risk })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const risk = await prisma.risk.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json({ risk })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.risk.delete({ where: { id: params.id } })
  return NextResponse.json({})
}
