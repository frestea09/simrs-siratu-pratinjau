
"use client"

import { create } from 'zustand';
import React, { createContext, useContext, useRef } from 'react';

export type UserRole = 
  | 'Admin Sistem' 
  | 'PIC Mutu' 
  | 'PJ Ruangan' 
  | 'Kepala Unit/Instalasi' 
  | 'Direktur'
  | 'Sub. Komite Peningkatan Mutu'
  | 'Sub. Komite Keselamatan Pasien'
  | 'Sub. Komite Manajemen Risiko';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  unit?: string;
}

type UserState = {
  users: User[];
  currentUser: User | null;
  addUser: (user: Omit<User, 'id'>) => string;
  updateUser: (id: string, data: Partial<Omit<User, 'id'>>) => void;
  removeUser: (id: string) => void;
  setCurrentUser: (user: User) => void;
  clearCurrentUser: () => void;
}

const initialUsers: User[] = [
    { id: 'user-1', name: 'Admin Sistem', email: 'admin@sim.rs', password: '123456', role: 'Admin Sistem' },
    { id: 'user-2', name: 'Delina (PIC Mutu)', email: 'delina@sim.rs', password: '123456', role: 'PIC Mutu', unit: 'PPI' },
    { id: 'user-3', name: 'Deti (PJ Ruangan)', email: 'deti@sim.rs', password: '123456', role: 'PJ Ruangan', unit: 'RANAP' },
    { id: 'user-4', name: 'Devin (Keselamatan Pasien)', email: 'devin@sim.rs', password: '123456', role: 'Sub. Komite Keselamatan Pasien' },
    { id: 'user-5', name: 'Deka (Kepala Unit)', email: 'deka@sim.rs', password: '123456', role: 'Kepala Unit/Instalasi', unit: 'IGD' },
    { id: 'user-6', name: 'Dr. Direktur', email: 'dir@sim.rs', password: '123456', role: 'Direktur' },
    { id: 'user-7', name: 'Dion (Peningkatan Mutu)', email: 'dion@sim.rs', password: '123456', role: 'Sub. Komite Peningkatan Mutu' },
    { id: 'user-8', name: 'Dara (Manajemen Risiko)', email: 'dara@sim.rs', password: '123456', role: 'Sub. Komite Manajemen Risiko' },
]

const createUserStore = () => create<UserState>()(
  (set, get) => ({
    users: initialUsers,
    currentUser: null,
    addUser: (user) => {
      const newId = `user-${Date.now()}-${Math.random()}`;
      const newUser = { ...user, id: newId };
      set((state) => ({
        users: [...state.users, newUser],
      }));
      return newId;
    },
    updateUser: (id, data) => set((state) => ({
      users: state.users.map(u => (u.id === id ? { ...u, ...data } : u)),
    })),
    removeUser: (id) => set((state) => ({
      users: state.users.filter(u => u.id !== id),
    })),
    setCurrentUser: (user) => set({ currentUser: user }),
    clearCurrentUser: () => set({ currentUser: null }),
  })
);

const UserStoreContext = createContext<ReturnType<typeof createUserStore> | null>(null);

export const UserStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<ReturnType<typeof createUserStore>>();
  if (!storeRef.current) {
    storeRef.current = createUserStore();
  }
  return (
    <UserStoreContext.Provider value={storeRef.current}>
      {children}
    </UserStoreContext.Provider>
  );
};

export const useUserStore = (): UserState => {
  const store = useContext(UserStoreContext);
  if (!store) {
    throw new Error('useUserStore must be used within a UserStoreProvider');
  }
  // This ensures that the component using the store re-renders when the state changes.
  return store(state => state);
};
