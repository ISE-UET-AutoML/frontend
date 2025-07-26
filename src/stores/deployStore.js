import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { getDeployStatus } from "src/api/deploy";

let hasRestored = false;

const useDeployStore = create(persist(
    (set, get) => ({
        deployingTasks: {},

        startDeployTask: (modelId, deployId) => {
            // Resume polling (after reload or manual start)
            const pollDeploying = async () => {
                try {
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

                setTimeout(pollDeploying, 5000);
            };

            // Initial setup
            set((state) => ({
                deployingTasks: {
                    ...state.deployingTasks,
                    [deployId]: {
                        ...state.deployingTasks[deployId],
                        deployId,
                        modelId,
                        status: 'SETTING_UP',
                    },
                },
            }));

            pollDeploying()
        },

        restoreDeployingTasks: () => {
            if (hasRestored) return;
            hasRestored = true;

            const tasks = get().deployingTasks;
            Object.entries(tasks).forEach(([deployId, task]) => {
                // Only rerun if status != ONLINE and != FAILED
                const { modelId, status } = task
                if (status !== 'ONLINE' && status !== 'FAILED') {
                    get().startDeployTask(modelId, deployId);
                }
            });
        },

    }),

    {
        name: 'deploying-storage', // key in localStorage
        partialize: (state) => ({
            deployingTasks: state.deployingTasks,
        }),
    }
));


export default useDeployStore;