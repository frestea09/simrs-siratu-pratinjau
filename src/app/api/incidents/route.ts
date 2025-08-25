import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"
import { formatChronology } from "@/lib/utils"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ incidents: [] }, { status: 401 })

  const userIsCentral = [
    "ADMIN_SISTEM",
    "DIREKTUR",
    "SUB_KOMITE_KESELAMATAN_PASIEN",
  ].includes(user.role)

  const incidents = await prisma.incident.findMany({
    where: userIsCentral ? {} : { relatedUnit: user.unit || undefined },
    orderBy: { date: "desc" },
  })

  return NextResponse.json({ incidents })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const data = await req.json()
    const incident = await prisma.incident.create({
      data: {
        ...data,
        chronology: data.chronology ? formatChronology(data.chronology) : null,
      },
    })

    return NextResponse.json({ incident })
  } catch (error) {
    console.error("Failed to create incident", error)
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    )
  }
}
