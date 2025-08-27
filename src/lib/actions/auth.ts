
"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import type { User, UserRole } from "@/store/user-store.tsx"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Data pengguna demo sekarang dikelola di sisi server untuk otentikasi.
const demoUsers: User[] = [
  { id: "user-1", name: "Admin Sistem", email: "admin@sim.rs", password: "123456", role: "Admin Sistem" },
  { id: "user-2", name: "Delina (PIC Mutu)", email: "delina@sim.rs", password: "123456", role: "PIC Mutu", unit: "PPI" },
  { id: "user-3", name: "Deti (PJ Ruangan)", email: "deti@sim.rs", password: "123456", role: "PJ Ruangan", unit: "RANAP" },
  { id: "user-4", name: "Devin (Keselamatan Pasien)", email: "devin@sim.rs", password: "123456", role: "Sub. Komite Keselamatan Pasien" },
  { id: "user-5", name: "Deka (Kepala Unit)", email: "deka@sim.rs", password: "123456", role: "Kepala Unit/Instalasi", unit: "IGD" },
  { id: "user-6", name: "Dr. Direktur", email: "dir@sim.rs", password: "123456", role: "Direktur" },
  { id: "user-7", name: "Dion (Peningkatan Mutu)", email: "dion@sim.rs", password: "123456", role: "Sub. Komite Peningkatan Mutu" },
  { id: "user-8", name: "Dara (Manajemen Risiko)", email: "dara@sim.rs", password: "123456", role: "Sub. Komite Manajemen Risiko" },
];


export async function login(formData: FormData) {
  const { email, password } = loginSchema.parse(Object.fromEntries(formData))

  const user = demoUsers.find((u) => u.email === email)

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
