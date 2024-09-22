import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const getTrainingHistory = (experimentName) => {
	return instance.get(
		`${API_BASE_URL}/experiments/train-history?experiment_name=${experimentName}`
	)
}

const getExperiment = (experimentName) => {
	return instance.get(`${API_BASE_URL}/experiments?name=${experimentName}`)
}

const predictData = (experimentName, files) => {
	console.log('vao duoc API')
	// const options = {
	// 	headers: { 'Content-Type': 'multipart/form-data' },
	// }
	return instance.post(API_URL.predict_data(experimentName), files)
}

const explainData = (experimentName, file) => {
	// const options = {
	// 	headers: { 'Content-Type': 'multipart/form-data' },
	// }
	return instance.post(API_URL.explain_data(experimentName), file)
}

export { getTrainingHistory, predictData, explainData, getExperiment }
