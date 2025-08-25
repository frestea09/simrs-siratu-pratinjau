import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { surveyResultSchema } from "@/lib/validations/survey"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const survey = await prisma.survey.findUnique({ where: { id: params.id } })
  if (!survey) return NextResponse.json({}, { status: 404 })
  return NextResponse.json(survey)
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json()
  const data = surveyResultSchema.parse(json)
  const survey = await prisma.survey.update({ where: { id: params.id }, data })
  return NextResponse.json(survey)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.survey.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

