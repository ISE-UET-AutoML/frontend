import { API_URL } from 'src/constants/api';
import instance from './axios';

const uploadFiles = (projectID, files) => {
    const options = {
        headers: { 'Content-Type': 'multipart/form-data' },
    };
    return instance.post(API_URL.upload_file(projectID), files, options);
};

const listImages = (projectID, queryString = '&page=1&size=24') => {
    return instance.get(`/images?project_id=${projectID}${queryString}`);
};

const trainModel = (projectID) => {
    return instance.post(API_URL.train_model(projectID));
};

export { listImages, trainModel, uploadFiles };
