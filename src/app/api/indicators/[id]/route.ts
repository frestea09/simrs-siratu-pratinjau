import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const data = await req.json()

    const updateData: any = {
      analysisNotes: data.analysisNotes,
      followUpPlan: data.followUpPlan,
    }

    if (data.period) {
      const period = new Date(data.period)
      if (isNaN(period.getTime())) {
        return NextResponse.json({ error: "Invalid period" }, { status: 400 })
      }
      updateData.period = period
    }
    if (data.numerator !== undefined) {
      const numerator = Number(data.numerator)
      if (isNaN(numerator)) {
        return NextResponse.json({ error: "Invalid numerator" }, { status: 400 })
      }
      updateData.numerator = numerator
    }
    if (data.denominator !== undefined) {
      const denominator = Number(data.denominator)
      if (isNaN(denominator)) {
        return NextResponse.json({ error: "Invalid denominator" }, { status: 400 })
      }
      updateData.denominator = denominator
    }

    const indicator = await prisma.indicator.update({
      where: { id: params.id },
      data: updateData,
      include: { submission: true },
    })
    return NextResponse.json({ indicator })
  } catch (error) {
    console.error("Failed to update indicator", error)
    return NextResponse.json(
      { error: "Failed to update indicator" },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    await prisma.indicator.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete indicator", error)
    return NextResponse.json(
      { error: "Failed to delete indicator" },
      { status: 500 }
    )
  }
}
