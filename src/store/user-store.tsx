
"use client"

import { create } from "zustand"
import React, { createContext, useContext, useEffect, useRef } from "react"
import { useNotificationStore } from "./notification-store"

export type UserRole =
  | "Admin Sistem"
  | "PIC Mutu"
  | "PJ Ruangan"
  | "Kepala Unit/Instalasi"
  | "Direktur"
  | "Sub. Komite Peningkatan Mutu"
  | "Sub. Komite Keselamatan Pasien"
  | "Sub. Komite Manajemen Risiko"

export type User = {
  id: string
  name: string
  email: string
  password?: string
  role: UserRole
  unit?: string
}

const initialUsers: Omit<User, 'id'>[] = [
    { name: "Admin Sistem", email: "admin@sim.rs", password: "123456", role: "Admin Sistem" },
    { name: "Delina (PIC Mutu)", email: "delina@sim.rs", password: "123456", role: "PIC Mutu", unit: "PPI" },
    { name: "Deti (PJ Ruangan)", email: "deti@sim.rs", password: "123456", role: "PJ Ruangan", unit: "RANAP" },
    { name: "Devin (Keselamatan Pasien)", email: "devin@sim.rs", password: "123456", role: "Sub. Komite Keselamatan Pasien" },
    { name: "Deka (Kepala Unit)", email: "deka@sim.rs", password: "123456", role: "Kepala Unit/Instalasi", unit: "IGD" },
    { name: "Dr. Direktur", email: "dir@sim.rs", password: "123456", role: "Direktur" },
    { name: "Dion (Peningkatan Mutu)", email: "dion@sim.rs", password: "123456", role: "Sub. Komite Peningkatan Mutu" },
    { name: "Dara (Manajemen Risiko)", email: "dara@sim.rs", password: "123456", role: "Sub. Komite Manajemen Risiko" },
];


type UserState = {
  users: User[]
  currentUser: User | null
  fetchUsers: () => Promise<void> // Kept for potential future API integration
  fetchCurrentUser: () => Promise<void>
  addUser: (user: Omit<User, "id">) => string
  updateUser: (id: string, data: Partial<Omit<User, "id">>) => void
  removeUser: (id: string) => void
  setCurrentUser: (user: User | null) => void
  clearCurrentUser: () => void
}

const createUserStore = () =>
  create<UserState>()((set, get) => ({
    users: initialUsers.map((u, i) => ({...u, id: `user-${i+1}`})),
    currentUser: null,
    fetchUsers: async () => {
      // This is now a no-op but kept for architecture consistency
    },
    fetchCurrentUser: async () => {
       // In a real app, this would fetch from a session endpoint.
       // Here we just ensure it's null on initial load.
       set({ currentUser: null });
    },
    addUser: (user) => {
      const newId = `user-${Date.now()}-${Math.random()}`
      const newUser = { ...user, id: newId }
      set((state) => ({
        users: [...state.users, newUser],
      }))
      return newId
    },
    updateUser: (id, data) =>
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
      })),
    removeUser: (id) =>
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      })),
    setCurrentUser: (user) => set({ currentUser: user }),
    clearCurrentUser: () => set({ currentUser: null }),
  }))

const UserStoreContext = createContext<ReturnType<
  typeof createUserStore
> | null>(null)

export const UserStoreProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const storeRef = useRef<ReturnType<typeof createUserStore>>()
  if (!storeRef.current) {
    storeRef.current = createUserStore()
  }

  // No initial fetch needed as data is in-memory
  // useEffect(() => {
  //   storeRef.current?.getState().fetchCurrentUser()
  // }, [])

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      {children}
    </UserStoreContext.Provider>
  )
}

export const useUserStore = (): UserState => {
  const store = useContext(UserStoreContext)
  if (!store) {
    throw new Error("useUserStore must be used within a UserStoreProvider")
  }

  const userState = store((state) => state)
  const setNotificationsForUser = useNotificationStore(
    (state) => state.setNotificationsForUser
  )

  useEffect(() => {
    setNotificationsForUser(userState.currentUser, userState.users)
  }, [userState.currentUser, userState.users, setNotificationsForUser])

  return userState
}
