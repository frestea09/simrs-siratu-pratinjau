
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
  patientImpact?: string // New field
  // Reporter info is now omitted for anonymity
}


type IncidentState = {
  incidents: Incident[]
  addIncident: (incident: Omit<Incident, 'id' | 'date' | 'status'>) => string
  updateIncident: (id: string, incident: Omit<Incident, 'id' | 'date' | 'status'>) => void
}

const initialIncidents: Incident[] = [];


export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: initialIncidents,
  addIncident: (incident) => {
    const newId = `IKP-${String(get().incidents.length + 1).padStart(3, '0')}`;
    const newIncident = {
        ...incident,
        id: newId,
        date: new Date().toISOString(),
        status: 'Investigasi',
    };
    set((state) => ({
      incidents: [newIncident, ...state.incidents],
    }));
    return newId;
  },
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
