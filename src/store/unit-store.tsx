"use client"

import { create } from 'zustand'
import React, { createContext, useContext, useEffect, useRef } from 'react'

type Unit = {
  id: string
  name: string
}

type UnitState = {
  units: Unit[]
  isLoading: boolean
  hasLoaded: boolean
  error: string | null
  fetchUnits: () => Promise<void>
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
        set({ units: data, isLoading: false, hasLoaded: true })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat data unit'
        set({ error: message, isLoading: false, hasLoaded: true })
      }
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
