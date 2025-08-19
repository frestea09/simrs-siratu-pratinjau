import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fromDbStandardUnit } from "@/lib/standard-unit"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const indicator = await prisma.indicator.findUnique({
    where: { id: params.id },
    include: { submission: true },
  })
  if (!indicator) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({
    indicator: {
      ...indicator,
      submission: {
        ...indicator.submission,
        standardUnit: fromDbStandardUnit(indicator.submission.standardUnit),
      },
    },
  })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const indicator = await prisma.indicator.update({
    where: { id: params.id },
    data: {
      period: data.period,
      numerator: data.numerator ? parseFloat(data.numerator) : undefined,
      denominator: data.denominator ? parseFloat(data.denominator) : undefined,
      analysisNotes: data.analysisNotes,
      followUpPlan: data.followUpPlan,
    },
  })
  return NextResponse.json({ indicator })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.indicator.delete({ where: { id: params.id } })
  return NextResponse.json({})
}
