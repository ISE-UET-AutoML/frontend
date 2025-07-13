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
    //     "data": {
    //         "id": 22922951,
    //         "ssh_port": "10242",
    //         "public_ip": "142.214.185.62",
    //         "deploy_port": "23685"
    //     },
    //     "status": 200
    // }
}

export {
    createInstance
}