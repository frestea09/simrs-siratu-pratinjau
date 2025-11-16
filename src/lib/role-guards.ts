import type { UserRole } from "@/store/user-store"

const UNIT_MANAGER_ROLE_NAMES: UserRole[] = ["Admin Sistem", "Direktur"]

const UNIT_MANAGER_ROLES = new Set<UserRole>(UNIT_MANAGER_ROLE_NAMES)

export const isUnitManager = (role?: UserRole | null): boolean => {
  if (!role) return false
  return UNIT_MANAGER_ROLES.has(role)
}
