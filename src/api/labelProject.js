import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Label Project API endpoints
export const getLabelProjects = async (params = {}) => {
    const response = await api.get('/label-projects', { params })
    return response
}

export const getLabelProjectById = async (id) => {
    const response = await api.get(`/label-projects/${id}`)
    return response
}

export const createLabelProject = async (projectData) => {
    const response = await api.post('/label-projects', projectData)
    return response
}

export const updateLabelProject = async (id, projectData) => {
    const response = await api.put(`/label-projects/${id}`, projectData)
    return response
}

export const deleteLabelProject = async (id) => {
    const response = await api.delete(`/label-projects/${id}`)
    return response
}

// Label Project Items API endpoints
export const getLabelProjectItems = async (projectId, params = {}) => {
    const response = await api.get(`/label-projects/${projectId}/items`, { params })
    return response
}

export const updateLabelProjectItem = async (projectId, itemId, labelData) => {
    const response = await api.put(`/label-projects/${projectId}/items/${itemId}`, labelData)
    return response
}

export const bulkUpdateLabels = async (projectId, updates) => {
    const response = await api.post(`/label-projects/${projectId}/items/bulk-update`, { updates })
    return response
}

// Label Project Statistics
export const getLabelProjectStats = async (projectId) => {
    const response = await api.get(`/label-projects/${projectId}/stats`)
    return response
}

// Export labeled data
export const exportLabeledData = async (projectId, format = 'json') => {
    const response = await api.get(`/label-projects/${projectId}/export`, {
        params: { format },
        responseType: 'blob'
    })
    return response
}

// Assign collaborators
export const assignCollaborators = async (projectId, collaborators) => {
    const response = await api.post(`/label-projects/${projectId}/collaborators`, { collaborators })
    return response
}

export const getCollaborators = async (projectId) => {
    const response = await api.get(`/label-projects/${projectId}/collaborators`)
    return response
}

// Label validation and quality control
export const validateLabels = async (projectId, validationRules) => {
    const response = await api.post(`/label-projects/${projectId}/validate`, validationRules)
    return response
}

export const getInterAnnotatorAgreement = async (projectId) => {
    const response = await api.get(`/label-projects/${projectId}/agreement`)
    return response
}