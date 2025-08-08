
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
  type: 'KPC' | 'KNC' | 'KTC' | 'KTD' | 'Sentinel'
  incidentSubject?: string
  incidentLocation?: string
  relatedUnit?: string
  
  // Step 3: Follow-up
  firstAction?: string
  firstActionBy?: string
  hasHappenedBefore?: string
  severity: 'biru' | 'hijau' | 'kuning' | 'merah'
  patientImpact?: string
}

const incidentTypeMap: { [key: string]: string } = {
    'KPC': 'Kondisi Potensial Cedera (KPC)', 'KNC': 'Kejadian Nyaris Cedera (KNC)',
    'KTC': 'Kejadian Tidak Cedera (KTC)', 'KTD': 'Kejadian Tidak Diharapkan (KTD)',
    'Sentinel': 'Kejadian Sentinel',
};
const severityMap: { [key: string]: string } = {
    biru: 'BIRU (Rendah)', hijau: 'HIJAU (Sedang)', kuning: 'KUNING (Tinggi)', merah: 'MERAH (Sangat Tinggi)',
};


type IncidentState = {
  incidents: Incident[]
  addIncident: (incident: Omit<Incident, 'id' | 'date' | 'status'>) => string
  updateIncident: (id: string, incident: Partial<Omit<Incident, 'id' | 'date' | 'status'>>) => void
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
