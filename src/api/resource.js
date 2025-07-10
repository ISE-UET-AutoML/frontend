import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/service/resource`

const createInstance = () => {
    const body = {
        "task": "string",
        "training_time": 0,
        "presets": "string"
    }
    // return instance.post(`${URL}/instances`, body)
    // For testing
    return {
        "status": 200,
        "data": { 'id': 22812439, 'ssh_port': '54709', 'public_ip': '171.101.232.45', 'deploy_port': '54846' }
    }
}

export {
    createInstance
}