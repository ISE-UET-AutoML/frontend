import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const getTrainingHistory = (experimentName) => {
	return instance.get(
		`${API_BASE_URL}/experiments/train-history?experiment_name=${experimentName}`
	)
}

const predictImages = (experimentName, files) => {
	console.log('vao duoc API')
	// const options = {
	// 	headers: { 'Content-Type': 'multipart/form-data' },
	// }
	return instance.post(API_URL.predict_images(experimentName), files)
}

const explainImages = (experimentName, file) => {
	// const options = {
	// 	headers: { 'Content-Type': 'multipart/form-data' },
	// }
	return instance.post(API_URL.explain_images(experimentName), file)
}

export { getTrainingHistory, predictImages, explainImages }
