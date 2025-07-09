import { API_BASE_URL, API_URL } from "src/constants/api";
import instance from "./axios";
import axios from "axios"

const URL = `${API_BASE_URL}/api/service/ml`
const AGGREGATE_URL = `${API_BASE_URL}/api/ml`

const getModels = (projectId) => {
    return instance.get(`${URL}/database_service/aggregator_service/all_models?project_id=${projectId}`)
}

const deployModel = (modelId, instanceInfo) => {
    return instance.post(`${AGGREGATE_URL}/model/${modelId}/deploy`, { instanceInfo })
}

const getDeployStatus = (modelId, deployModelId, instanceInfo) => {
    return instance.post(`${AGGREGATE_URL}/model/${modelId}/${deployModelId}/deploy-progress`, { instanceInfo })
}

// Currently hard coded
const uploadData = (formData) => {
    return instance.post(`http://localhost:10550/model_service/train/file_upload`, formData)
}

// Currently hard coded
const modelPredict = (base_url, task, task_id, files, text_col) => {
    if (task == 'TEXT_CLASSIFICATION') {
        return axios.post(`${base_url}/predict`, {
            "userEmail": "string",
            "projectName": "string",
            "runName": "string",
            "task": task,
            "task_id": task_id,
            "text_file_path": `/root/UploadedFile/${task_id}/${files[0].name}`,
            "text_col": text_col || "sentence"
        })
    }
    else if (task === "IMAGE_CLASSIFICATION") {
        const file_path = files.map((file) => `/root/UploadedFile/${task_id}/${file.name}`)
        return axios.post(`${base_url}/predict`, {
            "userEmail": "string",
            "projectName": "string",
            "runName": "string",
            "task": task,
            "task_id": task_id,
            "images": file_path
        })
    }
}

export {
    getModels,
    deployModel,
    getDeployStatus,
    uploadData,
    modelPredict
}