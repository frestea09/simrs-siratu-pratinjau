import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const submission = await prisma.indicatorSubmission.findUnique({
    where: { id: params.id },
  })
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ submission })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const submission = await prisma.indicatorSubmission.update({
    where: { id: params.id },
    data: {
      ...data,
      standard: data.standard ? parseFloat(data.standard) : undefined,
    },
  })
  return NextResponse.json({ submission })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.indicatorSubmission.delete({ where: { id: params.id } })
  return NextResponse.json({})
}
