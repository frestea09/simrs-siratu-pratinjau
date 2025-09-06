import type { FilterType } from "@/lib/indicator-utils"

export type IndicatorFilterCardProps = {
  userIsCentral: boolean;
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
  uniqueIndicatorNames: { value: string; label: string }[];
  selectedIndicator: string;
  setSelectedIndicator: (indicator: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  chartType: 'line' | 'bar';
  setChartType: (type: 'line' | 'bar') => void;
}

