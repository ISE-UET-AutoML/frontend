import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePollingStore = create(
    persist(
        (set, get) => ({
            pendingLabelProjects: [],
            addPending: (item) => set(state => ({
                pendingLabelProjects: [...state.pendingLabelProjects, item]
            })),
            removePending: (datasetId) => set(state => ({
                pendingLabelProjects: state.pendingLabelProjects.filter(p => p.dataset.id !== datasetId)
            })),
            setPending: (queue) => set({ pendingLabelProjects: queue }),
        }),
        {
            name: 'polling-store', // Tên key trong localStorage
            getStorage: () => localStorage, // Chỉ định sử dụng localStorage
        }
    )
);