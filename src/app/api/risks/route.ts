import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ risks: [] }, { status: 401 })

  const userIsCentral = ["ADMIN_SISTEM", "DIREKTUR", "SUB_KOMITE_MANAJEMEN_RISIKO"].includes(user.role)

  const risks = await prisma.risk.findMany({
    where: userIsCentral ? {} : { unit: user.unit || undefined },
    include: { pic: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ risks })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const data = await req.json()
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
        status: data.status,
        residualConsequence: data.residualConsequence ?? undefined,
        residualLikelihood: data.residualLikelihood ?? undefined,
        reportNotes: data.reportNotes ?? undefined,
      },
    })
    return NextResponse.json({ risk })
  } catch (error) {
    console.error("Failed to create risk", error)
    return NextResponse.json({ error: "Failed to create risk" }, { status: 500 })
  }
}
