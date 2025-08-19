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
  try {
    const data = await request.json()
    const indicator = await prisma.indicator.update({
      where: { id: params.id },
      data: {
        period: data.period ? new Date(data.period) : undefined,
        numerator: data.numerator ? Number(data.numerator) : undefined,
        denominator: data.denominator ? Number(data.denominator) : undefined,
        analysisNotes: data.analysisNotes,
        followUpPlan: data.followUpPlan,
      },
    })
    return NextResponse.json({ indicator })
  } catch (error) {
    console.error("Failed to update indicator", error)
    return NextResponse.json({ error: "Failed to update indicator" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.indicator.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
