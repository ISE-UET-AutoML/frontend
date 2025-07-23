import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { getTrainingProgress, getTrainingMetrics, createModel } from "src/api/mlService";

let hasRestored = false;

// Calculate elapsed time based on current time and start time
const calculateElapsedTime = (startTimeValue) => {
    if (!startTimeValue) return 0

    const currentTime = new Date()
    return ((currentTime - startTimeValue) / (1000 * 60)).toFixed(2)
}

const useTrainingStore = create(persist(
    (set, get) => ({
        trainingTasks: {},

        startTrainingTask: (experimentId) => {
            const existingTask = get().trainingTasks[experimentId];
            const startTime = existingTask?.startTime ? new Date(existingTask.startTime) : new Date();
            let accuracyTrend = existingTask?.accuracyTrend || [];
            // Resume polling (after reload or manual start)
            const pollTraining = async () => {
                try {
                    const res = await getTrainingProgress(experimentId);
                    console.log("Training progress:", res);

                    if (res.status === 422 || res.status === 500) {
                        return;
                    }

                    if (res.status === 200) {
                        const data = res.data;
                        const elapsed = calculateElapsedTime(startTime);
                        const progress = data.expected_training_time
                            ? Math.min((elapsed / (data.expected_training_time / 60)) * 100, 100)
                            : 0;

                        let trainingInfo = {};
                        let valMetric = null;

                        if (data.status === 'SETTING_UP' || data.status === 'DOWNLOADING_DATA') {
                            console.log("Downloading dependencies...")
                        }

                        if (data.status === 'TRAINING' | data.status === 'DONE') {
                            const metrics = await getTrainingMetrics(experimentId);
                            const latestEpoch = metrics.data.step.at(-1) || 0;
                            const accuracy = metrics.data.val_score.at(-1) || 0;

                            accuracyTrend = [
                                ...accuracyTrend,
                                {
                                    time: parseFloat(elapsed),
                                    accuracy: accuracy
                                },
                            ]
                            trainingInfo = { latestEpoch, accuracy };
                            valMetric = metrics.data.val_metric;
                        }

                        if (data.status === 'DONE') {
                            console.log("Finish training! Creating model.");
                            set((state) => ({
                                trainingTasks: {
                                    ...state.trainingTasks,
                                    [experimentId]: {
                                        ...state.trainingTasks[experimentId],
                                        status: 'DONE',
                                        elapsed,
                                        progress: 100,
                                        trainingInfo,
                                        accuracyTrend
                                    },
                                },
                            }));
                            await createModel(experimentId);
                            return; // Stop polling
                        }

                        set((state) => ({
                            trainingTasks: {
                                ...state.trainingTasks,
                                [experimentId]: {
                                    ...state.trainingTasks[experimentId],
                                    status: data.status,
                                    elapsed: parseFloat(elapsed),
                                    progress: parseFloat(progress.toFixed(1)),
                                    trainingInfo,
                                    accuracyTrend,
                                    valMetric,
                                    startTime: startTime.toISOString(),
                                    expectedTrainingTime: data.expected_training_time,
                                },
                            },
                        }));
                    }
                } catch (err) {
                    console.error(err);
                    return;
                }

                setTimeout(pollTraining, 5000);
            };

            // Initial setup
            set((state) => ({
                trainingTasks: {
                    ...state.trainingTasks,
                    [experimentId]: {
                        experimentId,
                        trainingInfo: {},
                        chartData: [],
                        elapsed: 0,
                        progress: 0,
                        status: 'SETTING_UP',
                        ...state.trainingTasks[experimentId],
                    },
                },
            }));

            pollTraining()
        },

        restoreTrainingTasks: () => {
            if (hasRestored) return;
            hasRestored = true;

            const tasks = get().trainingTasks;
            Object.entries(tasks).forEach(([experimentId, task]) => {
                // Only rerun if status != DONE and != FAILED
                if (task.status !== 'DONE' && task.status !== 'FAILED') {
                    get().startTrainingTask(experimentId);
                }
            });
        },

    }),

    {
        name: 'training-storage', // key in localStorage
        partialize: (state) => ({
            trainingTasks: state.trainingTasks,
        }),
    }
));


export default useTrainingStore;