import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/service/ml/database_service/experiments_service`

const getTrainingHistory = (experimentName) => {
    return instance.get(
        `${URL}/train-history?experiment_name=${experimentName}`
    )
}

const getExperimentById = (experimentId) => {
    return instance.get(`${URL}/find?experiment_id=${experimentId}`)
}

const getExperiment = (experimentName, projectID) => {
    return instance.get(`${URL}/find_by_name?project_id=${projectID}&name=${experimentName}`)
}

const getAllExperiments = (projectID) => {
    return instance.get(`${URL}/all?project_id=${projectID}`)
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
    getExperimentById
}
