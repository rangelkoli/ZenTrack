import axios from 'axios';

// Create axios instance with base URL
export const apiClient = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
