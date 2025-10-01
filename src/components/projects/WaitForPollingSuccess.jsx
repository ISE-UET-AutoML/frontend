import * as datasetAPI from 'src/api/dataset';

export const WaitForPollingSuccess = async (datasetId, interval = 5000) => {
    while (true) {
        try {
            const res = await datasetAPI.getDataset(datasetId);
            const dataset = res.data;

            if (dataset.ls_project && dataset.ls_project.label_studio_id) {
                return dataset;
            }
        } catch (err) {
            throw err; 
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }
};
