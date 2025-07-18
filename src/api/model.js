import { API_BASE_URL, API_URL } from "src/constants/api";
import instance from "./axios";
import axios from "axios"

const URL = `${API_BASE_URL}/api/service/ml`
const AGGREGATE_URL = `${API_BASE_URL}/api/ml`

const getModels = (projectId) => {
    return instance.get(`${URL}/database_service/aggregator_service/all_models?project_id=${projectId}`)
}

const getModelById = (modelId) => {
    return instance.get(`${URL}/database_service/models_service/find?model_id=${modelId}`)
}

const deployModel = (modelId, instanceInfo) => {
    return instance.post(`${AGGREGATE_URL}/model/${modelId}/deploy`, { instanceInfo })
}

const getDeployStatus = (modelId, deployModelId) => {
    return instance.get(`${AGGREGATE_URL}/model/${modelId}/${deployModelId}/deploy-progress`)
}

const modelPredict = (base_url, formData) => {
    return axios.post(`${base_url}/predict`, formData)
}

export {
    getModels,
    deployModel,
    getDeployStatus,
    modelPredict,
    getModelById,
}