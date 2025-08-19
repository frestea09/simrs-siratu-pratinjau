import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const risks = await prisma.risk.findMany({
    include: {
      pic: {
        select: { id: true, name: true, email: true, role: true, unit: true },
      },
    },
  })
  return NextResponse.json({ risks })
}

export async function POST(request: Request) {
  const data = await request.json()
  const risk = await prisma.risk.create({ data })
  return NextResponse.json({ risk }, { status: 201 })
}
