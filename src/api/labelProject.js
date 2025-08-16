import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'
import Cookies from 'universal-cookie'


const URL = `${API_BASE_URL}/api/data`
const URL_SERVICE = `${API_BASE_URL}/api/service/data`
const LABEL_STUDIO_URL = process.env.REACT_APP_LABEL_STUDIO_URL

export const createLbProject = (payload) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    }
    return instance.post(`${URL}/createLbProject`, payload, options)
}

export const getLbProjects = (ownerId) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
        params: ownerId ? {
            owner_id: ownerId,
        } : {},
    }
    return instance.get(`${URL_SERVICE}/ls-projects/`, options)
}

export const deleteProject = async (projectID) => {
    return instance.delete(`${URL_SERVICE}/ls-projects/${projectID}`)
}


export const getLbProjByTask = (taskType) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
        params: {
            task_type: taskType,
        },
    }

    return instance.get(`${URL_SERVICE}/ls-projects/by-task-type`, options)
}

export const logoutLabelStudio = async () => {
    const cookies = new Cookies();
    const csrfToken = cookies.get('csrftoken');

    if (!csrfToken) {
        console.warn("Label Studio csrftoken không tìm thấy, bỏ qua.");
        return Promise.resolve();
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`http://34.1.194.168:3003/user/logout/`, {
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            signal: signal
        })
        clearTimeout(timeoutId)

        if (!response.status === 200) {
            throw new Error(`Logout khỏi LS thất bại, status: ${response.status}`);
        }
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('Yêu cầu logout khỏi Label Studio đã hết giờ.');
        } else {
            console.error('Lỗi khi logout khỏi Label Studio:', error);
        }
        throw error;
    }
};


export const uploadToS3 = async (projectID) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    }
    return instance.post(`${URL_SERVICE}/ls-projects/${projectID}/export`, {}, options)
}