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
  const data = await req.json()
  const indicator = await prisma.indicator.create({
    data: {
      submissionId: data.submissionId,
      period: data.period,
      numerator: parseFloat(data.numerator),
      denominator: parseFloat(data.denominator),
      analysisNotes: data.analysisNotes,
      followUpPlan: data.followUpPlan,
    },
    include: { submission: true }
  })
  return NextResponse.json({ indicator })
}
