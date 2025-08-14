
import {
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import type { Indicator } from "@/store/indicator-store"

export type FilterType = "daily" | "monthly" | "yearly"

export const calculateRatio = (
  indicator: Omit<Indicator, "id" | "ratio" | "status">
): string => {
  if (indicator.standardUnit === "menit") {
    if (indicator.denominator === 0) return "0"
    const average = indicator.numerator / indicator.denominator
    return `${average.toFixed(1)}`
  }
  if (indicator.denominator === 0) return "0.0"
  const ratio = (indicator.numerator / indicator.denominator) * 100
  return `${ratio.toFixed(1)}`
}

export const calculateStatus = (
  indicator: Omit<Indicator, "id" | "ratio" | "status">
): Indicator["status"] => {
  let achievementValue: number

  if (indicator.standardUnit === "menit") {
    if (indicator.denominator === 0) return "N/A"
    achievementValue = indicator.numerator / indicator.denominator
    // Lower is better for wait times
    return achievementValue <= indicator.standard
      ? "Memenuhi Standar"
      : "Tidak Memenuhi Standar"
  } else {
    if (indicator.denominator === 0) return "N/A"
    achievementValue = (indicator.numerator / indicator.denominator) * 100
    // Higher is better for percentages
    return achievementValue >= indicator.standard
      ? "Memenuhi Standar"
      : "Tidak Memenuhi Standar"
  }
}

export const getFilterRange = (
  filterType: FilterType,
  date: Date
): { start: Date; end: Date } => {
  switch (filterType) {
    case "daily":
      return { start: date, end: date }
    case "monthly":
      return { start: startOfMonth(date), end: endOfMonth(date) }
    case "yearly":
      return { start: startOfYear(date), end: endOfYear(date) }
    default:
      const today = new Date()
      return { start: startOfMonth(today), end: endOfMonth(today) }
  }
}

export const getFilterDescription = (
  filterType: FilterType,
  date: Date
): string => {
  if (filterType === "daily") {
    return `Menampilkan data untuk tanggal: ${format(date, "d MMMM yyyy", { locale: IndonesianLocale })}.`
  }
  if (filterType === "monthly") {
    return `Menampilkan data untuk bulan: ${format(date, "MMMM yyyy", { locale: IndonesianLocale })}.`
  }
  if (filterType === "yearly") {
    return `Menampilkan data untuk tahun: ${format(date, "yyyy", { locale: IndonesianLocale })}.`
  }
  return "Menampilkan data."
}
