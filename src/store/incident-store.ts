"use client"

import { create } from "zustand"

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

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],

  fetchIncidents: async () => {
    const res = await fetch("/api/incidents")
    if (!res.ok) return
    const data = await res.json()
    set({ incidents: data.incidents })
  },

  addIncident: async (incident) => {
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.error || "Failed to add incident")
    }
    set((state) => ({ incidents: [data.incident, ...state.incidents] }))
    return data.incident.id
  },

  updateIncident: async (id, incidentData) => {
    await fetch(`/api/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incidentData),
    })
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, ...incidentData } : inc
      ),
    }))
  },

  updateIncidentStatus: async (id, status) => {
    await fetch(`/api/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, status } : inc
      ),
    }))
  },

  removeIncident: async (id) => {
    await fetch(`/api/incidents/${id}`, { method: "DELETE" })
    set((state) => ({
      incidents: state.incidents.filter((inc) => inc.id !== id),
    }))
  },
}))

