import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle unauthorized errors (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized, please login again.');
            localStorage.removeItem('token');
            // window.location.href = '/login'; // Or handle via React state
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export default apiClient;
