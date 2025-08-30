
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
import type { Indicator } from "@/store/indicator-store"

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
  const { numerator, denominator, formula, standardUnit } = indicator;

  // Handle division by zero
  if (denominator === 0 && (formula.includes("/") || formula.toLowerCase().includes("denominator"))) {
      return standardUnit === 'menit' ? "0" : "0.0";
  }

  try {
    // Replace keywords with actual values. Case-insensitive replacement.
    let expression = formula
      .replace(/numerator/gi, numerator.toString())
      .replace(/denominator/gi, denominator.toString())
      .replace(/%/g, ""); // Remove percentage signs if any

    let ratio: number;

    // Evaluate the expression based on the operator
    if (expression.includes("* 100")) {
      // Handle percentage calculation which might not have spaces
      const parts = expression.replace("* 100", "").trim();
      const subExpression = new Function(`return ${parts}`)();
      ratio = subExpression * 100;
    } else if (expression.includes("*")) {
      ratio = new Function(`return ${expression}`)();
    } else if (expression.includes("/")) {
      ratio = new Function(`return ${expression}`)();
    } else if (expression.includes("+")) {
      ratio = new Function(`return ${expression}`)();
    } else if (expression.includes("-")) {
      ratio = new Function(`return ${expression}`)();
    }
     else {
      // Fallback for simple cases or if no operator is found (e.g., just "Numerator")
      ratio = parseFloat(expression);
    }
    
    if (isNaN(ratio)) {
        return "N/A";
    }

    // Format to one decimal place, unless it's an integer for non-percentage units
     return ratio.toFixed(1);

  } catch (error) {
    console.error("Error evaluating formula:", formula, error);
    return "N/A"; // Return Not Applicable if formula is invalid
  }
}


export const calculateStatus = (
  indicator: Omit<Indicator, "id" | "ratio" | "status">
): Indicator["status"] => {
  if (indicator.denominator === 0) return "N/A"
  const achievementValue = parseFloat(calculateRatio(indicator));
  
  if (isNaN(achievementValue)) {
      return "N/A";
  }
  
  // Lower is better for wait times
  if (indicator.standardUnit === "menit") {
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
