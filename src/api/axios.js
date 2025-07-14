import axios from 'axios';
import { API_URL } from 'src/constants/api';
import Cookies from 'universal-cookie';
import { message } from 'antd';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

const refreshToken = () => instance.get(API_URL.refresh_token);

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


const LsAxios = axios.create({
    baseURL: process.env.REACT_APP_LABEL_STUDIO_URL || 'http://localhost:8080/', 
    withCredentials: true,
});

export {LsAxios};