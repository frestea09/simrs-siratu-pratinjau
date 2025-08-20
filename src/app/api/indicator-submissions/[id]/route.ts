import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const submission = await prisma.indicatorSubmission.findUnique({
    where: { id: params.id },
    include: {
      submittedBy: {
        select: { id: true, name: true, email: true, role: true, unit: true },
      },
    },
  })
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ submission })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const submission = await prisma.indicatorSubmission.update({
      where: { id: params.id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        unit: data.unit,
        frequency: data.frequency,
        status: data.status,
        standard: data.standard ? Number(data.standard) : undefined,
        standardUnit: data.standardUnit,
        rejectionReason: data.rejectionReason,
      },
    })
    return NextResponse.json({ submission })
  } catch (error) {
    console.error("Failed to update indicator submission", error)
    return NextResponse.json(
      { error: "Failed to update indicator submission" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.indicatorSubmission.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
