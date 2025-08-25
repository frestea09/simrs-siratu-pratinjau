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

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    unit: user.unit ?? null,
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
  cookieStore.set("session", JSON.stringify(sessionUser), {
    expires,
    httpOnly: true,
  })

  return sessionUser
}

export async function logout() {
  // Destroy the session
  const cookieStore = await cookies()
  cookieStore.set("session", "", { expires: new Date(0) })
}

export async function getSession() {
  const cookieStore = await cookies()
  return cookieStore.get("session")?.value
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  try {
    return JSON.parse(session)
  } catch (error) {
    return null
  }
}
