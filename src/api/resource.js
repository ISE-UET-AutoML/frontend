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
        "data": { 'id': 22808891, 'ssh_port': '62081', 'public_ip': '116.43.148.85', 'deploy_port': '62013' }
    }
}

export {
    createInstance
}