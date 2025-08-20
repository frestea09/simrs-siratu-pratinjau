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
  try {
    const data = await request.json()
    const risk = await prisma.risk.create({
      data: {
        unit: data.unit,
        source: data.source,
        description: data.description,
        cause: data.cause,
        category: data.category,
        consequence: Number(data.consequence),
        likelihood: Number(data.likelihood),
        controllability: Number(data.controllability),
        evaluation: data.evaluation,
        actionPlan: data.actionPlan,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        picId: data.picId || undefined,
        status: data.status,
        residualConsequence: data.residualConsequence
          ? Number(data.residualConsequence)
          : undefined,
        residualLikelihood: data.residualLikelihood
          ? Number(data.residualLikelihood)
          : undefined,
        reportNotes: data.reportNotes || undefined,
      },
    })
    return NextResponse.json({ risk }, { status: 201 })
  } catch (error) {
    console.error("Failed to create risk", error)
    return NextResponse.json({ error: "Failed to create risk" }, { status: 500 })
  }
}
