export interface Risk {
  id: string;
  unit: string;
  source: string;
  description: string;
  cause: string;
  consequence: number;
  likelihood: number;
  status: string;
}

export interface CreateRiskDto {
  unit: string;
  source: string;
  description: string;
  cause: string;
  consequence: number;
  likelihood: number;
  status: string;
}

export interface UpdateRiskDto {
  unit?: string;
  source?: string;
  description?: string;
  cause?: string;
  consequence?: number;
  likelihood?: number;
  status?: string;
}
