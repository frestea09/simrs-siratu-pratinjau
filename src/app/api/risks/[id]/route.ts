import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const risk = await prisma.risk.findUnique({
    where: { id: params.id },
    include: {
      pic: {
        select: { id: true, name: true, email: true, role: true, unit: true },
      },
    },
  })
  if (!risk) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ risk })
}

export async function PATCH(
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
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.risk.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
