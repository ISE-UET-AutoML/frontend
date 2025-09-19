import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/service/ml/database_service/experiment_configs_service`

const getExperimentConfig = (experimentId) => {
    return instance.get(`${URL}/all?experiment_id=${experimentId}`)
}

export {
    getExperimentConfig
}