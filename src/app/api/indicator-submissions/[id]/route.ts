import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { toDbStandardUnit, fromDbStandardUnit } from "@/lib/standard-unit"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const submission = await prisma.indicatorSubmission.findUnique({
    where: { id: params.id },
  })
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({
    submission: { ...submission, standardUnit: fromDbStandardUnit(submission.standardUnit) },
  })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const submission = await prisma.indicatorSubmission.update({
    where: { id: params.id },
    data: {
      ...data,
      standard: data.standard ? parseFloat(data.standard) : undefined,
      standardUnit: toDbStandardUnit(data.standardUnit),
    },
  })
  return NextResponse.json({
    submission: { ...submission, standardUnit: fromDbStandardUnit(submission.standardUnit) },
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.indicatorSubmission.delete({ where: { id: params.id } })
  return NextResponse.json({})
}
