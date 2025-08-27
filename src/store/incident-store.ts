
"use client"

import { create } from "zustand"
import { formatChronology } from "@/lib/utils"

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
    // No-op, data is now managed in the store
  },

  addIncident: async (incidentData) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `INC-${Date.now()}`,
      date: new Date().toISOString(),
      status: "Investigasi",
      chronology: incidentData.chronology ? formatChronology(incidentData.chronology) : undefined,
    }
    set((state) => ({ incidents: [newIncident, ...state.incidents] }))
    return newIncident.id
  },

  updateIncident: async (id, incidentData) => {
    set((state) => ({
      incidents: state.incidents.map((inc) => {
        if (inc.id === id) {
          const updatedData = { ...inc, ...incidentData };
          if (incidentData.chronology !== undefined) {
            updatedData.chronology = formatChronology(incidentData.chronology);
          }
          return updatedData;
        }
        return inc;
      }),
    }))
  },

  updateIncidentStatus: async (id, status) => {
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, status } : inc
      ),
    }))
  },

  removeIncident: async (id) => {
    set((state) => ({
      incidents: state.incidents.filter((inc) => inc.id !== id),
    }))
  },
}))
