
import {
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  subMonths,
} from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
import type { Indicator, IndicatorProfile } from "@/store/indicator-store"

export type FilterType =
  | "daily"
  | "monthly"
  | "yearly"
  | "7d"
  | "30d"
  | "this_month"
  | "3m"
  | "6m"
  | "1y"
  | "3y"

export const calculateRatio = (
  indicator: Omit<Indicator, "id" | "ratio" | "status">
): string => {
  const { numerator, denominator, calculationMethod } = indicator;

  if (denominator === 0) {
    return "0.0";
  }

  try {
    let ratio: number;
    if (calculationMethod === 'percentage') {
      ratio = (numerator / denominator) * 100;
    } else { // 'average'
      ratio = numerator / denominator;
    }

    if (isNaN(ratio)) {
      return "N/A";
    }

    return ratio.toFixed(1);

  } catch (error) {
    console.error("Error evaluating formula:", calculationMethod, error);
    return "N/A";
  }
}

export const matchUnit = (indicatorUnit?: string, userUnit?: string): boolean => {
  if (!indicatorUnit || !userUnit) return false;
  if (indicatorUnit === "Semua unit") return true;

  const indicatorUnits = indicatorUnit.split(", ").map(u => u.trim()).filter(Boolean);
  const userUnits = userUnit.split(", ").map(u => u.trim()).filter(Boolean);

  return indicatorUnits.some(iu => userUnits.includes(iu));
}


export const calculateStatus = (
  indicator: Omit<Indicator, "id" | "ratio" | "status">
): Indicator["status"] => {
  if (indicator.denominator === 0) return "N/A"
  const achievementValue = parseFloat(calculateRatio(indicator));

  if (isNaN(achievementValue)) {
    return "N/A";
  }

  if (indicator.calculationMethod === "average") { // Lower is better
    return achievementValue <= indicator.standard
      ? "Memenuhi Standar"
      : "Tidak Memenuhi Standar"
  }

  // Higher is better for percentages
  return achievementValue >= indicator.standard
    ? "Memenuhi Standar"
    : "Tidak Memenuhi Standar"
}

export const getFilterRange = (
  filterType: FilterType,
  date: Date
): { start: Date; end: Date } => {
  const now = new Date()
  switch (filterType) {
    case "daily":
      return { start: date, end: date }
    case "monthly":
      return { start: startOfMonth(date), end: endOfMonth(date) }
    case "yearly":
      return { start: startOfYear(date), end: endOfYear(date) }
    case "7d":
      return { start: subDays(now, 6), end: now }
    case "30d":
      return { start: subDays(now, 29), end: now }
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case "3m":
      return { start: subMonths(now, 3), end: now }
    case "6m":
      return { start: subMonths(now, 6), end: now }
    case "1y":
      return { start: subMonths(now, 12), end: now }
    case "3y":
      return { start: subMonths(now, 36), end: now }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export const getFilterDescription = (
  filterType: FilterType,
  date: Date
): string => {
  const { start, end } = getFilterRange(filterType, date)

  const formatDateRange = (start: Date, end: Date) => {
    return `${format(start, "d MMM yyyy", { locale: IndonesianLocale })} - ${format(end, "d MMM yyyy", { locale: IndonesianLocale })}`
  }

  switch (filterType) {
    case "daily":
      return `Menampilkan data untuk tanggal: ${format(date, "d MMMM yyyy", { locale: IndonesianLocale })}.`
    case "monthly":
      return `Menampilkan data untuk bulan: ${format(date, "MMMM yyyy", { locale: IndonesianLocale })}.`
    case "yearly":
      return `Menampilkan data untuk tahun: ${format(date, "yyyy", { locale: IndonesianLocale })}.`
    case "7d":
      return `Menampilkan data untuk 7 Hari Terakhir (${formatDateRange(start, end)}).`
    case "30d":
      return `Menampilkan data untuk 30 Hari Terakhir (${formatDateRange(start, end)}).`
    case "this_month":
      return `Menampilkan data untuk Bulan Ini (${formatDateRange(start, end)}).`
    case "3m":
      return `Menampilkan data untuk 3 Bulan Terakhir (${formatDateRange(start, end)}).`
    case "6m":
      return `Menampilkan data untuk 6 Bulan Terakhir (${formatDateRange(start, end)}).`
    case "1y":
      return `Menampilkan data untuk 1 Tahun Terakhir (${formatDateRange(start, end)}).`
    case "3y":
      return `Menampilkan data untuk 3 Tahun Terakhir (${formatDateRange(start, end)}).`
    default:
      return "Menampilkan data."
  }
}

