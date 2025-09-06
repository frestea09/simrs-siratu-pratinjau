import type { Incident } from "@/store/incident-store"

export interface Step1PatientDataProps {
  data: Partial<Incident>;
  onUpdate: (newData: Partial<Incident>) => void;
}

