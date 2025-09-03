import axios from 'axios';
import { API_URL } from 'src/constants/api';
import Cookies from 'universal-cookie';
import { message } from 'antd';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

const refreshToken = () => instance.get(API_URL.refresh_token);

// Request interceptor to add auth headers
instance.interceptors.request.use(
    (config) => {
        const cookies = new Cookies();
        const accessToken = cookies.get('accessToken');
        const userId = cookies.get('x-user-id');
        
        if (accessToken) {
            // Remove the '<Bearer> ' prefix if it exists and add proper Bearer format
            const token = accessToken.replace('<Bearer> ', '');
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (userId) {
            config.headers['x-user-id'] = userId;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    async (response) => {
        const config = response.config;
        if (
            config.url.indexOf('/login') >= 0 ||
            config.url.indexOf('/refresh-token') >= 0
        ) {
            return response;
        }
        const status = response.status;
        if (status && status === 200) {
            if (response.msg === 'jwt expired') {
                Cookies.remove('accessToken');
                const { accessToken } = (await refreshToken()).data;
                if (accessToken) {
                    Cookies.set('accessToken', accessToken, { path: '/' });
                    return response;
                }
            }
        }
        return response;
    },
    (err) => {
        // Ngăn chặn hiển thị uncaught error trong console
        console.log('API Error intercepted:', {
            status: err.response?.status,
            data: err.response?.data,
            url: err.config?.url
        });

        return Promise.reject(err);
    }
);

// Global error handler cho các axios instance khác
const setupGlobalErrorHandler = () => {
    // Interceptor cho instance chính
    axios.interceptors.response.use(
        response => response,
        error => {
            console.log('Global axios error intercepted:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url
            });
            return Promise.reject(error);
        }
    );
};

// Khởi tạo global error handler
setupGlobalErrorHandler();

export default instance;
