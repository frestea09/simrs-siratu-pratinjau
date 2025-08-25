import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { surveyResultSchema } from "@/lib/validations/survey"

export async function GET() {
  const surveys = await prisma.survey.findMany({
    orderBy: { submissionDate: "desc" },
  })
  return NextResponse.json(surveys)
}

export async function POST(req: Request) {
  const json = await req.json()
  const data = surveyResultSchema.parse(json)
  const survey = await prisma.survey.create({ data })
  return NextResponse.json(survey)
}

