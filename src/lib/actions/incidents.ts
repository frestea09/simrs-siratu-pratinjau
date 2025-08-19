"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function addIncident(data: any) {
  const incident = await prisma.incident.create({ data })
  revalidatePath("/dashboard/incidents")
  return incident
}

export async function updateIncident(id: string, data: any) {
  const incident = await prisma.incident.update({ where: { id }, data })
  revalidatePath("/dashboard/incidents")
  return incident
}

export async function removeIncident(id: string) {
  await prisma.incident.delete({ where: { id } })
  revalidatePath("/dashboard/incidents")
}

