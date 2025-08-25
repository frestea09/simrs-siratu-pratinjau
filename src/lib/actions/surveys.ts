"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getSurveys() {
  return prisma.surveyResult.findMany({
    orderBy: { submissionDate: "desc" },
  })
}

export async function getSurvey(id: string) {
  return prisma.surveyResult.findUnique({ where: { id } })
}

export async function createSurvey(data: any) {
  await prisma.surveyResult.create({ data })
  revalidatePath("/dashboard/surveys")
}

export async function updateSurvey(id: string, data: any) {
  await prisma.surveyResult.update({
    where: { id },
    data,
  })
  revalidatePath("/dashboard/surveys")
}

export async function removeSurvey(id: string) {
  await prisma.surveyResult.delete({ where: { id } })
  revalidatePath("/dashboard/surveys")
}
