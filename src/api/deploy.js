import { API_BASE_URL, API_URL } from "src/constants/api";
import instance from "./axios";

const URL = `${API_BASE_URL}/api/service/ml`

const getDeployedModel = (modelId) => {
    return instance.get(`${URL}/database_service/model_deploy_service/all?model_id=${modelId}`)
}

const getAllDeployedModel = (projectId) => {
    return instance.get(`${URL}/database_service/aggregator_service/all_deployed_models?project_id=${projectId}`)
}

export {
    getDeployedModel,
    getAllDeployedModel
}