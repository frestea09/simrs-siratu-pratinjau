"use client"

import { create } from "zustand"
import React, { createContext, useContext, useRef } from "react"
import type { User } from "./user-store.tsx"

export type Notification = {
  id: string
  timestamp: string
  title: string
  description: string
  isRead: boolean
  link?: string
  recipientRole?: string
  recipientUnit?: string
}

type NotificationState = {
  notifications: Notification[]
  unreadCount: number
  filter: { role?: string | null; unit?: string | null }
  fetchNotifications: () => Promise<void>
  setFilter: (user: User | null) => void
  receiveNotification: (notification: Notification) => void
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const shouldInclude = (
  notification: Notification,
  filter: { role?: string | null; unit?: string | null }
) => {
  const matchesRole = !notification.recipientRole || !filter.role
    ? true
    : notification.recipientRole === filter.role
  const matchesUnit = !notification.recipientUnit || !filter.unit
    ? true
    : notification.recipientUnit === filter.unit
  return matchesRole && matchesUnit
}

const createNotificationStore = () =>
  create<NotificationState>()((set, get) => ({
    notifications: [],
    unreadCount: 0,
    filter: {},
    fetchNotifications: async () => {
      const { filter } = get()
      const params = new URLSearchParams()
      if (filter.role) params.set('role', filter.role)
      if (filter.unit) params.set('unit', filter.unit)
      const query = params.toString()
      const res = await fetch(`/api/notifications${query ? `?${query}` : ''}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error('Failed to load notifications')
      }
      const data: Notification[] = await res.json()
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.isRead).length,
      })
    },
    setFilter: (user) => {
      const nextFilter = {
        role: user?.role ?? undefined,
        unit: user?.unit ?? undefined,
      }
      set({ filter: nextFilter })
    },
    receiveNotification: (notification) => {
      const { filter, notifications } = get()
      if (!shouldInclude(notification, filter)) {
        return
      }
      const exists = notifications.some((n) => n.id === notification.id)
      const updated = exists
        ? notifications.map((n) => (n.id === notification.id ? notification : n))
        : [notification, ...notifications]
      set({
        notifications: updated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        unreadCount: updated.filter((n) => !n.isRead).length,
      })
    },
    addNotification: (notificationData) => {
      void (async () => {
        try {
          const res = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationData),
          })
          if (!res.ok) {
            console.error('Failed to create notification')
            return
          }
          const created: Notification = await res.json()
          get().receiveNotification(created)
        } catch (error) {
          console.error('Failed to create notification', error)
        }
      })()
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
  }))

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

export function useNotificationStore<T = NotificationState>(
  selector?: (state: NotificationState) => T
) {
  const store = useContext(NotificationStoreContext)
  if (!store) {
    throw new Error(
      "useNotificationStore must be used within a NotificationStoreProvider"
    )
  }
  const selected = store(selector ?? ((s: NotificationState) => s as unknown as T))
  return selected
}
