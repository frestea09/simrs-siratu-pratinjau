"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()

  if (!email || !password) {
    throw new Error("Email dan password wajib diisi")
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.password !== password) {
    throw new Error("Email atau password salah")
  }

  const cookieStore = await cookies()
  cookieStore.set("session_user_id", user.id, { httpOnly: true })
  return user
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session_user_id")
}
