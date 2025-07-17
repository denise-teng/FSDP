import axios from 'axios';

const axiosInstance = axios.create({ 
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api',
    withCredentials: true, // send cookies to server
});

// Adding a request interceptor to log requests
axiosInstance.interceptors.request.use(config => {
  console.log('Making request to:', config.baseURL + config.url);
  return config;
});

export default axiosInstance;
