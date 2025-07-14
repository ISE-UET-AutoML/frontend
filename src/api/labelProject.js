import Cookies from 'universal-cookie';
import { API_BASE_URL } from 'src/constants/api';
import instance from './axios';


export const logoutLabelStudio = () => {
    const cookies = new Cookies();
    const csrfToken = cookies.get('csrftoken');

    if (!csrfToken) {
        console.warn("Label Studio csrftoken không tìm thấy, bỏ qua bước logout LS.");
        return Promise.resolve();
    }

    const labelStudioUrl = process.env.REACT_APP_LABEL_STUDIO_URL || 'http://localhost:8080';

    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 5000); 

    return fetch(`${labelStudioUrl}/user/logout/`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({}),
        signal: signal
    })
    .then(response => {
        clearTimeout(timeoutId); 
        if (!response.ok) {
            throw new Error(`Logout khỏi LS thất bại, status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        clearTimeout(timeoutId); 
        if (error.name === 'AbortError') {
            console.error('Yêu cầu logout khỏi Label Studio đã hết giờ.');
        } else {
            console.error('Lỗi khi logout khỏi Label Studio:', error);
        }
        throw error;
    });
};


const URL = `${API_BASE_URL}/api/data`;
const URL_SERVICE = `${API_BASE_URL}/api/data`;

export const createLbProject = (payload) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    };
    return instance.post(`${URL}/createLbProject`, payload, options);
};

export const getLabelProjects = () => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    };
    return instance.get(`${URL_SERVICE}/label-projects`, options);
};

export const deleteProject = async (projectID) => {
    return instance.delete(`${URL_SERVICE}/label-projects/${projectID}`);
};

export const getLbProjByTask = (taskType) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
        params: {
            task_type: taskType,
        },
    };
    return instance.get(`${URL_SERVICE}/label-projects/by-task-type`, options);
};
