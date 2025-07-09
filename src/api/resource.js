import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/service/resource`

const createInstance = () => {
    const body = {
        "task": "string",
        "training_time": 0,
        "presets": "string"
    }
    return instance.post(`${URL}/instances`, body)
    // For testing
    // return {
    //     "status": 200,
    //     "data": { 'id': 22774288, 'ssh_port': '54209', 'public_ip': '171.101.232.45', 'deploy_port': '54577' }
    // }
}

export {
    createInstance
}