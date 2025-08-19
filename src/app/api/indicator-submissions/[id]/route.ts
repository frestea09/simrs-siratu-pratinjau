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
  const data = await request.json()
  const submission = await prisma.indicatorSubmission.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json({ submission })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.indicatorSubmission.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
