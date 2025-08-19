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
  try {
    const data = await request.json()
    const indicator = await prisma.indicator.create({
      data: {
        submissionId: data.submissionId,
        period: new Date(data.period),
        numerator: Number(data.numerator),
        denominator: Number(data.denominator),
        analysisNotes: data.analysisNotes || undefined,
        followUpPlan: data.followUpPlan || undefined,
      },
    })
    return NextResponse.json({ indicator }, { status: 201 })
  } catch (error) {
    console.error("Failed to create indicator", error)
    return NextResponse.json({ error: "Failed to create indicator" }, { status: 500 })
  }
}
