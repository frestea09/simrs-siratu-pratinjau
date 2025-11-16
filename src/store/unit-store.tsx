"use client"

import { create } from 'zustand'
import React, { createContext, useContext, useEffect, useRef } from 'react'

export type Unit = {
  id: string
  name: string
}

type UnitState = {
  units: Unit[]
  isLoading: boolean
  hasLoaded: boolean
  error: string | null
  fetchUnits: () => Promise<void>
  addUnit: (name: string) => Promise<Unit>
  updateUnit: (id: string, name: string) => Promise<Unit>
  removeUnit: (id: string) => Promise<void>
}

const createUnitStore = () =>
  create<UnitState>()((set, get) => ({
    units: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
    fetchUnits: async () => {
      if (get().isLoading) return
      set({ isLoading: true, error: null })
      try {
        const res = await fetch('/api/units', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('Gagal memuat data unit')
        }
        const data: Unit[] = await res.json()
        set({
          units: data.sort((a, b) => a.name.localeCompare(b.name, 'id')),
          isLoading: false,
          hasLoaded: true,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat data unit'
        set({ error: message, isLoading: false, hasLoaded: true })
      }
    },
    addUnit: async (name) => {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        try {
          const err = await res.json()
          throw new Error(err?.error || 'Gagal menambahkan unit')
        } catch (error) {
          if (error instanceof Error) throw error
          throw new Error('Gagal menambahkan unit')
        }
      }
      const created: Unit = await res.json()
      set((state) => ({
        units: [...state.units, created].sort((a, b) => a.name.localeCompare(b.name, 'id')),
        hasLoaded: true,
      }))
      return created
    },
    updateUnit: async (id, name) => {
      const res = await fetch(`/api/units/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        try {
          const err = await res.json()
          throw new Error(err?.error || 'Gagal memperbarui unit')
        } catch (error) {
          if (error instanceof Error) throw error
          throw new Error('Gagal memperbarui unit')
        }
      }
      const updated: Unit = await res.json()
      set((state) => ({
        units: state.units
          .map((unit) => (unit.id === id ? updated : unit))
          .sort((a, b) => a.name.localeCompare(b.name, 'id')),
      }))
      return updated
    },
    removeUnit: async (id) => {
      const res = await fetch(`/api/units/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        try {
          const err = await res.json()
          throw new Error(err?.error || 'Gagal menghapus unit')
        } catch (error) {
          if (error instanceof Error) throw error
          throw new Error('Gagal menghapus unit')
        }
      }
      set((state) => ({ units: state.units.filter((unit) => unit.id !== id) }))
    },
  }))

const UnitStoreContext = createContext<ReturnType<typeof createUnitStore> | null>(null)

export const UnitStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createUnitStore>>()
  if (!storeRef.current) {
    storeRef.current = createUnitStore()
  }

  useEffect(() => {
    const store = storeRef.current
    if (!store) return
    const state = store.getState()
    if (!state.hasLoaded && !state.isLoading) {
      state.fetchUnits().catch(() => {})
    }
  }, [])

  return (
    <UnitStoreContext.Provider value={storeRef.current}>
      {children}
    </UnitStoreContext.Provider>
  )
}

export const useUnitStore = (): UnitState => {
  const store = useContext(UnitStoreContext)
  if (!store) {
    throw new Error('useUnitStore must be used within a UnitStoreProvider')
  }

  return store((state) => state)
}
