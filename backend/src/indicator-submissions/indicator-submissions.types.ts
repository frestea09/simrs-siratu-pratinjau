export interface IndicatorSubmission {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  frequency: string;
  status: string;
  standardUnit: string;
  standard: number;
  submissionDate: string;
  submittedById: string;
  rejectionReason?: string;
}

export interface CreateIndicatorSubmissionDto {
  name: string;
  category: string;
  description: string;
  unit: string;
  frequency: string;
  standardUnit: string;
  standard: number;
  submittedById: string;
}

export interface UpdateIndicatorSubmissionDto {
  name?: string;
  category?: string;
  description?: string;
  unit?: string;
  frequency?: string;
  standardUnit?: string;
  standard?: number;
}

export interface UpdateSubmissionStatusDto {
  status: string;
  rejectionReason?: string;
}
