import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/data`
const URL_SERVICE = `${API_BASE_URL}/api/service/data`

const createDataset = (payload) => {
	const options = {
		headers: {
			'Content-Type': 'application/json',
		},
		withCredentials: true,
	}
	return instance.post(`${URL}/createDataset`, payload, options)
}


const createPresignedUrls = async (payload) => {
	const options = {
		headers: { 'Content-Type': 'application/json' },
	}
	return instance.post(`${URL}/createPresignedUrls`, payload, options)
}

const getDatasets = () => {
	return instance.get(URL)
}

const getDataset = (datasetID) => {
	return instance.get(`${URL}/${datasetID}`)
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
	getDataset,
	getProcessingStatus,
	deleteObjects,
	deleteDataset,
	addNewFiles,
	getDatasetPreview,
	createPresignedUrls,
}
