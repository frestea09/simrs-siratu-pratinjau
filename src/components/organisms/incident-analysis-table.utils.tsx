"use client"

import { formatChronology } from "@/lib/utils"

export const incidentTypeMap: Record<string, string> = {
  KPC: "Kondisi Potensial Cedera (KPC)",
  KNC: "Kejadian Nyaris Cedera (KNC)",
  KTC: "Kejadian Tidak Cedera (KTC)",
  KTD: "Kejadian Tidak Diharapkan (KTD)",
  Sentinel: "Kejadian Sentinel",
}

export function ChronologyList({ text }: { text: string }) {
  const steps = formatChronology(text).split("\n").filter(Boolean)

  if (steps.length === 0) {
    return <p className="text-sm text-muted-foreground">-</p>
  }

  return (
    <ol className="list-decimal pl-4 space-y-1 text-sm">
      {steps.map((step, index) => (
        <li key={index} className="leading-relaxed">
          {step}
        </li>
      ))}
    </ol>
  )
}
