import { cookies } from "next/headers"

import { prisma } from "@/lib/prisma"

export function mapTargetUnitToFrontend(u: string): "%" | "menit" {
  return u === "percent" ? "%" : "menit"
}

export function mapTargetUnitToDb(u: string): "percent" | "minute" {
  return u === "%" ? "percent" : "minute"
}

export function mapStatusToFrontend(
  s: string
): "Draf" | "Menunggu Persetujuan" | "Disetujui" | "Ditolak" {
  if (s === "MenungguPersetujuan") return "Menunggu Persetujuan"
  return s as any
}

export function mapStatusToDb(
  s?: string
): "Draf" | "MenungguPersetujuan" | "Disetujui" | "Ditolak" {
  if (!s) return "Draf"
  if (s === "Menunggu Persetujuan") return "MenungguPersetujuan"
  return s as any
}

export function mapProfileToFrontend(p: any) {
  const submissions: any[] = Array.isArray(p.submittedIndicators)
    ? p.submittedIndicators
    : []
  const hasSubmissions = submissions.length > 0
  const hasAchievements = submissions.some(
    (s) => Array.isArray(s.achievements) && s.achievements.length > 0,
  )
  const hasVerifiedSubmission = submissions.some(
    (s) => s.status === "Diverifikasi",
  )

  let lockedReason: string | undefined
  if (hasSubmissions) {
    if (hasAchievements || hasVerifiedSubmission) {
      lockedReason =
        "Profil ini sudah digunakan untuk pengisian capaian indikator sehingga tidak dapat dihapus. Anda dapat menonaktifkan atau memperbarui data tanpa menghapusnya."
    } else {
      lockedReason =
        "Profil ini sedang digunakan dalam manajemen indikator sehingga tidak dapat dihapus. Anda dapat menonaktifkan atau memperbarui data tanpa menghapusnya."
    }
  }

  return {
    id: p.id,
    title: p.title,
    purpose: p.purpose,
    definition: p.definition ?? "",
    implication: p.implication ?? "",
    calculationMethod: p.calculationMethod,
    numerator: p.numerator,
    denominator: p.denominator,
    target: p.target,
    targetUnit: mapTargetUnitToFrontend(p.targetUnit) as any,
    inclusionCriteria: p.inclusionCriteria ?? "",
    exclusionCriteria: p.exclusionCriteria ?? "",
    dataRecording: p.dataRecording,
    unitRecap: p.unitRecap,
    analysisReporting: p.analysisReporting,
    area: p.area,
    pic: p.pic,
    status: mapStatusToFrontend(p.status),
    rejectionReason: p.rejectionReason ?? undefined,
    createdBy: p.authorId,
    createdAt: (
      p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)
    ).toISOString(),
    unit: p.unit,
    locked: hasSubmissions,
    lockedReason,
  }
}

export async function resolveAuthorIdFromCookie() {
  try {
    const jar = await cookies()
    const session = jar.get("session")?.value
    if (!session) return null
    const sess = JSON.parse(session)
    if (sess?.email) {
      let user = await prisma.user.findUnique({ where: { email: sess.email } })
      if (user) return user.id

      const mapUiRoleToDbRole = (r?: string) => {
        switch (r) {
          case "Admin Sistem":
            return "AdminSistem"
          case "PIC Mutu":
            return "PICMutu"
          case "PJ Ruangan":
            return "PJRuangan"
          case "Kepala Unit/Instalasi":
            return "KepalaUnitInstalasi"
          case "Direktur":
            return "Direktur"
          case "Sub. Komite Peningkatan Mutu":
            return "SubKomitePeningkatanMutu"
          case "Sub. Komite Keselamatan Pasien":
            return "SubKomiteKeselamatanPasien"
          case "Sub. Komite Manajemen Risiko":
            return "SubKomiteManajemenRisiko"
          default:
            return "AdminSistem"
        }
      }
      user = await prisma.user.create({
        data: {
          name: sess.name ?? "Admin Sistem",
          email: sess.email,
          password: sess.password ?? "123456",
          role: mapUiRoleToDbRole(sess.role) as any,
          unit: sess.unit ?? null,
        },
      })
      return user.id
    }
  } catch {}
  return null
}
