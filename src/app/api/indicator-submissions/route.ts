import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { toDbStandardUnit, fromDbStandardUnit } from "@/lib/standard-unit"

export async function GET() {
  const submissions = await prisma.indicatorSubmission.findMany()
  return NextResponse.json({
    submissions: submissions.map((s) => ({
      ...s,
      standardUnit: fromDbStandardUnit(s.standardUnit),
    })),
  })
}

export async function POST(request: Request) {
  const data = await request.json()
  const submission = await prisma.indicatorSubmission.create({
    data: {
      ...data,
      standard: data.standard ? parseFloat(data.standard) : undefined,
      standardUnit: toDbStandardUnit(data.standardUnit),
    },
  })
  return NextResponse.json(
    { submission: { ...submission, standardUnit: fromDbStandardUnit(submission.standardUnit) } },
    { status: 201 }
  )
}
