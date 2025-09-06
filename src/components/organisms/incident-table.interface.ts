import type { ReactNode } from "react"
import type { Incident } from "@/store/incident-store"

export interface IncidentTableProps {
  incidents: Incident[]
  lineChart?: ReactNode
  barChart?: ReactNode
  chartDescription?: string
}
