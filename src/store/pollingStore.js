import { create } from 'zustand';

export const usePollingStore = create((set, get) => ({
    pendingLabelProjects: [],
    addPending: (item) => set(state => ({
        pendingLabelProjects: [...state.pendingLabelProjects, item]
    })),
    removePending: (datasetId) => set(state => ({
        pendingLabelProjects: state.pendingLabelProjects.filter(p => p.dataset.id !== datasetId)
    })),
    setPending: (queue) => set({ pendingLabelProjects: queue }),
})); 