// frontend/src/utils/api.js - Enhanced API utilities
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL.replace("/api", "")}/health`,
      { timeout: 5000 }
    );
    return response.status === 200;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token, user } = response.data;

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  },

  create: async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create category"
      );
    }
  },

  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update category"
      );
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  },
};

// Products API
export const productsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/products");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch products"
      );
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch product");
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post("/products", productData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to create product"
      );
    }
  },

  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to update product"
      );
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to delete product"
      );
    }
  },
};

// Sales API
export const salesAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/sales", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch sales");
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch sale");
    }
  },

  create: async (saleData) => {
    try {
      const response = await api.post("/sales", saleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to create sale");
    }
  },

  getReports: async (period = "today") => {
    try {
      const response = await api.get(`/sales/reports?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch sales reports"
      );
    }
  },
};

// Members API
export const membersAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/members");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch members");
    }
  },

  getById: async (memberId) => {
    try {
      const response = await api.get(`/members/${memberId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch member");
    }
  },

  create: async (memberData) => {
    try {
      const response = await api.post("/members", memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to create member");
    }
  },

  update: async (id, memberData) => {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to update member");
    }
  },

  validate: async (memberId) => {
    try {
      const response = await api.post("/members/validate", { memberId });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Member validation failed"
      );
    }
  },

  updatePurchase: async (id, amount) => {
    try {
      const response = await api.post(`/members/${id}/purchase`, { amount });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to update member purchase"
      );
    }
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch users");
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to create user");
    }
  },

  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to update user");
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to delete user");
    }
  },
};

// Settings API
export const settingsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/settings");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch settings"
      );
    }
  },

  update: async (settingsData) => {
    try {
      const response = await api.put("/settings", settingsData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to update settings"
      );
    }
  },

  reset: async () => {
    try {
      const response = await api.post("/settings/reset");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to reset settings"
      );
    }
  },
};

// Favorites API
export const favoritesAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/favorites");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch favorites"
      );
    }
  },

  update: async (favoriteIds) => {
    try {
      const response = await api.put("/favorites", { favoriteIds });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to update favorites"
      );
    }
  },

  add: async (productId) => {
    try {
      const response = await api.post(`/favorites/add/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to add to favorites"
      );
    }
  },

  remove: async (productId) => {
    try {
      const response = await api.delete(`/favorites/remove/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to remove from favorites"
      );
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch dashboard stats"
      );
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get("/dashboard/activity");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch recent activity"
      );
    }
  },
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Error handler utility
export const handleApiError = (error) => {
  console.error("API Error:", error);

  if (error.response?.status === 401) {
    authAPI.logout();
    window.location.href = "/login";
    return "Session expired. Please login again.";
  }

  if (error.response?.status === 403) {
    return "Access denied. You do not have permission to perform this action.";
  }

  if (error.response?.status === 404) {
    return "Resource not found.";
  }

  if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  }

  return error.message || "An unexpected error occurred.";
};

// Default export for backward compatibility
const apiUtils = {
  authAPI,
  categoriesAPI,
  productsAPI,
  salesAPI,
  membersAPI,
  usersAPI,
  settingsAPI,
  favoritesAPI,
  dashboardAPI,
  testConnection,
  formatCurrency,
  formatDate,
  handleApiError,
};

export default apiUtils;
