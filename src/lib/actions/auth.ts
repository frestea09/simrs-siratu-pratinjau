
"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import type { User, UserRole } from "@/store/user-store.tsx"
import { prisma } from "@/lib/prisma"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const mapRoleDbToUi = (role: string): UserRole => {
  switch (role) {
    case "AdminSistem":
      return "Admin Sistem"
    case "PICMutu":
      return "PIC Mutu"
    case "PJRuangan":
      return "PJ Ruangan"
    case "KepalaUnitInstalasi":
      return "Kepala Unit/Instalasi"
    case "Direktur":
      return "Direktur"
    case "SubKomitePeningkatanMutu":
      return "Sub. Komite Peningkatan Mutu"
    case "SubKomiteKeselamatanPasien":
      return "Sub. Komite Keselamatan Pasien"
    case "SubKomiteManajemenRisiko":
      return "Sub. Komite Manajemen Risiko"
    case "PetugasPelaporan":
      return "Petugas Pelaporan"
    default:
      return role as UserRole
  }
}

export async function login(formData: FormData) {
  const { email, password } = loginSchema.parse(Object.fromEntries(formData))

  const dbUser = await prisma.user.findUnique({ where: { email } })
  const user = dbUser
    ? {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        password: dbUser.password,
        role: mapRoleDbToUi(dbUser.role),
        unit: dbUser.unit ?? undefined,
      }
    : null

  if (!user || user.password !== password) {
    throw new Error("Invalid credentials")
  }

  // Buat objek sesi tanpa menyertakan password
  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    unit: user.unit ?? null,
    password: user.password, // Menyertakan password di sini untuk disimpan di store klien
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
  cookieStore.set("session", JSON.stringify(sessionUser), { expires, httpOnly: true })

  return sessionUser
}

export async function logout() {
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
