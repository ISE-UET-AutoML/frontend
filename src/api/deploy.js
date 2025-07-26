import { API_BASE_URL, API_URL } from "src/constants/api";
import instance from "./axios";

const URL = `${API_BASE_URL}/api/service/ml`
const AGGREGATE_URL = `${API_BASE_URL}/api/ml`

const getDeployedModel = (modelId) => {
    return instance.get(`${URL}/database_service/model_deploy_service/all?model_id=${modelId}`)
}

const getAllDeployedModel = (projectId) => {
    return instance.get(`${URL}/database_service/aggregator_service/all_deployed_models?project_id=${projectId}`)
}

const getDeployData = (deployId) => {
    return instance.get(`${URL}/database_service/model_deploy_service/find?deploy_id=${deployId}`)
}

const getDeployStatus = (modelId, deployModelId) => {
    return instance.get(`${AGGREGATE_URL}/model/${modelId}/${deployModelId}/deploy-progress`)
}

export {
    getDeployedModel,
    getAllDeployedModel,
    getDeployData,
    getDeployStatus
}