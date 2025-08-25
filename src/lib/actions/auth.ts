
"use server"

import { z } from "zod"
import { cookies } from "next/headers"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(formData: FormData) {
  const { email, password } = loginSchema.parse(Object.fromEntries(formData))

  // This is a mock login. In a real app, you'd validate against a database.
  if (password !== "123456") {
      throw new Error("Invalid credentials")
  }
  
  const mockUser = {
      id: `user_${email}`,
      email: email,
      name: 'Mock User',
      role: 'Admin Sistem'
  }


  // Create the session
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  cookies().set("session", JSON.stringify(mockUser), { expires, httpOnly: true })
  
  return mockUser
}

export async function logout() {
  // Destroy the session
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
