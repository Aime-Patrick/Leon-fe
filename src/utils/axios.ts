import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVICE_URL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
  withCredentials: true
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Set content type based on data type
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Check if we got a new access token
    const newToken = response.headers['x-new-access-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  },
  // (error) => {
  //   if (error.response?.status === 401) {
  //     // Clear the token and redirect to login
  //     localStorage.removeItem('token');
  //     localStorage.removeItem('user');
  //     window.location.href = '/login';
  //   }
  //   return Promise.reject(error);
  // }
);

export default axiosInstance;