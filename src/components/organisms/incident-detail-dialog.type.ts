import type { Incident } from "@/store/incident-store"

export type IncidentDetailDialogProps = {
  incident: Incident | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

