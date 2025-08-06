import { create } from 'zustand'

export type Incident = {
  id: string
  date: string
  type: string
  severity: string
  status: string
}

type IncidentState = {
  incidents: Incident[]
  addIncident: (incident: Pick<Incident, 'type' | 'severity'>) => void
}

const initialIncidents: Incident[] = [
  { id: "IKP-012", date: "2023-06-05", type: "Kejadian Nyaris Cedera (KNC)", severity: "Rendah", status: "Investigasi" },
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
          date: new Date().toISOString().split('T')[0],
          status: 'Investigasi',
        },
        ...state.incidents,
      ],
    })),
}))
