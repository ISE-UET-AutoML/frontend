import axios from 'axios';
import { API_URL } from 'src/constants/api';
import Cookies from 'universal-cookie';
import { message } from 'antd';

const cookies = new Cookies();

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    // withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor to add auth headers
instance.interceptors.request.use(
    (config) => {
        const cookies = new Cookies();
        const accessToken = cookies.get('accessToken');
        const userId = cookies.get('x-user-id');

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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
    (response) => {
        // Nếu phản hồi thành công (status 2xx), chỉ cần trả về response đó
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Chỉ xử lý khi lỗi là 401 Unauthorized và yêu cầu gốc chưa được thử lại
        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                // Nếu đang trong quá trình làm mới token, thêm yêu cầu vào hàng đợi
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return instance(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 1. GỌI API REFRESH
                console.log("Access Token hết hạn, đang gọi API refresh...");
                // Sử dụng API_URL bạn đã định nghĩa
                const { data } = await instance.post(API_URL.refresh_token);
                const newAccessToken = data.access_token;

                // 2. CẬP NHẬT TOKEN MỚI
                console.log("Nhận được accessToken mới:", newAccessToken);
                cookies.set('accessToken', `<Bearer> ${newAccessToken}`, { path: '/' });
                instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Xử lý hàng đợi (thực thi lại các API đã bị lỗi trước đó)
                processQueue(null, newAccessToken);

                // 3. THỬ LẠI YÊU CẦU CŨ
                console.log("Thử lại yêu cầu gốc:", originalRequest.url);
                return instance(originalRequest);

            } catch (refreshError) {
                console.error("Không thể làm mới token:", refreshError);
                processQueue(refreshError, null);

                // Xóa thông tin đăng nhập và chuyển hướng về trang login
                cookies.remove('accessToken', { path: '/' });
                cookies.remove('refreshToken', { path: '/' });
                window.location.href = '/login'; // Chuyển hướng cứng

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Ghi lại log lỗi cho các trường hợp khác
        console.log('API Error intercepted:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });

        // Trả về lỗi cho các trường hợp khác (không phải 401)
        return Promise.reject(error);
    }
);
export default instance;
