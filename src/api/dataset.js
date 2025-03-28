import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/datasets`

const createDataset = (formData) => {
	const options = {
		headers: { 'Content-Type': 'multipart/form-data' },
	}
	return instance.post(`${URL}`, formData, options)
}
const createImgDataset = (formData) => {
	const options = {
		headers: { 'Content-Type': 'multipart/form-data' },
	}
	return instance.post(`${URL}/createImg`, formData, options)
}

const getDatasets = () => {
	return instance.get(URL)
}

const getDataset = (datasetID) => {
	return instance.get(`${URL}/${datasetID}`)
}

const getImgDataset = (datasetID) => {
	return instance.get(`${URL}/${datasetID}/getImgDataset`)
}

const getDatasetPreview = (datasetID, size) => {
	return instance.get(`${URL}/${datasetID}/datasetPreview?size=${size}`)
}

const getDataTen = (datasetID) => {
	return instance.get(`${URL}/${datasetID}/dataTen`)
}

const deleteObjects = (datasetID, formData) => {
	return instance.post(`${URL}/${datasetID}/deleteObjects`, formData)
}

const addNewFiles = (datasetID, formData) => {
	const options = {
		headers: { 'Content-Type': 'multipart/form-data' },
	}
	return instance.post(`${URL}/${datasetID}/addNewFiles`, formData, options)
}

export {
	createDataset,
	createImgDataset,
	getDatasets,
	getDataset,
	getImgDataset,
	getDataTen,
	deleteObjects,
	addNewFiles,
	getDatasetPreview,
}
