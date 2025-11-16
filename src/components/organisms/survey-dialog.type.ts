import type { ReactNode } from "react"
import type { SurveyResult } from "@/store/survey-store"

export type SurveyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey?: SurveyResult | null
  trigger?: ReactNode
}

