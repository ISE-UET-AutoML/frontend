import { create } from "zustand";
import { getDeployStatus, getDeployData } from "src/api/deploy";
import { GetUnfinishedDeployment } from "src/api/mlService";

let hasRestored = false;

const useDeployStore = create(
    (set, get) => ({
        deployingTasks: {},
        activeTimers: {}, // deployId -> timeout id
        shouldPoll: false,

        enablePolling: () => set({ shouldPoll: true }),
        disablePolling: () => {
            // Clear all active timers and stop polling globally
            const timers = get().activeTimers || {}
            Object.values(timers).forEach((t) => {
                try { clearTimeout(t) } catch { }
            })
            set({ shouldPoll: false, activeTimers: {} })
        },

        stopDeployTask: (deployId) => {
            const timers = get().activeTimers || {}
            const timer = timers[deployId]
            if (timer) {
                try { clearTimeout(timer) } catch { }
                set((state) => {
                    const next = { ...state.activeTimers }
                    delete next[deployId]
                    return { activeTimers: next }
                })
            }
        },

        startDeployTask: (deployId) => {
            // Avoid duplicate polling chains for the same deployId
            if (get().activeTimers?.[deployId]) return
            // Skip if this deploy already ONLINE in store state
            const current = get().deployingTasks?.[deployId]
            if (current?.status === 'ONLINE') return
            // Resume polling (after reload or manual start)
            const pollDeploying = async () => {
                // Stop if polling disabled or store not ready
                if (!get().shouldPoll) return;
                try {
                    const deployDataRes = await getDeployData(deployId)
                    const modelId = deployDataRes.data.model_id
                    const res = await getDeployStatus(modelId, deployId);
                    console.log("Deploying progress:", res);

                    if (res.status === 422 || res.status === 500) {
                        return;
                    }

                    if (res.status === 200) {
                        const data = res.data;
                        if (data.status === 'ONLINE') {
                            console.log("Finish deploying!");
                            set((state) => ({
                                deployingTasks: {
                                    ...state.deployingTasks,
                                    [deployId]: {
                                        ...state.deployingTasks[deployId],
                                        ...data,
                                        status: 'ONLINE',
                                    },
                                },
                            }));
                            // Clear timer for this deployId when ONLINE
                            get().stopDeployTask(deployId)
                            return; // Stop polling
                        }

                        set((state) => ({
                            deployingTasks: {
                                ...state.deployingTasks,
                                [deployId]: {
                                    ...state.deployingTasks[deployId],
                                    ...data,
                                    status: data.status,
                                },
                            },
                        }));
                    }
                } catch (err) {
                    console.error(err);
                    return;
                }

                if (get().shouldPoll) {
                    const timerId = setTimeout(pollDeploying, 10000);
                    set((state) => ({
                        activeTimers: {
                            ...state.activeTimers,
                            [deployId]: timerId,
                        }
                    }))
                }
            };

            // Initial setup
            set((state) => ({
                deployingTasks: {
                    ...state.deployingTasks,
                    [deployId]: {
                        ...state.deployingTasks[deployId],
                        deployId,
                        status: 'SETTING_UP',
                    },
                },
            }));

            if (get().shouldPoll) {
                pollDeploying()
            }
        },

        restoreDeployingTasks: async () => {
            if (hasRestored) return;
            hasRestored = true;

            try {
                const response = await GetUnfinishedDeployment();
                const unfinishedDeploymentId = response.data;
                console.log("Unfinished deployment id:", unfinishedDeploymentId)
                if (get().shouldPoll) {
                    unfinishedDeploymentId.forEach((id) => {
                        get().startDeployTask(id);
                    });
                }
            }
            catch (error) {
                console.log("Failed to load unfinished deployment.", error);
            }
        },

    }),
);


export default useDeployStore;