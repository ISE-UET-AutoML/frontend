import { API_BASE_URL, API_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/service/ml`
const AGGREGATE_URL = `${API_BASE_URL}/api/ml`

const getModels = (projectId) => {
	return instance.get(
		`${URL}/database_service/aggregator_service/all_models?project_id=${projectId}`
	)
}

const getModelById = (modelId) => {
	return instance.get(
		`${URL}/database_service/models_service/find?model_id=${modelId}`
	)
}

const getModelByExperimentId = (experimentId) => {
	return instance.get(
		`${URL}/database_service/models_service/find_by_experiment_id?experiment_id=${experimentId}`
	)
}

const deployModel = (modelId) => {
	return instance.post(`${AGGREGATE_URL}/model/${modelId}/deploy`)
}

const modelPredict = (formData, modelId) => {
	return instance.post(`${AGGREGATE_URL}/model/${modelId}/predict`, formData)
}



const predictGenUI = (formData) => {
	return instance.post(`${AGGREGATE_URL}/deploy/predictGenUI`, formData)
}

const feedbackUpdate = (s3_url, feedback) => {
	return instance.post(`${AGGREGATE_URL}/deploy-data/feedback`, {
		s3_url,
		feedback,
	})
}

export {
	getModels,
	deployModel,
	modelPredict,
	predictGenUI,
	getModelById,
	getModelByExperimentId,
	feedbackUpdate,
}
