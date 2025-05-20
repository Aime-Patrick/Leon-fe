import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVICE_URL,
  headers: {
        "ngrok-skip-browser-warning": "69420",
      },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers["Content-Type"] =
      config.data instanceof FormData ? "multipart/form-data" : "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;