import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =================================
   REQUEST INTERCEPTOR
   Attach JWT automatically
================================ */

api.interceptors.request.use(
  (config) => {

    config.headers = config.headers || {};

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

/* =================================
   RESPONSE INTERCEPTOR
   Global error handling
================================ */

api.interceptors.response.use(

  (response) => response,

  (error) => {

    const status = error?.response?.status;

    /* -----------------------------
       TOKEN EXPIRED / INVALID
    ----------------------------- */

  if (status === 401) {

  console.warn("Auth expired. Redirecting to login.");

  localStorage.removeItem("token");
  localStorage.removeItem("authToken");

  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }

}
    /* -----------------------------
       SAFE 404 HANDLING
       (used by season API sometimes)
    ----------------------------- */

    if (status === 404) {
      console.warn("API resource not found:", error?.config?.url);
    }

    return Promise.reject(error);

  }
);

export default api;