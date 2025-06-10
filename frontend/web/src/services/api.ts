import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response: any) => response,
  (error: { response: { status: number } }) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// Auth API
export const loginAdmin = (email: string, password: string) => {
  return api.post("/admin/login", { email, password });
};

// Products API
export const getProducts = (params?: any) => {
  return api.get("/admin/products", { params });
};

export const getProduct = (id: string) => {
  return api.get(`/admin/products/${id}`);
};

export const createProduct = (data: any) => {
  return api.post("/admin/products", data);
};

export const updateProduct = (id: string, data: any) => {
  return api.put(`/admin/products/${id}`, data);
};

export const deleteProduct = (id: string) => {
  return api.delete(`/admin/products/${id}`);
};

// Orders API
export const getOrders = (params?: any) => {
  return api.get("/admin/orders", { params });
};

export const getOrder = (id: string) => {
  return api.get(`/admin/orders/${id}`);
};

export const updateOrderStatus = (
  id: string,
  status: string,
  notes?: string,
) => {
  return api.put(`/admin/orders/${id}`, { status, notes });
};

// Shipping API
export const getShippings = (params?: any) => {
  return api.get("/admin/shipping", { params });
};

export const updateShippingStatus = (
  id: string,
  status: string,
  trackingInfo?: any,
) => {
  return api.put(`/admin/shipping/${id}`, { status, trackingInfo });
};

// Returns API
export const getReturns = (params?: any) => {
  return api.get("/admin/returns", { params });
};

export const getReturn = (id: string) => {
  return api.get(`/admin/returns/${id}`);
};

export const updateReturnStatus = (
  id: string,
  status: string,
  notes?: string,
) => {
  return api.put(`/admin/returns/${id}`, { status, notes });
};

// Dashboard API
export const getDashboardStats = () => {
  return api.get("/admin/dashboard/stats");
};

export default api;
