import { API_URL, API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/resource`
const URL_SERVICE = `${API_BASE_URL}/api/service/resource`

const createInstance = (createInstancePayload) => {
    return instance.post(`${URL}/select_instance/`, createInstancePayload)
    // For testing
    // return {
    //     "data": {
    //         "id": 22922951,
    //         "ssh_port": "10242",
    //         "public_ip": "142.214.185.62",
    //         "deploy_port": "23685",
    //         "creating_time": 60
    //     },
    //     "status": 200
    // }
}

const createInstanceForDeploy = () => {
    return instance.post(`${URL}/select_instance_for_deploy`)
}

const deleteInstance = (instanceID) => {
    return instance.delete(`${URL}/instances/${instanceID}`)
}

const checkInstanceStatus = (instanceID) => {
    return instance.post(`${URL_SERVICE}/instances/${instanceID}/check_status`)
}

export {
    createInstance, createInstanceForDeploy, deleteInstance, checkInstanceStatus
}