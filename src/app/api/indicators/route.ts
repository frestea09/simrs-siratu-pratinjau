import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fromDbStandardUnit } from "@/lib/standard-unit"

export async function GET() {
  const indicators = await prisma.indicator.findMany({
    include: { submission: true },
  })
  return NextResponse.json({
    indicators: indicators.map((i) => ({
      ...i,
      submission: {
        ...i.submission,
        standardUnit: fromDbStandardUnit(i.submission.standardUnit),
      },
    })),
  })
}

export async function POST(request: Request) {
  const data = await request.json()
  const indicator = await prisma.indicator.create({
    data: {
      submissionId: data.submissionId,
      period: data.period,
      numerator: data.numerator ? parseFloat(data.numerator) : undefined,
      denominator: data.denominator ? parseFloat(data.denominator) : undefined,
      analysisNotes: data.analysisNotes,
      followUpPlan: data.followUpPlan,
    },
  })
  return NextResponse.json({ indicator }, { status: 201 })
}
