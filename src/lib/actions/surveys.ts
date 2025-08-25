"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

function ensureSurveyModel() {
  if (!(prisma as any).surveyResult) {
    throw new Error(
      "SurveyResult model is missing from Prisma client. Run `prisma generate` to update the client."
    )
  }
  return (prisma as any).surveyResult as typeof prisma.surveyResult
}

export async function getSurveys() {
  const survey = ensureSurveyModel()
  return survey.findMany({
    orderBy: { submissionDate: "desc" },
  })
}

export async function getSurvey(id: string) {
  const survey = ensureSurveyModel()
  return survey.findUnique({ where: { id } })
}

export async function createSurvey(data: any) {
  const survey = ensureSurveyModel()
  await survey.create({ data })
  revalidatePath("/dashboard/surveys")
}

export async function updateSurvey(id: string, data: any) {
  const survey = ensureSurveyModel()
  await survey.update({
    where: { id },
    data,
  })
  revalidatePath("/dashboard/surveys")
}

export async function removeSurvey(id: string) {
  const survey = ensureSurveyModel()
  await survey.delete({ where: { id } })
  revalidatePath("/dashboard/surveys")
}
