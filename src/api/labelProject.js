import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'

const URL = `${API_BASE_URL}/api/data`
const URL_SERVICE = `${API_BASE_URL}/api/service/data`

export const createLbProject = (payload) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    }
    return instance.post(`${URL}/createLbProject`, payload, options)
}

export const getLbProjects = () => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    }
    return instance.get(`${URL_SERVICE}/ls-projects/`, options)
}

export const deleteProject = async (projectID) => {
    return instance.delete(`${URL_SERVICE}/ls-projects/${projectID}`)
}