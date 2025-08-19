"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

function parseIntField(value: any) {
  return typeof value === "number" ? value : parseInt(value)
}

export async function addRisk(data: any) {
  const risk = await prisma.risk.create({
    data: {
      ...data,
      consequence: parseIntField(data.consequence),
      likelihood: parseIntField(data.likelihood),
      controllability: parseIntField(data.controllability),
      residualConsequence: data.residualConsequence ? parseIntField(data.residualConsequence) : undefined,
      residualLikelihood: data.residualLikelihood ? parseIntField(data.residualLikelihood) : undefined,
    }
  })
  revalidatePath("/dashboard/risks")
  return risk
}

export async function updateRisk(id: string, data: any) {
  const risk = await prisma.risk.update({
    where: { id },
    data: {
      ...data,
      consequence: parseIntField(data.consequence),
      likelihood: parseIntField(data.likelihood),
      controllability: parseIntField(data.controllability),
      residualConsequence: data.residualConsequence ? parseIntField(data.residualConsequence) : undefined,
      residualLikelihood: data.residualLikelihood ? parseIntField(data.residualLikelihood) : undefined,
    }
  })
  revalidatePath("/dashboard/risks")
  return risk
}

export async function removeRisk(id: string) {
  await prisma.risk.delete({ where: { id } })
  revalidatePath("/dashboard/risks")
}

