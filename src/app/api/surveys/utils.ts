type UserRole =
  | "AdminSistem"
  | "PICMutu"
  | "PJRuangan"
  | "KepalaUnitInstalasi"
  | "Direktur"
  | "SubKomitePeningkatanMutu"
  | "SubKomiteKeselamatanPasien"
  | "SubKomiteManajemenRisiko"
  | "PetugasPelaporan"
import type { UserRole } from "@prisma/client"

const roleUiToDbMap: Record<string, UserRole> = {
  "Admin Sistem": "AdminSistem",
  "PIC Mutu": "PICMutu",
  "PJ Ruangan": "PJRuangan",
  "Kepala Unit/Instalasi": "KepalaUnitInstalasi",
  Direktur: "Direktur",
  "Sub. Komite Peningkatan Mutu": "SubKomitePeningkatanMutu",
  "Sub. Komite Keselamatan Pasien": "SubKomiteKeselamatanPasien",
  "Sub. Komite Manajemen Risiko": "SubKomiteManajemenRisiko",
  "Petugas Pelaporan": "PetugasPelaporan",
}

const roleDbToUiMap: Record<UserRole, string> = {
  AdminSistem: "Admin Sistem",
  PICMutu: "PIC Mutu",
  PJRuangan: "PJ Ruangan",
  KepalaUnitInstalasi: "Kepala Unit/Instalasi",
  Direktur: "Direktur",
  SubKomitePeningkatanMutu: "Sub. Komite Peningkatan Mutu",
  SubKomiteKeselamatanPasien: "Sub. Komite Keselamatan Pasien",
  SubKomiteManajemenRisiko: "Sub. Komite Manajemen Risiko",
  PetugasPelaporan: "Petugas Pelaporan",
}

export const mapRoleUiToDb = (role?: string | null): UserRole =>
  roleUiToDbMap[role ?? ""] ?? "AdminSistem"

export const mapRoleDbToUi = (role?: UserRole | null) =>
  role ? roleDbToUiMap[role] ?? role : undefined
