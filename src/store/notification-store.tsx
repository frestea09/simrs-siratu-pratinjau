"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { shallow } from "zustand/shallow"
import React, { createContext, useContext, useRef } from "react"
import type { User, UserRole } from "./user-store.tsx"

export type Notification = {
  id: string
  timestamp: string
  title: string
  description: string
  isRead: boolean
  link?: string
  recipientRole?: UserRole
  recipientUnit?: string
}

type NotificationState = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  setNotificationsForUser: (user: User | null, allUsers: User[]) => void
}

const createNotificationStore = () =>
  create<NotificationState>()(
    persist(
      (set, get) => ({
        notifications: [],
        unreadCount: 0,
        addNotification: (notificationData) => {
          const newNotification: Notification = {
            ...notificationData,
            id: `notif-${Date.now()}`,
            timestamp: new Date().toISOString(),
            isRead: false,
          }

          // This logic should ideally be on a server.
          // We are adding it to the global store, and then the user's
          // local store will filter it.
          const allNotifications = [...get().notifications, newNotification]

          set({
            notifications: allNotifications,
            unreadCount: allNotifications.filter((n) => !n.isRead).length,
          })
        },
        markAsRead: (id) => {
          set((state) => {
            const newNotifications = state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            )
            return {
              notifications: newNotifications,
              unreadCount: newNotifications.filter((n) => !n.isRead).length,
            }
          })
        },
        markAllAsRead: () => {
          set((state) => {
            const newNotifications = state.notifications.map((n) => ({
              ...n,
              isRead: true,
            }))
            return {
              notifications: newNotifications,
              unreadCount: 0,
            }
          })
        },
        clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
        setNotificationsForUser: (user, allUsers) => {
          if (!user) {
            set({ notifications: [], unreadCount: 0 })
            return
          }

          // This is a global store, so we need to get ALL notifications
          // and then filter them for the current user. This is a hack for client-side state.
          const allNotifications = get().notifications

          const userNotifications = allNotifications
            .filter((n) => {
              // Sent to a specific role
              if (n.recipientRole && user.role === n.recipientRole) return true
              // Sent to a specific unit (and the user is part of that unit)
              if (n.recipientUnit && user.unit === n.recipientUnit) return true
              // Global notification (no recipient specified)
              if (!n.recipientRole && !n.recipientUnit) return true

              return false
            })
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )

          set({
            notifications: userNotifications,
            unreadCount: userNotifications.filter((n) => !n.isRead).length,
          })
        },
      }),
      {
        name: "notification-storage",
        storage: createJSONStorage(() => localStorage), // Use localStorage to persist across sessions
      }
    )
  )

// --- React Context for the store ---

const NotificationStoreContext = createContext<ReturnType<
  typeof createNotificationStore
> | null>(null)

export const NotificationStoreProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const storeRef = useRef<ReturnType<typeof createNotificationStore>>()
  if (!storeRef.current) {
    storeRef.current = createNotificationStore()
  }
  return (
    <NotificationStoreContext.Provider value={storeRef.current}>
      {children}
    </NotificationStoreContext.Provider>
  )
}

// Custom hook to use the store with optional selector and shallow equality
export function useNotificationStore<T = NotificationState>(
  selector?: (state: NotificationState) => T
) {
  const store = useContext(NotificationStoreContext)
  if (!store) {
    throw new Error(
      "useNotificationStore must be used within a NotificationStoreProvider"
    )
  }
  return store(selector ?? ((s) => s as unknown as T), shallow)
}
