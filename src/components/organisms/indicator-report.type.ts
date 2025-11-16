import type { Indicator, IndicatorCategory } from "@/store/indicator-store"

export type IndicatorReportProps = {
  indicators: Indicator[];
  category: IndicatorCategory;
  title?: string;
  description?: string;
  showInputButton?: boolean;
  chartData?: any[]; // Allow passing chart data
  reportDescription?: string;
}

