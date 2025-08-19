
"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(formData: FormData) {
  const { email, password } = loginSchema.parse(Object.fromEntries(formData))

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials")
  }

  // Create the session
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  cookies().set("session", user.id, { expires, httpOnly: true })
  
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) })
}

export async function getSession() {
  return cookies().get("session")?.value
}

export async function getCurrentUser() {
  const userId = await getSession()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      unit: true,
    },
  })
  return user
}
