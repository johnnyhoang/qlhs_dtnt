import axios from 'axios';
import { WEB_ENV } from '../config/env';

const client = axios.create({
    baseURL: WEB_ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/admin/login') {
                const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.href = `/admin/login?from=${redirectTo}`;
            }
        }
        return Promise.reject(error);
    }
);

export default client;
