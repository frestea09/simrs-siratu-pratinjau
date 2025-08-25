import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatChronology(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ""
      const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      return capitalized.endsWith(".") ? capitalized : capitalized + "."
    })
    .filter(Boolean)
    .join("\n")
}
