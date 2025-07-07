import axios from 'axios'
import Cookies from 'universal-cookie'
import { LsAxios } from './axios'
const API_BASE_URL = 'http://localhost:3001/api'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})
const cookies = new Cookies()
// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = cookies.get('accessToken') || localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = token;
    }
    return config   
})

export const logoutLabelStudio = () => {
    const cookies = new Cookies();
    const csrfToken = cookies.get('csrftoken');

    if (!csrfToken) {
        console.warn("Label Studio csrftoken không tìm thấy, bỏ qua.");
        return Promise.resolve();
    }

    // Tạo một AbortController để có thể hủy yêu cầu
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => controller.abort(), 5000);

    return fetch(`${process.env.REACT_APP_LABEL_STUDIO_URL}/user/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({}),
        signal: signal // Gắn signal vào yêu cầu
    })
    .then(response => {
        // Xóa timeout nếu yêu cầu thành công
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`Logout khỏi LS thất bại, status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        // Xóa timeout và xử lý lỗi
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('Yêu cầu logout khỏi Label Studio đã hết giờ.');
        } else {
            console.error('Lỗi khi logout khỏi Label Studio:', error);
        }
        throw error;
    });
};
//export const logoutLabelStudio = () => {
  //  return LsAxios.post('/user/logout/')
//};

// Label Project API endpoints
export const getLabelProjects = async (params = {}) => {
    const response = await api.get('/data/label-projects', { params });
    return response.data; 
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