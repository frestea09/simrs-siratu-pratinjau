import { eventBus, type NotificationEventPayload } from './realtime-event-bus'

let notifications: NotificationEventPayload[] = []

const shouldInclude = (
  notification: NotificationEventPayload,
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

export function listNotifications(filter: { role?: string | null; unit?: string | null }) {
  return notifications
    .filter((n) => shouldInclude(n, filter))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function addNotification(
  data: Omit<NotificationEventPayload, 'id' | 'timestamp' | 'isRead'>
): NotificationEventPayload {
  const notification: NotificationEventPayload = {
    ...data,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  }

  notifications = [notification, ...notifications]
  eventBus.emit('notification:new', notification)
  return notification
}

export function clearNotifications() {
  notifications = []
}
