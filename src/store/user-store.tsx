"use client"

import { createWithEqualityFn } from "zustand/traditional"
import React, { createContext, useContext, useEffect, useRef } from "react"
import { useNotificationStore } from "./notification-store"
import type { UserRole as DbUserRole } from "@prisma/client"

const roleMap: Record<DbUserRole, UserRole> = {
  ADMIN_SISTEM: "Admin Sistem",
  PIC_MUTU: "PIC Mutu",
  PJ_RUANGAN: "PJ Ruangan",
  KEPALA_UNIT_INSTALASI: "Kepala Unit/Instalasi",
  DIREKTUR: "Direktur",
  SUB_KOMITE_PENINGKATAN_MUTU: "Sub. Komite Peningkatan Mutu",
  SUB_KOMITE_KESELAMATAN_PASIEN: "Sub. Komite Keselamatan Pasien",
  SUB_KOMITE_MANAJEMEN_RISIKO: "Sub. Komite Manajemen Risiko",
}

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

type UserState = {
  users: User[]
  currentUser: User | null
  fetchUsers: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  addUser: (user: Omit<User, "id">) => string
  updateUser: (id: string, data: Partial<Omit<User, "id">>) => void
  removeUser: (id: string) => void
  setCurrentUser: (user: User) => void
  clearCurrentUser: () => void
}

const createUserStore = () =>
  createWithEqualityFn<UserState>()((set, get) => ({
    users: [],
    currentUser: null,
    fetchUsers: async () => {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        set({ users: data.users })
      }
    },
    fetchCurrentUser: async () => {
      try {
        const res = await fetch("/api/session")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            set({
              currentUser: {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: roleMap[data.user.role as DbUserRole],
                unit: data.user.unit ?? undefined,
              },
            })
          } else {
            set({ currentUser: null })
          }
        }
      } catch (error) {
        console.error("Failed to fetch current user", error)
      }
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

  useEffect(() => {
    storeRef.current?.getState().fetchUsers()
    storeRef.current?.getState().fetchCurrentUser()
  }, [])

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
  // Subscribe only to the setter to avoid re-render loops when notifications update
  const setNotificationsForUser = useNotificationStore(
    (state) => state.setNotificationsForUser
  )

  useEffect(() => {
    // When the current user changes, re-filter the notifications
    setNotificationsForUser(userState.currentUser, userState.users)
  }, [userState.currentUser, userState.users, setNotificationsForUser])

  return userState
}
