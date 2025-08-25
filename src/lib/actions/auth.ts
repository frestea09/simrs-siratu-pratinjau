
"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { users } from "@/store/user-store" // Menggunakan data user dari store

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(formData: FormData) {
  const { email, password } = loginSchema.parse(Object.fromEntries(formData))

  // Mencari pengguna dari data mock di user-store
  const user = users.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // Menyiapkan data sesi tanpa password
  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    unit: user.unit ?? null,
  }

  // Menyimpan sesi di cookies
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  cookies().set("session", JSON.stringify(sessionUser), {
    expires,
    httpOnly: true,
  })

  return sessionUser
}

export async function logout() {
  // Menghapus sesi
  cookies().set("session", "", { expires: new Date(0) })
}

export async function getSession() {
  return cookies().get("session")?.value
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
