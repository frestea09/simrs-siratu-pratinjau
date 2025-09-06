import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"

export interface ReportPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data?: any[]
  columns?: ColumnDef<any>[]
  title?: string
  description?: string
  chartDescription?: string
  lineChart?: React.ReactNode
  barChart?: React.ReactNode
  analysisTable?: React.ReactNode
  children?: React.ReactNode
}
