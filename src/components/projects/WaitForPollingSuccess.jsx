import * as datasetAPI from 'src/api/dataset';

export const WaitForPollingSuccess = (datasetId, timeout = 1000000, interval = 2000) => {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = async () => {
            try {
                const res = await datasetAPI.getDataset(datasetId);
                const dataset = res.data;

                if (dataset.ls_project && dataset.ls_project.label_studio_id) {
                    resolve(dataset);
                    return;
                }

                if (Date.now() - start > timeout) {
                    reject(new Error("Polling timeout"));
                    return;
                }

                setTimeout(check, interval);
            } catch (err) {
                reject(err);
            }
        };

        check();
    });
};