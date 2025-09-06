import type { Incident } from "@/store/incident-store"

export type IncidentReportFormProps = {
  setOpen: (open: boolean) => void;
  incident?: Incident;
}

