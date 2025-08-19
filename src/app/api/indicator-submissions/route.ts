import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const submissions = await prisma.indicatorSubmission.findMany({
    include: {
      submittedBy: {
        select: { id: true, name: true, email: true, role: true, unit: true },
      },
    },
  })
  return NextResponse.json({ submissions })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const submission = await prisma.indicatorSubmission.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        unit: data.unit,
        frequency: data.frequency,
        status: data.status,
        standard: Number(data.standard),
        standardUnit: data.standardUnit,
        rejectionReason: data.rejectionReason || undefined,
        submittedById: data.submittedById,
      },
    })
    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error("Failed to create indicator submission", error)
    return NextResponse.json(
      { error: "Failed to create indicator submission" },
      { status: 500 }
    )
  }
}
