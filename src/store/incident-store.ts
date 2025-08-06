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
  updateIncident: (id: string, incident: Omit<Incident, 'id' | 'date' | 'status'>) => void
}

const initialIncidents: Incident[] = [];


export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: initialIncidents,
  addIncident: (incident) =>
    set((state) => ({
      incidents: [
        {
          ...incident,
          id: `IKP-${String(state.incidents.length + 1).padStart(3, '0')}`,
          date: new Date().toISOString(),
          status: 'Investigasi',
        },
        ...state.incidents,
      ],
    })),
    updateIncident: (id, incidentData) => set((state) => ({
        incidents: state.incidents.map(inc => {
            if (inc.id === id) {
                return {
                    ...inc,
                    ...incidentData
                }
            }
            return inc;
        })
    }))
}))
