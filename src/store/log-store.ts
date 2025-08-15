
"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React, { createContext, useContext, useRef } from 'react';

export type SystemLogAction = 
    | 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'LOGOUT'
    | 'ADD_USER' | 'UPDATE_USER' | 'DELETE_USER'
    | 'ADD_INDICATOR' | 'UPDATE_INDICATOR' | 'DELETE_INDICATOR'
    | 'ADD_SUBMITTED_INDICATOR' | 'UPDATE_SUBMITTED_INDICATOR' | 'UPDATE_INDICATOR_STATUS'
    | 'ADD_INCIDENT' | 'UPDATE_INCIDENT'
    | 'ADD_RISK' | 'UPDATE_RISK' | 'DELETE_RISK'
    | 'ADD_NOTIFICATION' | 'READ_NOTIFICATION'

export type SystemLog = {
    id: string;
    timestamp: string;
    user: string;
    action: SystemLogAction;
    details: string;
};

type LogState = {
  logs: SystemLog[];
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
}

const createLogStore = () => create<LogState>()(
  persist(
    (set, get) => ({
      logs: [],
      addLog: (logData) => {
        const newLog = {
          ...logData,
          id: `log-${Date.now()}-${get().logs.length}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));
      },
    }),
    {
      name: 'log-storage',
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

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
  return store();
};
