import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session_user_id")?.value
  if (!userId) {
    return NextResponse.json({ user: null })
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return NextResponse.json({ user })
}
