export interface Indicator {
  id: string;
  submissionId: string;
  period: string;
  numerator: number;
  denominator: number;
  analysisNotes?: string;
  followUpPlan?: string;
}

export interface CreateIndicatorDto {
  submissionId: string;
  period: string;
  numerator: number;
  denominator: number;
  analysisNotes?: string;
  followUpPlan?: string;
}

export interface UpdateIndicatorDto {
  period?: string;
  numerator?: number;
  denominator?: number;
  analysisNotes?: string;
  followUpPlan?: string;
}
