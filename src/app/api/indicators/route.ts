import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const indicators = await prisma.indicator.findMany({
    include: {
      submission: true,
    },
  })
  return NextResponse.json({ indicators })
}

export async function POST(request: Request) {
  const data = await request.json()
  const indicator = await prisma.indicator.create({ data })
  return NextResponse.json({ indicator }, { status: 201 })
}
