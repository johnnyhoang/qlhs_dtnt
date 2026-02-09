import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    if (import.meta.env.DEV) {
        baseURL = 'http://localhost:8080/api';
    } else {
        throw new Error("VITE_API_URL is not defined");
    }
}

const client = axios.create({
    baseURL,
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
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
