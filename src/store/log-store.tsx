
"use client"

import { create } from 'zustand'
import React, { createContext, useContext, useRef } from 'react';

type LogAction = 
 | 'LOGIN_SUCCESS'
 | 'LOGIN_FAIL'
 | 'LOGOUT'
 | 'ADD_USER'
 | 'UPDATE_USER'
 | 'DELETE_USER'
 | 'ADD_INDICATOR'
 | 'UPDATE_INDICATOR'
 | 'DELETE_INDICATOR'
 | 'ADD_SUBMITTED_INDICATOR'
 | 'UPDATE_SUBMITTED_INDICATOR'
 | 'UPDATE_INDICATOR_STATUS'
 | 'DELETE_SUBMITTED_INDICATOR'
 | 'ADD_INCIDENT'
 | 'UPDATE_INCIDENT'
 | 'DELETE_INCIDENT'


export type SystemLog = {
  id: string;
  timestamp: string;
  user: string;
  action: LogAction;
  details: string;
}

type LogState = {
  logs: SystemLog[];
  fetchLogs: () => Promise<void>;
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
}

const createLogStore = () => create<LogState>()(
  (set, get) => ({
    logs: [],
    fetchLogs: async () => {
      const res = await fetch('/api/logs', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch logs')
      const data: SystemLog[] = await res.json()
      set({ logs: data })
    },
    addLog: (log) => {
      // Fire-and-forget persistence
      ;(async () => {
        try {
          const res = await fetch('/api/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(log) })
          if (res.ok) {
            const created: SystemLog = await res.json()
            set((state) => ({ logs: [created, ...state.logs] }))
            return
          }
        } catch {}
        // Fallback: still record in-memory to avoid losing audit trail in UI
        set((state) => ({
          logs: [
            { ...log, id: `LOG-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString() },
            ...state.logs,
          ],
        }))
      })()
    },
  })
)

const LogStoreContext = createContext<ReturnType<typeof createLogStore> | null>(null);

export const LogStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createLogStore>>();
  if (!storeRef.current) {
    storeRef.current = createLogStore();
  }
  return (
    <LogStoreContext.Provider value={storeRef.current}>
      {children}
    </LogStoreContext.Provider>
  );
};


export const useLogStore = (): LogState => {
  const store = useContext(LogStoreContext);
  if (!store) {
    throw new Error('useLogStore must be used within a LogStoreProvider');
  }
  // This ensures that the component using the store re-renders when the state changes.
  return store(state => state);
};
