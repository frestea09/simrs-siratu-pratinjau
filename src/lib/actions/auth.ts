
"use server"

import { z } from "zod"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.log("Failed to verify session")
    return null
  }
}

export async function login(formData: FormData) {
  const { email, password } = loginSchema.parse(Object.fromEntries(formData))

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials")
  }

  // Create the session
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId: user.id, expires })

  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true })
  
  return user;
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) })
}

export async function getSession() {
  const session = cookies().get("session")?.value
  return await decrypt(session)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      unit: true,
    }
  })
  return user
}
