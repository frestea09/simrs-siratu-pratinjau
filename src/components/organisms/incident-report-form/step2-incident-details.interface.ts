import { Incident } from "@/store/incident-store";

export interface Step2IncidentDetailsProps {
  data: Partial<Incident>;
  onUpdate: (newData: Partial<Incident>) => void;
}
