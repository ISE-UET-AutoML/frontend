import axios from 'src/api/axios'
import { API_URL } from 'src/constants/api'

export const getMe = () => axios.get(API_URL.me)

export const getUsers = () => {
	const baseURL = process.env.REACT_APP_API_URL
	console.log('Fetching users from:', `${baseURL}/api/service/users`)
	return axios.get(`${baseURL}/api/service/users`)
}

// Get all projects
export const getAllProjects = () => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(`${baseURL}/api/service/users/all-projects`)
}

// Get single user by ID
export const getUserById = (userId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(`${baseURL}/api/service/users/${userId}`)
}

// Get user info by ID
export const getUserInfo = (userId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.post(`${baseURL}/api/service/users/user-info`, {
		user_id: userId,
	})
}

// Get user projects by user ID
export const getUserProjects = (userId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.post(`${baseURL}/api/service/users/projects/user`, { userId })
}

// Get total datasets for a user
export const getUserDatasets = (userId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.post(`${baseURL}/api/service/data/datasets/list`, {
		owner_id: userId,
	})
}

// Get experiments for a user
export const getUserExperiments = (userId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(`${baseURL}/api/service/experiments?user_id=${userId}`)
}

// Get models for a user
export const getUserModels = (userId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(`${baseURL}/api/service/models?user_id=${userId}`)
}

// Get deployed models for a user
export const getUserModelDeploys = (userId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(`${baseURL}/api/service/model_deploys?user_id=${userId}`)
}

// Get datasets by project ID
export const getDatasetsByProjectId = (projectId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(`${baseURL}/api/service/datasets?project_id=${projectId}`)
}

// Get all experiments by project ID
export const getExperimentsByProjectId = (projectId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(
		`${baseURL}/api/service/ml/database_service/experiments_service/all?project_id=${projectId}`
	)
}

// Get all models by experiment ID
export const getModelsByExperimentId = (experimentId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(
		`${baseURL}/api/service/ml/database_service/models_service/all?experiment_id=${experimentId}`
	)
}

// Get all model deploys by model ID
export const getModelDeploysByModelId = (modelId) => {
	const baseURL = process.env.REACT_APP_API_URL
	return axios.get(
		`${baseURL}/api/service/ml/database_service/model_deploy_service/all?model_id=${modelId}`
	)
}
