import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const runtime = 'nodejs'

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      unit: true,
    },
  })
  return NextResponse.json({ users })
}
