import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   Attach JWT automatically
================================ */

api.interceptors.request.use(
  (config) => {

    // ensure headers object exists
    config.headers = config.headers || {};

    // support both token names
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

  },
  (error) => Promise.reject(error)
);

export default api;