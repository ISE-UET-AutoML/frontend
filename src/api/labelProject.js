import { API_BASE_URL } from 'src/constants/api'
import instance from './axios'
import Cookies from 'universal-cookie'


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
            //'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        //body: JSON.stringify({}),
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

export const uploadToS3 = async (projectID) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    }
    return instance.post(`${URL_SERVICE}/ls-projects/${projectID}/export`, {}, options)
}