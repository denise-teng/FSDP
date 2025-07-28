import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000
});

// Request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
    console.log('Request Configuration:', {
    baseURL: config.baseURL,
    url: config.url,
    fullPath: config.baseURL + config.url,
    method: config.method,
    data: config.data
  });
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
axiosInstance.interceptors.response.use(
  response => {
    console.log('Response:', response); // Log successful response
    return response;
  },
  async error => {
    console.log('Error:', error.response); // Log error response
    const originalRequest = error.config;
    
    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Attempting token refresh...");
      
      try {
        // Attempt token refresh
        const refreshResponse = await axios.post('/auth/refresh', {}, { 
          withCredentials: true 
        });
        
        const newToken = refreshResponse.data.token;
        localStorage.setItem('token', newToken);
        console.log("New Token Retrieved:", newToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed - clear storage and redirect
        localStorage.removeItem('token');
        sessionStorage.clear();
        
        // Use store action for consistent state management
        useUserStore.getState().logout();
        
        // Redirect only if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;