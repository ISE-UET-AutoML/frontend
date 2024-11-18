import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/datasets`

const createDataset = (formData) => {
	const options = {
		headers: { 'Content-Type': 'multipart/form-data' },
	}

	return instance.post(`${URL}`, formData, options)
}

const getDatasets = () => {
	return instance.get(URL)
}

const getDataset = (datasetID) => {
	return instance.get(`${URL}/${datasetID}`)
}

export { createDataset, getDatasets, getDataset }
