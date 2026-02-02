import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { mapRoleDbToUi, mapRoleUiToDb } from "./utils"

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

const resolveUserFromSession = async () => {
  try {
    const jar = await cookies()
    const raw = jar.get("session")?.value
    if (!raw) return null
    const sess = JSON.parse(raw)
    if (!sess?.email) return null
    let user = await prisma.user.findUnique({ where: { email: sess.email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: sess.name ?? "Admin Sistem",
          email: sess.email,
          password: sess.password ?? "123456",
          role: mapRoleUiToDb(sess.role),
          unit: sess.unit ?? null,
        },
      })
    }
    return user
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const items = await prisma.surveyResult.findMany({
      orderBy: { submissionDate: "desc" },
      include: { submittedBy: true },
    })
    return NextResponse.json(items.map(mapSurveyToFrontend))
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch surveys" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.unit) {
      return NextResponse.json({ error: "unit is required" }, { status: 400 })
    }

    const user = await resolveUserFromSession()
    const fallback = await prisma.user.upsert({
      where: { email: "admin@sim.rs" },
      update: {},
      create: {
        name: "Admin Sistem",
        email: "admin@sim.rs",
        password: "123456",
        role: "AdminSistem",
      },
    })

    const created = await prisma.surveyResult.create({
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
        submittedById: user?.id ?? fallback.id,
      },
      include: { submittedBy: true },
    })

    return NextResponse.json(mapSurveyToFrontend(created), { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to save survey" },
      { status: 500 },
    )
  }
}
