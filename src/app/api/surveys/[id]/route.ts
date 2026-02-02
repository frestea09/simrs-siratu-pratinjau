import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mapRoleDbToUi } from "../utils"

const mapSurveyToFrontend = (survey: any) => ({
  id: survey.id,
  submissionDate: survey.submissionDate instanceof Date
    ? survey.submissionDate.toISOString()
    : new Date(survey.submissionDate).toISOString(),
  unit: survey.unit,
  scores: survey.answersJson?.scores ?? {},
  totalScore: survey.totalScore,
  positivePercentage: survey.positivePercentage,
  neutralPercentage: survey.neutralPercentage,
  negativePercentage: survey.negativePercentage,
  answers: survey.answersJson?.answers ?? {},
  submittedById: survey.submittedById ?? undefined,
  submittedByName: survey.submittedBy?.name ?? undefined,
  submittedByRole: mapRoleDbToUi(survey.submittedBy?.role),
  locked: false,
  lockedReason: undefined,
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()

    const updated = await prisma.surveyResult.update({
      where: { id },
      data: {
        unit: body.unit,
        totalScore: Number(body.totalScore ?? 0),
        positivePercentage: Number(body.positivePercentage ?? 0),
        neutralPercentage: Number(body.neutralPercentage ?? 0),
        negativePercentage: Number(body.negativePercentage ?? 0),
        answersJson: {
          answers: body.answers ?? {},
          scores: body.scores ?? {},
        },
      },
      include: { submittedBy: true },
    })

    return NextResponse.json(mapSurveyToFrontend(updated))
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update survey" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await prisma.surveyResult.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete survey" },
      { status: 500 },
    )
  }
}
