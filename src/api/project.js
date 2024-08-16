import { API_URL, API_BASE_URL } from 'src/constants/api';
import instance from './axios';

const uploadFiles = (projectID, files) => {
    const options = {
        headers: { 'Content-Type': 'multipart/form-data' },
    };
    return instance.post(API_URL.upload_file(projectID), files, options);
};

const listImages = (projectID, queryString = '&page=1&size=24') => {
    return instance.get(`${API_BASE_URL}/images?project_id=${projectID}${queryString}`);
};

const trainModel = (projectID) => {
    return instance.post(API_URL.train_model(projectID));
};

const updateData = (projectID) => {
    return "test";
}
const getProjectDataset = (projectID) => {
    return instance.get(API_URL.get_project_dataset(projectID));
}

const getProjectById = (projectID) => {
    return instance.get(`${API_BASE_URL}/projects/${projectID}`);
}

const explainInstance = (projectID, data) => {
    const options = {
        headers: { 'Content-Type': 'multipart/form-data' },
    };

    return instance.post(API_URL.explain_instance(projectID), data, options);
}

const deleteProject = (projectID) => {
    return instance.delete(API_URL.delete_project(projectID));
}

export { listImages, trainModel, uploadFiles, getProjectDataset, getProjectById, updateData, explainInstance, deleteProject };
