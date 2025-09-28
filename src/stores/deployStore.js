import { create } from "zustand";
import { getDeployStatus, getDeployData } from "src/api/deploy";
import { GetUnfinishedDeployment } from "src/api/mlService";

let hasRestored = false;

const useDeployStore = create(
    (set, get) => ({
        deployingTasks: {},

        startDeployTask: (deployId) => {
            // Resume polling (after reload or manual start)
            const pollDeploying = async () => {
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

                setTimeout(pollDeploying, 10000);
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

            pollDeploying()
        },

        restoreDeployingTasks: async () => {
            if (hasRestored) return;
            hasRestored = true;

            try {
                const response = await GetUnfinishedDeployment();
                const unfinishedDeploymentId = response.data;
                console.log("Unfinished deployment id:", unfinishedDeploymentId)
                unfinishedDeploymentId.forEach((id) => {
                    get().startDeployTask(id);
                });
            }
            catch (error) {
                console.log("Failed to load unfinished deployment.", error);
            }
        },

    }),
);


export default useDeployStore;