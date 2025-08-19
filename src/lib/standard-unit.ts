import type { StandardUnit } from "@prisma/client"

export function toDbStandardUnit(unit: string): StandardUnit {
  return unit === '%' ? 'persen' : (unit as StandardUnit)
}

export function fromDbStandardUnit(unit: StandardUnit): string {
  return unit === 'persen' ? '%' : unit
}
