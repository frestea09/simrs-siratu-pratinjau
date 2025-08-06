
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
 | 'ADD_SUBMITTED_INDICATOR'
 | 'UPDATE_SUBMITTED_INDICATOR'
 | 'UPDATE_INDICATOR_STATUS'
 | 'ADD_INCIDENT'
 | 'UPDATE_INCIDENT'
 | 'ADD_SPM'
 | 'UPDATE_SPM'

export type SystemLog = {
  id: string;
  timestamp: string;
  user: string;
  action: LogAction;
  details: string;
}

type LogState = {
  logs: SystemLog[];
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
}

const createLogStore = () => create<LogState>()(
    (set) => ({
        logs: [],
        addLog: (log) =>
            set((state) => ({
            logs: [
                {
                ...log,
                id: `LOG-${Date.now()}-${Math.random()}`,
                timestamp: new Date().toISOString(),
                },
                ...state.logs,
            ],
            })),
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
