import axios from "axios";

// Read API URL from Vite environment variable with safe localhost fallback
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to automatically attach authorization token
api.interceptors.request.use(
  (config) => {
    // Check for admin token or user token
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    // If request is targeting admin routes or admin is logged in and header not already set
    if (config.url?.startsWith("/admin") || (adminToken && !userToken)) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred. Please try again.",
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

// ==========================================
// AUTH API
// ==========================================
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
};


// ==========================================
// ADMIN API
// ==========================================
export const adminAPI = {
  login: (credentials) => api.post("/admin/login", credentials),
};

// ==========================================
// PRODUCTS API
// ==========================================
export const productAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ==========================================
// ORDERS API
// ==========================================
export const orderAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getMyOrders: () => api.get("/orders/my-orders"),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) =>
    api.put(`/orders/${id}/cancel`, { reason }),
  // Admin order management
  getAllOrders: (params) => api.get("/orders", { params }),
  updateStatus: (id, orderStatus) =>
    api.put(`/orders/${id}/status`, { orderStatus }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ==========================================
// HEALTH API
// ==========================================
export const healthAPI = {
  check: () => api.get("/health"),
};

export default api;
