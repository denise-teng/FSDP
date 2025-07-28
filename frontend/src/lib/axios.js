import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('Request Configuration:', {
    baseURL: config.baseURL,
    FullURL: config.baseURL + config.url,
    url: config.url,
    fullPath: config.baseURL + config.url,
    method: config.method,
    headers: config.headers,
    token_Exists: !!token,
    data: config.data
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('[AXIOS] Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor
axiosInstance.interceptors.response.use(
  response => {
    console.groupCollapsed(`[AXIOS] Response: ${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Headers:', response.headers);
    console.groupEnd();
    return response;
  },
  async error => {
    const originalRequest = error.config;

    console.groupCollapsed(`[AXIOS] Error: ${error.config?.url}`);
    console.log('Status:', error.response?.status);
    console.log('Error Data:', error.response?.data);
    console.log('Config:', error.config);
    console.log('Is Retry:', originalRequest._retry);
    console.groupEnd();

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Attempting token refresh...");

      try {
        const refreshResponse = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const newToken = refreshResponse.data.token;
        localStorage.setItem('token', newToken);
        console.log("New Token Retrieved:", newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        sessionStorage.clear();

        // Use store action for consistent state management
        if (useUserStore?.getState()?.logout) {
          useUserStore.getState().logout();
        }

        if (!window.location.pathname.includes('/login')) {
          console.log('[AUTH] Redirecting to login');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;