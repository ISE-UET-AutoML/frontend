import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/experiments`

const getTrainingHistory = (experimentName) => {
	return instance.get(
		`${URL}/train-history?experiment_name=${experimentName}`
	)
}

const getExperiment = (experimentName) => {
	return instance.get(`${API_BASE_URL}/experiments?name=${experimentName}`)
}

const predictData = (experimentName, files) => {
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

const deployModel = (experimentName, deployType) => {
	return instance.get(
		`${URL}/cloud_deploy?experiment_name=${experimentName}&deploy_type=${deployType}`
	)
}

const getDeployStatus = (experimentName) => {
	return instance.get(
		`${URL}/cloud_deploy_status?experiment_name=${experimentName}`
	)
}

export {
	getTrainingHistory,
	predictData,
	explainData,
	getExperiment,
	deployModel,
	getDeployStatus,
}
