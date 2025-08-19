import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const submissions = await prisma.indicatorSubmission.findMany()
  return NextResponse.json({ submissions })
}

export async function POST(request: Request) {
  const data = await request.json()
  const submission = await prisma.indicatorSubmission.create({
    data: {
      ...data,
      standard: data.standard ? parseFloat(data.standard) : undefined,
    },
  })
  return NextResponse.json({ submission }, { status: 201 })
}
