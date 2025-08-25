import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ indicators: [] }, { status: 401 })

  const userIsCentral = [
    "ADMIN_SISTEM",
    "DIREKTUR",
    "SUB_KOMITE_PENINGKATAN_MUTU",
  ].includes(user.role)

  const indicators = await prisma.indicator.findMany({
    where: userIsCentral ? {} : { submission: { unit: user.unit || undefined } },
    include: { submission: true },
    orderBy: { period: 'desc' }
  })
  return NextResponse.json({ indicators })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const data = await req.json()

    const period = new Date(data.period)
    const numerator = Number(data.numerator)
    const denominator = Number(data.denominator)

    if (
      !data.submissionId ||
      isNaN(period.getTime()) ||
      isNaN(numerator) ||
      isNaN(denominator)
    ) {
      return NextResponse.json(
        { error: "Invalid indicator data" },
        { status: 400 }
      )
    }

    const indicator = await prisma.indicator.create({
      data: {
        submissionId: data.submissionId,
        period,
        numerator,
        denominator,
        analysisNotes: data.analysisNotes,
        followUpPlan: data.followUpPlan,
      },
      include: { submission: true },
    })
    return NextResponse.json({ indicator })
  } catch (error) {
    console.error("Failed to create indicator", error)
    return NextResponse.json(
      { error: "Failed to create indicator" },
      { status: 500 }
    )
  }
}
