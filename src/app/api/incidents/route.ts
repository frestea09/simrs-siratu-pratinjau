import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const incidents = await prisma.incident.findMany()
  return NextResponse.json({ incidents })
}

export async function POST(request: Request) {
  const data = await request.json()
  const incident = await prisma.incident.create({ data })
  return NextResponse.json({ incident }, { status: 201 })
}
