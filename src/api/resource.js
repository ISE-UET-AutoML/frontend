import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/resource`

const createInstance = (createInstancePayload) => {
    return instance.post(`${URL}/select_instance`, createInstancePayload)
    // For testing
    // return {
    //     "status": 200,
    //     "data": { 'id': 22812439, 'ssh_port': '54709', 'public_ip': '171.101.232.45', 'deploy_port': '54846' }
    // }
}

export {
    createInstance
}