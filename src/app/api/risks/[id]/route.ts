import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    const data = await req.json()
    const risk = await prisma.risk.update({
      where: { id: params.id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        residualConsequence: data.residualConsequence ?? undefined,
        residualLikelihood: data.residualLikelihood ?? undefined,
      },
    })
    return NextResponse.json({ risk })
  } catch (error) {
    console.error("Failed to update risk", error)
    return NextResponse.json({ error: "Failed to update risk" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  try {
    await prisma.risk.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete risk", error)
    return NextResponse.json({ error: "Failed to delete risk" }, { status: 500 })
  }
}
