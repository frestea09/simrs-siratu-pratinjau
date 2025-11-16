"use client"

import { useEffect, useRef } from "react"
import type { User } from "@/store/user-store"
import { useIndicatorStore } from "@/store/indicator-store"
import { useNotificationStore } from "@/store/notification-store"

export function useRealtimeEvents(currentUser: User | null) {
  const indicatorStore = useIndicatorStore()
  const notificationStore = useNotificationStore()
  const {
    upsertProfileFromServer,
    removeProfileFromServer,
    upsertSubmittedIndicatorFromServer: upsertSubmittedIndicator,
    removeSubmittedIndicatorFromServer: removeSubmittedIndicator,
  } = indicatorStore
  const {
    setFilter: setNotificationFilter,
    fetchNotifications,
    receiveNotification,
    clearNotifications,
  } = notificationStore
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    setNotificationFilter(currentUser)
    if (currentUser) {
      fetchNotifications().catch((error) => {
        console.error('Failed to fetch notifications', error)
      })
    } else {
      clearNotifications()
    }
  }, [currentUser, setNotificationFilter, fetchNotifications, clearNotifications])

  useEffect(() => {
    if (eventSourceRef.current) {
      return
    }

    const source = new EventSource('/api/realtime')
    eventSourceRef.current = source

    source.addEventListener('profile:created', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        upsertProfileFromServer(data)
      } catch (error) {
        console.error('Failed to process profile creation event', error)
      }
    })

    source.addEventListener('profile:updated', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        upsertProfileFromServer(data)
      } catch (error) {
        console.error('Failed to process profile update event', error)
      }
    })

    source.addEventListener('profile:deleted', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        if (data?.id) {
          removeProfileFromServer(data.id)
        }
      } catch (error) {
        console.error('Failed to process profile deletion event', error)
      }
    })

    source.addEventListener('submittedIndicator:created', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        upsertSubmittedIndicator(data)
      } catch (error) {
        console.error('Failed to process indicator creation event', error)
      }
    })

    source.addEventListener('submittedIndicator:updated', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        upsertSubmittedIndicator(data)
      } catch (error) {
        console.error('Failed to process indicator update event', error)
      }
    })

    source.addEventListener('submittedIndicator:deleted', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        if (data?.id) {
          removeSubmittedIndicator(data.id)
        }
      } catch (error) {
        console.error('Failed to process indicator deletion event', error)
      }
    })

    source.addEventListener('notification:new', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        receiveNotification(data)
      } catch (error) {
        console.error('Failed to process notification event', error)
      }
    })

    source.onerror = (error) => {
      console.error('Realtime connection error', error)
    }

    return () => {
      source.close()
      eventSourceRef.current = null
    }
  }, [
    upsertProfileFromServer,
    removeProfileFromServer,
    upsertSubmittedIndicator,
    removeSubmittedIndicator,
    receiveNotification,
  ])
}
