import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ENV_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.kita.sanchez.ph';

type StoreState = {
    apiBaseUrl: string;
    setApiBaseUrl: (url: string) => void;
    isOfflineMode: boolean;
    setMode: (offline: boolean) => void;
    token: string | null;
    setToken: (token: string | null) => void;
};

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            apiBaseUrl: ENV_API_URL,
            setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
            isOfflineMode: false,
            setMode: (offline) => set({
                isOfflineMode: offline,
                apiBaseUrl: offline ? 'http://localhost:8080' : ENV_API_URL,
            }),
            token: null,
            setToken: (token) => set({ token }),
        }),
        {
            name: 'kita-storage',
            // Always override apiBaseUrl from env on rehydration — prevents
            // stale cloud URL from localStorage blocking local dev.
            merge: (persisted, current) => ({
                ...current,
                ...(persisted as Partial<StoreState>),
                apiBaseUrl: ENV_API_URL,
            }),
        }
    )
);
