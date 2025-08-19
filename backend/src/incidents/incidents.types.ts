export interface Incident {
  id: string;
  date: string;
  status: string;
  type: string;
  severity: string;
  patientName: string;
  chronology: string;
}

export interface CreateIncidentDto {
  date: string;
  status: string;
  type: string;
  severity: string;
  patientName: string;
  chronology: string;
}

export interface UpdateIncidentDto {
  date?: string;
  status?: string;
  type?: string;
  severity?: string;
  patientName?: string;
  chronology?: string;
}
