import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const risk = await prisma.risk.findUnique({
    where: { id: params.id },
    include: {
      pic: {
        select: { id: true, name: true, email: true, role: true, unit: true },
      },
    },
  })
  if (!risk) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ risk })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const risk = await prisma.risk.update({
      where: { id: params.id },
      data: {
        unit: data.unit,
        source: data.source,
        description: data.description,
        cause: data.cause,
        category: data.category,
        consequence: data.consequence ? Number(data.consequence) : undefined,
        likelihood: data.likelihood ? Number(data.likelihood) : undefined,
        controllability: data.controllability
          ? Number(data.controllability)
          : undefined,
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
        reportNotes: data.reportNotes,
      },
    })
    return NextResponse.json({ risk })
  } catch (error) {
    console.error("Failed to update risk", error)
    return NextResponse.json({ error: "Failed to update risk" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.risk.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
