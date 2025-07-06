import { API_BASE_URL, API_URL } from "src/constants/api";
import instance from "./axios";

const URL = `${API_BASE_URL}/api/ml`
const proxyURL = `${API_BASE_URL}/api/service/ml`

const getTrainingProgress = (experimentId, instanceInfo) => {
    return instance.post(
        `${URL}/experiment/${experimentId}/training-progress`, { instanceInfo }
    )
}

const getTrainingMetrics = (payload) => {
    return instance.post(
        `${proxyURL}/model_service/train/training_metrics`,
        payload
    )
}

const trainCloudModel = (projectId, payload) => {
    return instance.post(
        `${URL}/project/${projectId}/generic-cloud-training`, payload
    )
}

export {
    getTrainingProgress,
    getTrainingMetrics,
    trainCloudModel
}