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
  const data = await request.json()
  const submission = await prisma.indicatorSubmission.create({ data })
  return NextResponse.json({ submission }, { status: 201 })
}
