import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/experiments`

const getTrainingHistory = (experimentName) => {
	return instance.get(
		`${URL}/train-history?experiment_name=${experimentName}`
	)
}

const getExperiment = (experimentName) => {
	return instance.get(`${URL}?name=${experimentName}`)
}

const getAllExperiments = (projectID) => {
	return instance.get(`${URL}/allExperiments?projectID=${projectID}`)
}

const predictData = (experimentName, files) => {
	return instance.post(
		`${URL}/predict/?experiment_name=${experimentName}`,
		files
	)
}

const explainData = (experimentName, file) => {
	return instance.post(
		`${URL}/explain/?experiment_name=${experimentName}`,
		file
	)
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
	getAllExperiments,
	predictData,
	explainData,
	getExperiment,
	deployModel,
	getDeployStatus,
}
