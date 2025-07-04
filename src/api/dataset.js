import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'
const BASE_URL = process.env.REACT_APP_BE_GATEWAY_ADD

// const URL = `${API_BASE_URL}/datasets`
const URL = `${BASE_URL}/api/data`

const createDataset = (formData) => {
	const options = {
		headers: {
			'Content-Type': 'multipart/form-data',
			'x-user-id': 'e2b9c065-69c3-4d21-b198-5b0b9eead5cd',
			'Authorization': '<Bearer> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyYjljMDY1LTY5YzMtNGQyMS1iMTk4LTViMGI5ZWVhZDVjZCIsImVtYWlsIjoiaGlldTEyMzRAZ21haWwuY29tIiwiZnVsbF9uYW1lIjoiaGlldWxvbCIsImlhdCI6MTc1MTQyODQzMiwiZXhwIjoxNzUxNTE0ODMyfQ.kO_CtqT-f6Aiw0H0JZetu911-ADL9hb9DtuuCtKxS5g'
		},
		withCredentials: true,
	}
	return instance.post(`${URL}/createDataset`, formData, options)
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
	getDatasets,
	getDataset,
	getImgDataset,
	getDataTen,
	deleteObjects,
	addNewFiles,
	getDatasetPreview,
	createPresignedUrls,
}
