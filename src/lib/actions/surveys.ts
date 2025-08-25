"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

const prismaAny = prisma as any

export async function getSurveys() {
  return prismaAny.surveyResult.findMany({
    orderBy: { submissionDate: "desc" },
  })
}

export async function createSurvey(data: any) {
  await prismaAny.surveyResult.create({ data })
  revalidatePath("/dashboard/surveys")
}

export async function updateSurvey(id: string, data: any) {
  await prismaAny.surveyResult.update({
    where: { id },
    data,
  })
  revalidatePath("/dashboard/surveys")
}

export async function removeSurvey(id: string) {
  await prismaAny.surveyResult.delete({ where: { id } })
  revalidatePath("/dashboard/surveys")
}
