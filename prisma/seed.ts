import { PrismaClient, UserRole } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const users = [
    {
      name: "Admin Sistem",
      email: "admin@sim.rs",
      password: "123456",
      role: UserRole.ADMIN_SISTEM,
    },
    {
      name: "Delina (PIC Mutu)",
      email: "delina@sim.rs",
      password: "123456",
      role: UserRole.PIC_MUTU,
      unit: "PPI",
    },
    {
      name: "Deti (PJ Ruangan)",
      email: "deti@sim.rs",
      password: "123456",
      role: UserRole.PJ_RUANGAN,
      unit: "RANAP",
    },
    {
      name: "Devin (Keselamatan Pasien)",
      email: "devin@sim.rs",
      password: "123456",
      role: UserRole.SUB_KOMITE_KESELAMATAN_PASIEN,
    },
    {
      name: "Deka (Kepala Unit)",
      email: "deka@sim.rs",
      password: "123456",
      role: UserRole.KEPALA_UNIT_INSTALASI,
      unit: "IGD",
    },
    {
      name: "Dr. Direktur",
      email: "dir@sim.rs",
      password: "123456",
      role: UserRole.DIREKTUR,
    },
    {
      name: "Dion (Peningkatan Mutu)",
      email: "dion@sim.rs",
      password: "123456",
      role: UserRole.SUB_KOMITE_PENINGKATAN_MUTU,
    },
    {
      name: "Dara (Manajemen Risiko)",
      email: "dara@sim.rs",
      password: "123456",
      role: UserRole.SUB_KOMITE_MANAJEMEN_RISIKO,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
