import { API_BASE_URL, API_URL } from "src/constants/api";
import instance from "./axios";

const URL = `${API_BASE_URL}/api/ml`
const proxyURL = `${API_BASE_URL}/api/service/ml`

const getTrainingProgress = (experimentId) => {
    return instance.get(
        `${URL}/experiment/${experimentId}/training-progress`
    )
}

const createModel = (experimentId) => {
    return instance.post(
        `${URL}/experiment/${experimentId}/model/create`
    )
}

const getTrainingMetrics = (experimentId) => {
    return instance.get(
        `${URL}/experiment/${experimentId}/training-metrics`
    )
}

const getFinalMetrics = (experimentId) => {
    return instance.get(
        `${URL}/experiment/${experimentId}/model/metrics`
    )
}

const trainCloudModel = (projectId, payload) => {
    return instance.post(
        `${URL}/project/${projectId}/generic-cloud-training`, payload
    )
}

const getFitHistory = (projectId, experimentName) => {
    console.log(`${URL}/experiment/${experimentName}/fit-history?projectId=${projectId}`)
    return instance.get(
        `${URL}/experiment/${experimentName}/fit-history?projectId=${projectId}`
    )
}

const getModelUrl = (modelId) => {
    return instance.get(
        `${URL}/model/${modelId}/download-model`
    )
}

const getUnfinishedExperiment = () => {
    return instance.get(`${URL}/experiment/unfinished`)
}

const GetUnfinishedDeployment = () => {
    return instance.get(`${URL}/deploy/unfinished`)
}

export {
    getTrainingProgress,
    createModel,
    getTrainingMetrics,
    getFinalMetrics,
    trainCloudModel,
    getFitHistory,
    getUnfinishedExperiment,
    GetUnfinishedDeployment,
    getModelUrl
}