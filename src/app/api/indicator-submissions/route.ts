import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ submissions: [] }, { status: 401 })

  const userIsCentral = [
    "ADMIN_SISTEM",
    "DIREKTUR",
    "SUB_KOMITE_PENINGKATAN_MUTU",
  ].includes(user.role)

  const submissions = await prisma.indicatorSubmission.findMany({
    where: userIsCentral ? {} : { unit: user.unit || undefined },
    orderBy: { submissionDate: "desc" },
    include: { submittedBy: true }
  })
  return NextResponse.json({ submissions })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const data = await req.json()
  const status = ['INM', 'IMP_RS', 'SPM'].includes(data.category)
    ? 'Diverifikasi'
    : 'Menunggu_Persetujuan'

  const submission = await prisma.indicatorSubmission.create({
    data: {
      ...data,
      standard: parseFloat(data.standard),
      submittedById: user.id,
      status,
    },
  })

  return NextResponse.json({ submission })
}
