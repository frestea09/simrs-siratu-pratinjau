
"use client";

import React, { createContext, useContext, useRef } from 'react';
import DashboardClientLayout from '@/components/dashboard-layout-client';
import type { User } from '@/store/user-store';
import { useUserStore } from '@/store/user-store';
import { useIndicatorStore } from '@/store/indicator-store';
import { useIncidentStore } from '@/store/incident-store';
import { useRiskStore } from '@/store/risk-store';
import { useLogStore } from '@/store/log-store';
import { useNotificationStore } from '@/store/notification-store';

const UserStoreContext = createContext(null);
const IndicatorStoreContext = createContext(null);
const IncidentStoreContext = createContext(null);
const RiskStoreContext = createContext(null);
const LogStoreContext = createContext(null);
const NotificationStoreContext = createContext(null);

export const UserStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef();
  if (!storeRef.current) {
    // @ts-ignore
    storeRef.current = useUserStore();
  }
  return (
    // @ts-ignore
    <UserStoreContext.Provider value={storeRef.current}>
      {children}
    </UserStoreContext.Provider>
  );
};
export const IndicatorStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const storeRef = useRef();
    if (!storeRef.current) {
        // @ts-ignore
        storeRef.current = useIndicatorStore();
    }
    return (
        // @ts-ignore
        <IndicatorStoreContext.Provider value={storeRef.current}>
            {children}
        </IndicatorStoreContext.Provider>
    );
}

export const IncidentStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const storeRef = useRef();
    if (!storeRef.current) {
        // @ts-ignore
        storeRef.current = useIncidentStore();
    }
    return (
        // @ts-ignore
        <IncidentStoreContext.Provider value={storeRef.current}>
            {children}
        </IncidentStoreContext.Provider>
    );
}

export const RiskStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const storeRef = useRef();
    if (!storeRef.current) {
        // @ts-ignore
        storeRef.current = useRiskStore();
    }
    return (
        // @ts-ignore
        <RiskStoreContext.Provider value={storeRef.current}>
            {children}
        </RiskStoreContext.Provider>
    );
}

export const LogStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const storeRef = useRef();
    if (!storeRef.current) {
        // @ts-ignore
        storeRef.current = useLogStore();
    }
    return (
        // @ts-ignore
        <LogStoreContext.Provider value={storeRef.current}>
            {children}
        </LogStoreContext.Provider>
    );
}

export const NotificationStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const storeRef = useRef();
    if (!storeRef.current) {
        // @ts-ignore
        storeRef.current = useNotificationStore();
    }
    return (
        // @ts-ignore
        <NotificationStoreContext.Provider value={storeRef.current}>
            {children}
        </NotificationStoreContext.Provider>
    );
}

export default function DashboardLayout({
  children,
  user
}: {
  children: React.ReactNode
  user: User | null
}) {
  return (
    <UserStoreProvider>
      <IndicatorStoreProvider>
        <IncidentStoreProvider>
          <RiskStoreProvider>
            <LogStoreProvider>
              <NotificationStoreProvider>
                <DashboardClientLayout user={user}>{children}</DashboardClientLayout>
              </NotificationStoreProvider>
            </LogStoreProvider>
          </RiskStoreProvider>
        </IncidentStoreProvider>
      </IndicatorStoreProvider>
    </UserStoreProvider>
  );
}
