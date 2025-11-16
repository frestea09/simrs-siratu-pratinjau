import { prisma } from './prisma'
import type { SubmittedIndicatorEventPayload } from './realtime-event-bus'

const mapCategoryToUi = (c: string): 'INM' | 'IMP-RS' | 'IMPU' | 'SPM' => (c === 'IMP_RS' ? 'IMP-RS' : (c as any))
const mapUnitToUi = (u: string): '%' | 'menit' => (u === 'percent' ? '%' : 'menit')
const mapStatusToUi = (
  s: string
): 'Menunggu Persetujuan' | 'Diverifikasi' | 'Ditolak' => (s === 'MenungguPersetujuan' ? 'Menunggu Persetujuan' : (s as any))

function resolveLockState(si: any) {
  const achievementsCount = si?._count?.achievements ?? 0
  const hasAchievements = achievementsCount > 0
  const isVerified = si.status === 'Diverifikasi'

  if (hasAchievements) {
    return {
      locked: true,
      lockedReason:
        'Pengajuan indikator ini tidak dapat dihapus karena sudah memiliki data capaian yang diproses. Silakan nonaktifkan atau perbarui datanya tanpa menghapus.',
    }
  }

  if (isVerified) {
    return {
      locked: true,
      lockedReason:
        'Pengajuan indikator ini tidak dapat dihapus karena telah diverifikasi. Silakan nonaktifkan atau perbarui data tanpa menghapusnya.',
    }
  }

  return { locked: false, lockedReason: undefined }
}

export function submittedIndicatorToFrontend(si: any): SubmittedIndicatorEventPayload {
  const lock = resolveLockState(si)
  return {
    id: si.id,
    name: si.name,
    category: mapCategoryToUi(si.category),
    description: si.description ?? '',
    unit: si.unit,
    frequency: si.frequency,
    status: mapStatusToUi(si.status),
    submissionDate: (si.submissionDate instanceof Date ? si.submissionDate : new Date(si.submissionDate)).toISOString(),
    standard: si.standard,
    standardUnit: mapUnitToUi(si.standardUnit),
    rejectionReason: si.rejectionReason ?? undefined,
    submittedById: si.submittedById,
    profileId: si.profileId,
    locked: lock.locked,
    lockedReason: lock.lockedReason,
  }
}

export async function loadSubmittedIndicatorForEvent(id: string) {
  const item = await prisma.submittedIndicator.findUnique({
    where: { id },
    include: {
      _count: { select: { achievements: true } },
    },
  })
  return item ? submittedIndicatorToFrontend(item) : null
}
