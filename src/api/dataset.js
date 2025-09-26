import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'
import Cookies from 'universal-cookie'


const URL = `${API_BASE_URL}/api/data`
const URL_SERVICE = `${API_BASE_URL}/api/service/data`

const createDataset = (payload) => {
    const cookies = new Cookies();
    const userId = cookies.get('x-user-id');
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        // withCredentials: true,
        params: {
            userId: userId,
        }
    }
    return instance.post(`${URL}/createDataset`, payload, options)
}

const initializeDataset = (payload) => {
    const cookies = new Cookies();
    const userId = cookies.get('x-user-id');
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        //withCredentials: true,
        params: {
            userId: userId,
        }
    }
    return instance.post(`${URL}/initialize`, payload, options)
}

const finalizeDataset = (datasetID, payload) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        //withCredentials: true,
    }
    return instance.post(`${URL}/${datasetID}/finalize`, payload, options)
}

const createPresignedUrls = async (payload) => {
    const options = {
        headers: { 'Content-Type': 'application/json' },
    }
    return instance.post(`${URL}/createPresignedUrls`, payload, options)
}

const createPresignedUrlsPredict = async (payload) => {
    const options = {
        headers: { 'Content-Type': 'application/json' },
    }
    return instance.post(`${URL}/createPresignedUrlsPredict`, payload, options)
}

const createDownPresignedUrls = async (key) => {
    const options = {
        headers: { 'Content-Type': 'application/json' },
    }
    return instance.get(`${URL_SERVICE}/presigned-urls/download?key=${key}`, options)
}

const createDownPresignedUrlsForFolder = async (projectId, version = 1) => {
    const options = {
        headers: { 'Content-Type': 'application/json' },
    }
    const params = new URLSearchParams({ project_id: projectId, version })
    return instance.get(`${URL_SERVICE}/presigned-urls/download-folder?${params.toString()}`, options)
}

const createDownZipPU = async (datasetTitle) => {
    const options = {
        headers: { 'Content-Type': 'application/json' },
    }
    return instance.get(`${URL_SERVICE}/presigned-urls/download-zip-files/${datasetTitle}`, options)
}

const getDatasets = (params) => {
    const cookies = new Cookies();
    const userId = cookies.get('x-user-id');
    params = { ...params, userId: userId }
    console.log(`API Call`, params);
    return instance.get(URL, { params })
}

// New: server-side search + pagination for /datasets endpoint
const getDatasetsByQuery = (params) => {
    // Log the full URL and query parameters for debugging
    console.log(`API Call: ${URL}`, params);
    return instance.get(URL, { params });
}

const getDataset = (datasetID) => {
    return instance.get(`${URL_SERVICE}/datasets/${datasetID}`)
}

const getProcessingStatus = (datasetId) => {
    return instance.get(`${URL}/${datasetId}/processing_status`)
};

const getDatasetPreview = (datasetID, size) => {
    return instance.get(`${URL}/${datasetID}/datasetPreview?size=${size}`)
}


const deleteObjects = (datasetID, formData) => {
    return instance.post(`${URL}/${datasetID}/deleteObjects`, formData)
}

const deleteDataset = (datasetID) => {
    return instance.delete(`${URL_SERVICE}/datasets/${datasetID}`)
}

const addNewFiles = (datasetID, formData) => {
    const options = {
        headers: { 'Content-Type': 'multipart/form-data' },
    }
    return instance.post(`${URL}/${datasetID}/addNewFiles`, formData, options)
}

export {
    createDataset,
    getDatasets,
    getDatasetsByQuery,
    getDataset,
    getProcessingStatus,
    deleteObjects,
    deleteDataset,
    addNewFiles,
    getDatasetPreview,
    createPresignedUrls,
    createPresignedUrlsPredict,
    createDownPresignedUrls,
    createDownPresignedUrlsForFolder,
    createDownZipPU,
    initializeDataset,
    finalizeDataset,
}
