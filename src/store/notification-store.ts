
"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React, { createContext, useContext, useRef } from 'react';
import type { UserRole } from './user-store';

export type Notification = {
  id: string;
  title: string;
  description: string;
  link?: string;
  timestamp: string;
  isRead: boolean;
  recipientRole?: UserRole; // Target a specific role
  recipientUnit?: string; // Target a specific unit
};

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  _recalculateUnreadCount: () => void;
}

const createNotificationStore = () => create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      _recalculateUnreadCount: () => {
        const count = get().notifications.filter(n => !n.isRead).length;
        set({ unreadCount: count });
      },

      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}-${get().notifications.length}`,
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        set(state => ({ notifications: [newNotification, ...state.notifications] }));
        get()._recalculateUnreadCount();
      },

      markAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
        get()._recalculateUnreadCount();
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        }));
        get()._recalculateUnreadCount();
      },
      
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

const NotificationStoreContext = createContext<ReturnType<typeof createNotificationStore> | null>(null);

export const NotificationStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createNotificationStore>>();
  if (!storeRef.current) {
    storeRef.current = createNotificationStore();
  }
  return (
    <NotificationStoreContext.Provider value={storeRef.current}>
      {children}
    </NotificationStoreContext.Provider>
  );
};

export const useNotificationStore = (): NotificationState => {
  const store = useContext(NotificationStoreContext);
  if (!store) {
    throw new Error('useNotificationStore must be used within a NotificationStoreProvider');
  }
  return store();
};
