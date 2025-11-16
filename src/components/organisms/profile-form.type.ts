import type { IndicatorProfile } from "@/store/indicator-store"

export type ProfileFormProps = {
  setOpen: (open: boolean) => void;
  profileToEdit?: IndicatorProfile;
}

