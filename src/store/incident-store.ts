
import { create } from 'zustand'

export type Incident = {
  // Base Info
  id: string
  date: string
  status: string

  // Step 1: Patient Data
  patientName?: string
  medicalRecordNumber?: string
  careRoom?: string
  ageGroup?: string
  gender?: string
  payer?: string
  entryDate?: string
  entryTime?: string

  // Step 2: Incident Details
  incidentDate?: string
  incidentTime?: string
  chronology?: string
  type: string
  incidentSubject?: string
  incidentLocation?: string
  relatedUnit?: string
  
  // Step 3: Follow-up
  firstAction?: string
  firstActionBy?: string
  hasHappenedBefore?: string
  severity: string
  reporterName?: string
  reporterUnit?: string
}


type IncidentState = {
  incidents: Incident[]
  addIncident: (incident: Omit<Incident, 'id' | 'date' | 'status'>) => void
}

const initialIncidents: Incident[] = [
  { 
    id: "IKP-012", 
    date: "2023-06-05", 
    type: "Kejadian Nyaris Cedera (KNC)", 
    severity: "Rendah", 
    status: "Investigasi",
    patientName: "Budi Santoso",
    medicalRecordNumber: "CM-12345",
    careRoom: "Ruang Melati",
    chronology: "Pasien hampir jatuh dari tempat tidur saat mencoba mengambil minum.",
  },
  { id: "IKP-011", date: "2023-05-20", type: "Kejadian Tidak Diharapkan (KTD)", severity: "Sedang", status: "Selesai" },
  { id: "IKP-010", date: "2023-05-15", type: "Kondisi Potensial Cedera (KPC)", severity: "N/A", status: "Selesai" },
];


export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: initialIncidents,
  addIncident: (incident) =>
    set((state) => ({
      incidents: [
        {
          ...incident,
          id: `IKP-${String(state.incidents.length + 13).padStart(3, '0')}`,
          date: new Date().toISOString(),
          status: 'Investigasi',
        },
        ...state.incidents,
      ],
    })),
}))

    