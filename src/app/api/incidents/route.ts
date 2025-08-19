import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const incidents = await prisma.incident.findMany()
  return NextResponse.json({ incidents })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const incident = await prisma.incident.create({
      data: {
        ...data,
        entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
        incidentDate: data.incidentDate ? new Date(data.incidentDate) : undefined,
      },
    })
    return NextResponse.json({ incident }, { status: 201 })
  } catch (error) {
    console.error("Failed to create incident", error)
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 })
  }
}
