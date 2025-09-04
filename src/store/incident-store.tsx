
"use client"

import { create } from "zustand"
import { formatChronology } from "@/lib/utils"
import React, { createContext, useContext, useRef } from "react"

export type IncidentStatus = "Investigasi" | "Selesai"

export type Incident = {
  id: string
  date: string
  status: IncidentStatus
  patientName?: string
  medicalRecordNumber?: string
  careRoom?: string
  ageGroup?: string
  gender?: string
  payer?: string
  entryDate?: string
  entryTime?: string
  incidentDate?: string
  incidentTime?: string
  chronology?: string
  type: "KPC" | "KNC" | "KTC" | "KTD" | "Sentinel"
  incidentSubject?: string
  incidentLocation?: string
  incidentLocationOther?: string
  relatedUnit?: string
  firstAction?: string
  firstActionBy?: string
  hasHappenedBefore?: string
  severity: "biru" | "hijau" | "kuning" | "merah"
  patientImpact?: string
  analysisNotes?: string
  followUpPlan?: string
}

type IncidentState = {
  incidents: Incident[]
  fetchIncidents: () => Promise<void>
  addIncident: (incident: Omit<Incident, "id" | "date" | "status">) => Promise<string>
  updateIncident: (
    id: string,
    incident: Partial<Omit<Incident, "id" | "date" | "status">>
  ) => Promise<void>
  updateIncidentStatus: (id: string, status: IncidentStatus) => Promise<void>
  removeIncident: (id: string) => Promise<void>
}

const createIncidentStore = () => create<IncidentState>((set, get) => ({
  incidents: [],

  fetchIncidents: async () => {
    const res = await fetch('/api/incidents', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch incidents')
    const data: Incident[] = await res.json()
    set({ incidents: data })
  },

  addIncident: async (incidentData) => {
    const payload = { ...incidentData }
    if (payload.chronology) payload.chronology = formatChronology(payload.chronology)
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to create incident')
    const created: Incident = await res.json()
    set((state) => ({ incidents: [created, ...state.incidents] }))
    return created.id
  },

  updateIncident: async (id, incidentData) => {
    const payload: any = { ...incidentData }
    if (payload.chronology !== undefined) {
      payload.chronology = payload.chronology ? formatChronology(payload.chronology) : ''
    }
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to update incident')
    const updated = await res.json()
    set((state) => ({
      incidents: state.incidents.map((inc) => (inc.id === id ? { ...inc, ...updated, date: updated.incidentDate ?? updated.date ?? inc.date } : inc)),
    }))
  },

  updateIncidentStatus: async (id, status) => {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error('Failed to update incident status')
    set((state) => ({
      incidents: state.incidents.map((inc) => (inc.id === id ? { ...inc, status } : inc)),
    }))
  },

  removeIncident: async (id) => {
    const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete incident')
    set((state) => ({ incidents: state.incidents.filter((inc) => inc.id !== id) }))
  },
}))

const IncidentStoreContext = createContext<ReturnType<typeof createIncidentStore> | null>(null);

export const IncidentStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const storeRef = useRef<ReturnType<typeof createIncidentStore>>();
    if (!storeRef.current) {
        storeRef.current = createIncidentStore();
    }
    return (
        <IncidentStoreContext.Provider value={storeRef.current}>
            {children}
        </IncidentStoreContext.Provider>
    );
};

export const useIncidentStore = (): IncidentState => {
    const store = useContext(IncidentStoreContext);
    if (!store) {
        throw new Error('useIncidentStore must be used within a IncidentStoreProvider');
    }
    return store(state => state);
};
