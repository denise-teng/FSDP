import axios from 'axios';

const axiosInstance = axios.create({ 
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api',
    withCredentials: true, // send cookies to server
    timeout: 30000
});

// Request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('Request Configuration:', {
    baseURL: config.baseURL,
    url: config.url,
    method: config.method,
    token_Exists: !!token
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('[AXIOS] Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor - simplified to avoid conflicts with useUserStore
axiosInstance.interceptors.response.use(
  response => {
    console.log(`[AXIOS] Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  error => {
    console.error(`[AXIOS] Error: ${error.config?.url} - Status: ${error.response?.status}`);
    return Promise.reject(error);
  }
);

export default axiosInstance;