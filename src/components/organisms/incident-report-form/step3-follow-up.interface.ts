import { Incident } from "@/store/incident-store"

export interface Step3FollowUpProps {
  data: Partial<Incident>
  onUpdate: (newData: Partial<Incident>) => void
}

